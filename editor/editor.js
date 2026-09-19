const labels = {
  news: "News",
  products: "Products",
  site: "サイト基本情報",
  history: "History",
  members: "Members",
  partners: "Cooperation",
  contacts: "Contacts",
  terms: "利用規約",
  privacy: "プライバシーポリシー",
};
let state;
let current = "news";
const dataset = document.querySelector("#dataset");
const editor = document.querySelector("#editor");
const status = document.querySelector("#status");

function setStatus(message) {
  status.textContent = message;
}
async function request(path, options) {
  const response = await fetch(path, options);
  const result = await response.json();
  if (!response.ok)
    throw new Error(result.error || result.output || "処理に失敗しました。");
  return result;
}
function fieldControl(row, field, index) {
  const wrapper = document.createElement("div");
  wrapper.className = `field ${["body", "description", "value", "links", "attachments"].includes(field) ? "wide" : ""}`;
  const label = document.createElement("label");
  label.textContent = field;
  label.htmlFor = `${field}-${index}`;
  wrapper.append(label);
  const options = state.options[field];
  let control;
  if (options) {
    control = document.createElement("select");
    for (const [value, text] of Object.entries(options))
      control.add(new Option(text, value));
  } else if (
    ["body", "description", "value", "links", "attachments"].includes(field)
  )
    control = document.createElement("textarea");
  else {
    control = document.createElement("input");
    control.type = field === "date" ? "text" : "text";
  }
  control.id = `${field}-${index}`;
  control.value = row[field] || "";
  control.addEventListener("input", () => (row[field] = control.value));
  wrapper.append(control);
  if (field === "image" || (current === "news" && field === "attachments")) {
    const upload = document.createElement("input");
    upload.type = "file";
    if (field === "image") upload.accept = "image/*";
    upload.addEventListener("change", async () => {
      if (!upload.files[0]) return;
      const form = new FormData();
      form.set("kind", field === "image" ? "image" : "attachment");
      form.set("file", upload.files[0]);
      setStatus("アップロード中…");
      try {
        const result = await request("/api/upload", {
          method: "POST",
          body: form,
        });
        row[field] =
          field === "image"
            ? result.path
            : [row[field], `${result.name}|${result.path}`]
                .filter(Boolean)
                .join(";;");
        control.value = row[field];
        setStatus(
          `${result.path}へ追加しました。保存するとCSVへ反映されます。`,
        );
      } catch (error) {
        setStatus(error.message);
      }
    });
    wrapper.append(upload);
  }
  return wrapper;
}
function render() {
  document.querySelector("#title").textContent = labels[current];
  document.querySelector("#file").textContent =
    current in state.documents
      ? `data/${current}.md`
      : `data/${current === "news" ? "news" : current}.csv`;
  editor.replaceChildren();
  const add = document.querySelector("#add");
  if (current in state.documents) {
    add.hidden = true;
    const textarea = document.createElement("textarea");
    textarea.className = "document";
    textarea.value = state.documents[current];
    textarea.addEventListener(
      "input",
      () => (state.documents[current] = textarea.value),
    );
    editor.append(textarea);
    return;
  }
  add.hidden = false;
  const file = current === "news" ? "news.csv" : `${current}.csv`;
  const headers = state.schemas[file];
  state.datasets[current].forEach((row, index) => {
    const card = document.createElement("article");
    card.className = "row";
    headers.forEach((field) => card.append(fieldControl(row, field, index)));
    const actions = document.createElement("div");
    actions.className = "row-actions";
    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "削除";
    remove.addEventListener("click", () => {
      state.datasets[current].splice(index, 1);
      render();
    });
    actions.append(remove);
    card.append(actions);
    editor.append(card);
  });
}
async function load() {
  state = await request("/api/state");
  for (const name of [
    ...Object.keys(state.datasets),
    ...Object.keys(state.documents),
  ])
    dataset.add(new Option(labels[name], name));
  dataset.value = current;
  render();
}
dataset.addEventListener("change", () => {
  current = dataset.value;
  render();
});
document.querySelector("#add").addEventListener("click", () => {
  const file = current === "news" ? "news.csv" : `${current}.csv`;
  state.datasets[current].push(
    Object.fromEntries(state.schemas[file].map((field) => [field, ""])),
  );
  render();
});
document.querySelector("#save").addEventListener("click", async () => {
  setStatus("保存中…");
  try {
    const body =
      current in state.documents
        ? { kind: "document", name: current, content: state.documents[current] }
        : { kind: "dataset", name: current, rows: state.datasets[current] };
    const result = await request("/api/save", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    setStatus(`${result.file}を保存しました。`);
  } catch (error) {
    setStatus(error.message);
  }
});
document.querySelector("#check").addEventListener("click", async () => {
  setStatus("整形・ページ生成・検査を実行中…");
  try {
    const result = await request("/api/check", { method: "POST" });
    setStatus(result.output);
  } catch (error) {
    setStatus(error.message);
  }
});
load().catch((error) => setStatus(error.message));
