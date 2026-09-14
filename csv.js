export function parseCsv(text) {
  const records = [];
  let record = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        field += character;
      }
    } else if (character === '"') {
      quoted = true;
    } else if (character === ",") {
      record.push(field);
      field = "";
    } else if (character === "\n") {
      record.push(field.replace(/\r$/, ""));
      records.push(record);
      record = [];
      field = "";
    } else {
      field += character;
    }
  }

  if (quoted) throw new Error("閉じていないダブルクォートがあります。");
  if (field || record.length) {
    record.push(field.replace(/\r$/, ""));
    records.push(record);
  }
  if (!records.length) return { headers: [], rows: [] };

  const headers = records
    .shift()
    .map((header, index) =>
      (index ? header : header.replace(/^\uFEFF/, "")).trim(),
    );
  const rows = records
    .filter((values) => values.some((value) => value.trim()))
    .map((values, index) => {
      if (values.length !== headers.length) {
        throw new Error(
          `${index + 2}行目の列数が${values.length}個です。${headers.length}個必要です。`,
        );
      }
      return Object.fromEntries(
        headers.map((header, column) => [header, values[column].trim()]),
      );
    });

  return { headers, rows };
}
