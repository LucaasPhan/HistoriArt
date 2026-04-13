import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const booksPath = path.join(process.cwd(), 'src/data/books.json');

if (!fs.existsSync(booksPath)) {
    console.error(`File not found: ${booksPath}`);
    process.exit(1);
}

const books = JSON.parse(fs.readFileSync(booksPath, 'utf8'));

const bookIndex = books.findIndex((b) => b.id === 'diem-hen-lich-su');

if (bookIndex !== -1) {
  const book = books[bookIndex];
  const oldPages = book.pages;
  const newPages = {};
  
  // Get all keys as numbers and sort them
  const keys = Object.keys(oldPages).map(Number).sort((a, b) => a - b);
  
  if (keys.length > 0) {
    const minPage = keys[0];
    const offset = minPage - 1;
    
    console.log(`Renumbering pages for "${book.title}". Min page: ${minPage}, Offset: ${offset}`);
    
    for (const key of keys) {
      const newKey = (key - offset).toString();
      newPages[newKey] = oldPages[key.toString()];
    }
    
    book.pages = newPages;
    // Update totalPages to the number of actual pages in the object
    book.totalPages = keys.length;
    
    fs.writeFileSync(booksPath, JSON.stringify(books, null, 2), 'utf8');
    console.log(`Successfully renumbered pages. Total pages: ${book.totalPages}`);
  } else {
    console.log('No pages found for the book.');
  }
} else {
  console.error('Book "diem-hen-lich-su" not found.');
}
