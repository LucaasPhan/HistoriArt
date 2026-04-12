import json
import os
import math

json_path = os.path.join(os.getcwd(), 'src/data/books.json')
with open(json_path, 'r', encoding='utf-8') as f:
    books = json.load(f)

for book in books:
    pages = book.get('pages', {})
    all_text = " ".join(pages.values())
    word_count = len(all_text.strip().split())
    # Avg reading speed: 200 words per minute
    estimated_read_time = math.ceil(word_count / 200)
    book['estimatedReadTime'] = estimated_read_time

with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(books, f, ensure_ascii=False, indent=2)

print('Updated books.json with estimatedReadTime via Python')
