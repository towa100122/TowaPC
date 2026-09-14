export const dataFiles = [
  ["site", "/data/site.csv"],
  ["products", "/data/products.csv"],
  ["news", "/data/news.csv"],
  ["partners", "/data/partners.csv"],
  ["members", "/data/members.csv"],
];

export const csvSchemas = {
  "site.csv": ["key", "value"],
  "products.csv": [
    "id",
    "name",
    "category",
    "type",
    "description",
    "color",
    "image",
    "links",
  ],
  "news.csv": ["id", "date", "tag", "title", "body", "image", "links"],
  "partners.csv": ["name", "role", "description", "image", "url"],
  "members.csv": ["name", "role", "description", "image", "url"],
};

export const requiredFields = {
  "products.csv": ["id", "name", "category", "type", "description"],
  "news.csv": ["id", "date", "tag", "title", "body"],
  "partners.csv": ["name", "role", "description"],
  "members.csv": ["name", "role", "description"],
};

export const productTypeLabels = {
  app: "アプリケーション",
  web: "Webサービス",
  project: "開発プロジェクト",
};

export const productTypes = Object.keys(productTypeLabels);
export const productColors = ["pink", "lavender", "mint", "cream", "peach"];

export const newsTagLabels = {
  new: "NEW",
  important: "重要",
  release: "リリース",
  update: "更新",
};

export const directSiteKeys = [
  "logo",
  "hero",
  "headline",
  "description",
  "joinUrl",
  "contactUrl",
];

export const requiredSiteKeys = [
  ...directSiteKeys,
  "socials.youtube",
  "socials.x",
  "socials.discord",
  "labels.youtube",
  "labels.x",
  "labels.discord",
  "labels.contact",
];

export const nonEmptySiteKeys = requiredSiteKeys.filter(
  (key) => key !== "joinUrl",
);
