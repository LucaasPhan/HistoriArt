"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search as SearchIcon, Sparkles, TrendingUp } from "lucide-react";
import PageMountSignaler from "@/components/PageMountSignaler";

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log("Searching for:", searchQuery);
      // TODO: Implement actual search API call
    }
  };

  const trendingBooks = [
    { title: "The Great Adventure", author: "Author One", rating: 4.8 },
    { title: "Mind & Motion", author: "Author Two", rating: 4.6 },
    { title: "Digital Dreams", author: "Author Three", rating: 4.7 },
    { title: "Silent Pages", author: "Author Four", rating: 4.9 },
  ];

  return (
    <>
      <main style={{ minHeight: "100vh", padding: "100px 24px 60px", maxWidth: 1200, margin: "0 auto" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(32px, 5vw, 48px)", marginBottom: 8 }}>
            Discover & Search
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 16, marginBottom: 24 }}>
            Find your next favorite book. Search by title, author, or genre.
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.form
          onSubmit={handleSearch}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{ display: "flex", gap: 12, marginBottom: 40, background: "var(--bg-card)", padding: 16, borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-card)" }}
        >
          <SearchIcon size={20} style={{ color: "var(--text-tertiary)", alignSelf: "center", flex: "0 0 auto" }} />
          <input
            type="text"
            placeholder="Search books, authors, genres..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              padding: "12px 8px",
              border: "none",
              background: "transparent",
              fontSize: 16,
              color: "var(--text-primary)",
              outline: "none",
            }}
          />
          <button
            type="submit"
            style={{
              padding: "10px 20px",
              background: "var(--accent-gradient)",
              color: "white",
              border: "none",
              borderRadius: 8,
              fontWeight: 600,
              cursor: "pointer",
              transition: "0.3s ease",
            }}
          >
            Search
          </button>
        </motion.form>

        {/* Results or Trending */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
            <TrendingUp size={20} color="var(--accent-primary)" />
            <h2 style={{ fontSize: 22, fontWeight: 600 }}>Trending Now</h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
            {trendingBooks.map((book, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                style={{
                  background: "var(--bg-card)",
                  borderRadius: "var(--radius-md)",
                  padding: 16,
                  boxShadow: "var(--shadow-card)",
                  cursor: "pointer",
                  transition: "0.3s ease",
                }}
                whileHover={{ transform: "translateY(-4px)", boxShadow: "var(--shadow-glow)" }}
              >
                <div style={{ background: "var(--bg-tertiary)", height: 140, borderRadius: 8, marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-tertiary)" }}>
                  <Sparkles size={28} />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4, color: "var(--text-primary)" }}>{book.title}</h3>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 8 }}>{book.author}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <p style={{ fontSize: 12, color: "var(--text-tertiary)" }}>⭐ {book.rating}</p>
                  <button style={{ padding: "6px 12px", background: "var(--accent-primary)", color: "white", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                    Add
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
      <PageMountSignaler />
    </>
  );
}
