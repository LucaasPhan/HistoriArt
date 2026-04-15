export const BOOK_GRID_STYLE = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: 28,
} as const;

export const SECTION_TITLE_STYLE = {
    fontFamily: "var(--font-sans)",
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 24,
    color: "var(--text-primary)",
} as const;