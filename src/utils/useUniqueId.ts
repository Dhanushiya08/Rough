// export function generateUniqueID(): string {
//   const now = new Date();

//   const base = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(
//     2,
//     "0",
//   )}${String(now.getDate()).padStart(2, "0")}${String(now.getHours()).padStart(
//     2,
//     "0",
//   )}${String(now.getMinutes()).padStart(
//     2,
//     "0",
//   )}${String(now.getSeconds()).padStart(2, "0")}`;

//   const random = Math.floor(Math.random() * 1000);

//   return `${base}-${random}`;
// }
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

  const storedUser = localStorage.getItem("loggedInUser");

  let userName = "unknown";

  if (storedUser) {
    try {
      const parsedUser = JSON.parse(storedUser);

      const username = parsedUser?.username || "";

      userName = username.includes("@")
        ? username.split("@")[0]
        : username || "unknown";
    } catch (error) {
      console.error("Invalid loggedInUser data", error);
    }
  }

  const random = Math.floor(Math.random() * 1000);

  return `${base}-${userName}-${random}`;
}
