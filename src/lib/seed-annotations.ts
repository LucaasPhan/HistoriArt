import type { MediaAnnotation } from "@/features/read/[bookId]/types";

// ─── Seed Annotations for Vietnamese History Books ──────────────

const SEED_ANNOTATIONS: MediaAnnotation[] = [
  // ═══ Điện Biên Phủ ═══════════════════════════════════════════
  {
    id: "dbp-1",
    bookId: "dien-bien-phu",
    chapterId: "2",
    pageNumber: 2,
    passageText: "Sở chỉ huy chiến dịch đóng tại Mường Phăng",
    mediaType: "image",
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/S%E1%BB%9F_Ch%E1%BB%89_huy_Chi%E1%BA%BFn_d%E1%BB%8Bch_%C4%90i%E1%BB%87n_Bi%C3%AAn_Ph%E1%BB%A7_01.jpg/1280px-S%E1%BB%9F_Ch%E1%BB%89_huy_Chi%E1%BA%BFn_d%E1%BB%8Bch_%C4%90i%E1%BB%87n_Bi%C3%AAn_Ph%E1%BB%A7_01.jpg",
    caption: "Sở chỉ huy chiến dịch Điện Biên Phủ tại Mường Phăng — nơi Đại tướng Võ Nguyên Giáp chỉ huy trận đánh lịch sử.",
  },
  {
    id: "dbp-2",
    bookId: "dien-bien-phu",
    chapterId: "3",
    pageNumber: 3,
    passageText: "Hò kéo pháo",
    mediaType: "video",
    mediaUrl: "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    caption: "Tư liệu: Hò kéo pháo — khúc ca hào hùng của bộ đội và dân công trên đường kéo pháo vào trận địa Điện Biên Phủ.",
  },
  {
    id: "dbp-3",
    bookId: "dien-bien-phu",
    chapterId: "3",
    pageNumber: 3,
    passageText: "Tô Vĩnh Diện không ngần ngại, ôm chèn lao vào bánh xe",
    mediaType: "image",
    mediaUrl: "https://upload.wikimedia.org/wikipedia/vi/thumb/3/31/T%C3%B4_V%C4%A9nh_Di%E1%BB%87n.jpg/220px-T%C3%B4_V%C4%A9nh_Di%E1%BB%87n.jpg",
    caption: "Anh hùng Tô Vĩnh Diện (1928–1953) — hy sinh thân mình chèn pháo trên dốc cao, trở thành biểu tượng quả cảm của chiến dịch.",
  },
  {
    id: "dbp-4",
    bookId: "dien-bien-phu",
    chapterId: "5",
    pageNumber: 5,
    passageText: "Bài Quốc tế ca trầm hùng vang lên",
    mediaType: "audio",
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/4/45/Quoc_te_ca.ogg",
    caption: "Bài Quốc tế ca — vang lên giữa lòng chảo Điện Biên Phủ khi bộ đội cắm cờ trên cứ điểm Him Lam.",
  },
  {
    id: "dbp-5",
    bookId: "dien-bien-phu",
    chapterId: "7",
    pageNumber: 7,
    passageText: "Lá cờ \"Quyết chiến quyết thắng\" tung bay",
    mediaType: "annotation",
    caption: "Lá cờ \"Quyết chiến quyết thắng\" là lá cờ được trao cho các đơn vị anh hùng nhất. Đây là biểu tượng tinh thần bất khuất của quân đội nhân dân Việt Nam, được treo trên đỉnh đồi A1 sau 39 ngày chiến đấu ác liệt.",
  },

  // ═══ An Tư ═══════════════════════════════════════════════════
  {
    id: "at-1",
    bookId: "an-tu-cong-chua",
    chapterId: "1",
    pageNumber: 1,
    passageText: "Năm mươi vạn quân Mông Nguyên",
    mediaType: "annotation",
    caption: "Quân Mông Nguyên xâm lược Đại Việt 3 lần (1258, 1285, 1288). Lần thứ hai có quy mô lớn nhất với khoảng 50 vạn (500.000) quân — gồm quân Mông Cổ, quân Trung Hoa và quân phụ thuộc từ nhiều nước bị chinh phục.",
  },
  {
    id: "at-2",
    bookId: "an-tu-cong-chua",
    chapterId: "2",
    pageNumber: 2,
    passageText: "Hội nghị Diên Hồng",
    mediaType: "image",
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/H%E1%BB%99i_ngh%E1%BB%8B_Di%C3%AAn_H%E1%BB%93ng.jpg/800px-H%E1%BB%99i_ngh%E1%BB%8B_Di%C3%AAn_H%E1%BB%93ng.jpg",
    caption: "Hội nghị Diên Hồng (1284) — hội nghị dân chủ đầu tiên trong lịch sử Việt Nam, nơi các bô lão đồng thanh hô \"Đánh!\"",
  },
  {
    id: "at-3",
    bookId: "an-tu-cong-chua",
    chapterId: "2",
    pageNumber: 2,
    passageText: "Ta thường tới bữa quên ăn, nửa đêm vỗ gối",
    mediaType: "annotation",
    caption: "Hịch tướng sĩ (檄將士) — bài hịch nổi tiếng của Trần Hưng Đạo viết năm 1284, kêu gọi tướng sĩ nêu cao tinh thần chiến đấu. Đây là một trong những áng văn yêu nước hay nhất trong lịch sử văn học Việt Nam.",
  },

  // ═══ Mùa Xuân 1975 ══════════════════════════════════════════
  {
    id: "mx-1",
    bookId: "mua-xuan-1975",
    chapterId: "3",
    pageNumber: 3,
    passageText: "Thần tốc, thần tốc hơn nữa",
    mediaType: "annotation",
    caption: "\"Thần tốc, thần tốc hơn nữa! Táo bạo, táo bạo hơn nữa!\" — Mệnh lệnh của Đại tướng Võ Nguyên Giáp gửi toàn quân ngày 7/4/1975, trở thành câu nói lịch sử biểu trưng cho tốc độ giải phóng miền Nam.",
  },
  {
    id: "mx-2",
    bookId: "mua-xuan-1975",
    chapterId: "6",
    pageNumber: 6,
    passageText: "xe tăng quân giải phóng húc đổ cổng Dinh Độc Lập",
    mediaType: "image",
    mediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Dinh_Doc_Lap.jpg/1280px-Dinh_Doc_Lap.jpg",
    caption: "Dinh Độc Lập (nay là Dinh Thống Nhất) — nơi xe tăng quân giải phóng húc đổ cổng sáng ngày 30/4/1975, đánh dấu thời khắc thống nhất đất nước.",
  },
  {
    id: "mx-3",
    bookId: "mua-xuan-1975",
    chapterId: "6",
    pageNumber: 6,
    passageText: "Xe tăng mang số hiệu 390",
    mediaType: "annotation",
    caption: "Xe tăng T-54 số hiệu 390 do trung úy Bùi Quang Thận chỉ huy, là chiếc xe đầu tiên húc đổ cổng Dinh Độc Lập. Chiếc xe này hiện được trưng bày tại Bảo tàng Lịch sử Quân sự Việt Nam.",
  },
];

/**
 * Get all seed annotations for a specific book.
 */
export function getSeedAnnotationsForBook(bookId: string): MediaAnnotation[] {
  return SEED_ANNOTATIONS.filter((a) => a.bookId === bookId);
}

/**
 * Get seed annotations for a specific book and page.
 */
export function getSeedAnnotationsForPage(bookId: string, pageNumber: number): MediaAnnotation[] {
  return SEED_ANNOTATIONS.filter((a) => a.bookId === bookId && a.pageNumber === pageNumber);
}

export default SEED_ANNOTATIONS;
