import fs from "fs";
import path from "path";

const booksPath = path.join(process.cwd(), "src/data/books.json");
const books = JSON.parse(fs.readFileSync(booksPath, "utf8"));

const bookIndex = books.findIndex((b: any) => b.id === "diem-hen-lich-su");

if (bookIndex !== -1) {
  const book = books[bookIndex];
  const oldPages = book.pages;
  const newPages: any = {};

  // Get all keys as numbers and sort them
  const keys = Object.keys(oldPages)
    .map(Number)
    .sort((a, b) => a - b);

  if (keys.length > 0) {
    const minPage = keys[0];
    const offset = minPage - 1;

    console.log(`Renumbering pages for "${book.title}". Min page: ${minPage}, Offset: ${offset}`);

    for (const key of keys) {
      const newKey = (key - offset).toString();
      newPages[newKey] = oldPages[key.toString()];
    }

    book.pages = newPages;
    // Update totalPages if it's based on the max page number
    book.totalPages = keys.length;

    fs.writeFileSync(booksPath, JSON.stringify(books, null, 2), "utf8");
    console.log("Successfully renumbered pages.");
  } else {
    console.log("No pages found for the book.");
  }
} else {
  console.error('Book "diem-hen-lich-su" not found.');
}
