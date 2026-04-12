const fs = require("fs");
const path = require("path");

const jsonPath = path.resolve(__dirname, "../src/data/books.json");
const books = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

const updatedBooks = books.map((book) => {
  const allText = Object.values(book.pages || {}).join(" ");
  const wordCount = allText.trim().split(/\s+/).length;
  const estimatedReadTime = Math.ceil(wordCount / 200);
  return {
    ...book,
    estimatedReadTime,
  };
});

fs.writeFileSync(jsonPath, JSON.stringify(updatedBooks, null, 2), "utf8");
console.log("Updated books.json with estimatedReadTime");
