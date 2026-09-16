export function setupShredEgg() {
  const trigger = document.querySelector("[data-shred-trigger]");
  if (!trigger) return;
  let clicks = 0;
  let resetTimer;
  trigger.addEventListener("click", () => {
    clicks += 1;
    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => (clicks = 0), 1800);
    if (clicks < 4) return;
    clicks = 0;
    clearTimeout(resetTimer);
    shredPage();
  });
}

function shredPage() {
  if (document.querySelector(".page-shredder")) return;
  const shredder = document.createElement("div");
  shredder.className = "page-shredder";
  shredder.setAttribute("role", "status");
  shredder.setAttribute("aria-live", "polite");
  const strips = Array.from({ length: 24 }, (_, index) => {
    const offset = -46 + index * 4;
    const turn = -7 + ((index * 11) % 15);
    const length = 25 + ((index * 7) % 6);
    return `<span style="--strip:${index};--strip-x:${offset}px;--strip-turn:${turn}deg;--strip-length:${length}vh"></span>`;
  }).join("");
  shredder.innerHTML = `<div class="shred-machine" aria-hidden="true">
    <div class="shred-machine-top"><span>404 PAGE SHREDDER</span><i></i><i></i></div>
    <div class="shred-slot"></div>
    <div class="shred-strips">${strips}</div>
  </div>
  <div class="shred-complete">
    <strong>404は細断されました。</strong>
    <small>ページの残り容量：0 byte</small>
    <button type="button" data-shred-restore>ページを再構成する</button>
  </div>`;
  document.body.append(shredder);
  document.body.classList.add("shredding-page");
  shredder
    .querySelector("[data-shred-restore]")
    .addEventListener("click", () => {
      document.body.classList.remove("shredding-page");
      shredder.remove();
    });
}
