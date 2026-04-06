export function generateUniqueID(): string {
  const now = new Date();

  const base = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(
    2,
    "0",
  )}${String(now.getDate()).padStart(2, "0")}${String(now.getHours()).padStart(
    2,
    "0",
  )}${String(now.getMinutes()).padStart(
    2,
    "0",
  )}${String(now.getSeconds()).padStart(2, "0")}`;

  const random = Math.floor(Math.random() * 1000);

  return `${base}-${random}`;
}
