// Query books script
import { db } from "./db";
import { books } from "./schema";

async function main() {
  const allBooks = await db.select({ id: books.id, title: books.title }).from(books);
  console.log(JSON.stringify(allBooks, null, 2));
  process.exit(0);
}

main();
