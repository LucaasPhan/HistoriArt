export type Language = "vi" | "en";

export type TranslationKeys = typeof translations.vi;

export const translations = {
  vi: {
    // ── Common ──
    "common.loading": "Đang tải...",
    "common.save": "Lưu",
    "common.cancel": "Hủy",
    "common.delete": "Xóa",
    "common.confirm": "Xác nhận",
    "common.error": "Lỗi",
    "common.refresh": "Làm mới",
    "common.copied": "Đã sao chép!",

    // ── Navbar ──
    "nav.library": "Thư viện",

    // ── User Menu ──
    "user.signIn": "Đăng nhập",
    "user.signOut": "Đăng xuất",
    "user.signingOut": "Đang đăng xuất...",
    "user.settings": "Cài đặt",
    "user.lightMode": "Chế độ sáng",
    "user.darkMode": "Chế độ tối",
    "user.errorTitle": "Lỗi",
    "user.errorRefresh": "Làm mới",

    // ── Login ──
    "login.welcome": "Chào mừng",
    "login.subtitle": "Đăng nhập để tiếp tục hành trình đọc sách",

    // ── Landing — Hero ──
    "hero.badge": "Nền tảng eBook lịch sử với đa phương tiện",
    "hero.titleLine1": "Lịch sử Việt Nam",
    "hero.titleLine2": "qua trang sách sống động",
    "hero.subtitle":
      "Từ Bạch Đằng đến Điện Biên Phủ — đọc lịch sử với hình ảnh, phim tư liệu và âm nhạc chèn thẳng vào từng trang sách.",
    "hero.cta": "Bắt đầu đọc",
    "hero.learnMore": "Tìm hiểu thêm",

    // ── Landing — Features ──
    "features.heading": "Đọc — Xem — Hỏi đáp —",
    "features.headingAccent": "Ôn tập",
    "features.subtitle":
      "Trải nghiệm học lịch sử hoàn toàn mới với công nghệ eBook đa phương tiện.",
    "features.0.title": "Sách lịch sử sống động",
    "features.0.desc":
      "Đọc những tác phẩm kinh điển về lịch sử Việt Nam, từ thời Hùng Vương đến ngày thống nhất.",
    "features.1.title": "Tư liệu đa phương tiện",
    "features.1.desc":
      "Hình ảnh, video, và âm thanh lịch sử hiện ngay khi bạn đọc đến đoạn văn liên quan.",
    "features.2.title": "Trợ lý AI Fable",
    "features.2.desc":
      "Hỏi đáp, tóm tắt và mở rộng kiến thức lịch sử tức thì ngay bên cạnh trang sách đang đọc.",
    "features.3.title": "Ôn tập qua quiz",
    "features.3.desc": "Kiểm tra kiến thức lịch sử sau mỗi chương với các câu hỏi thú vị.",
    "features.4.title": "Cộng đồng đóng góp",
    "features.4.desc":
      "Người đọc có thể đề xuất và đóng góp thêm hình ảnh, video để làm phong phú thư viện.",

    // ── Landing — Books Preview ──
    "books.heading": "Thư viện",
    "books.headingAccent": "lịch sử",
    "books.subtitle":
      "Khám phá những tác phẩm kinh điển về lịch sử Việt Nam từ thời dựng nước đến thống nhất.",
    "books.loading": "Đang tải thư viện...",
    "books.readTime": "phút đọc",
    "books.pages": "trang",
    "books.readNow": "Đọc ngay",

    // ── Landing — Demo Preview ──
    "demo.heading": "Tư liệu",
    "demo.headingAccent": "ngay trong trang sách",
    "demo.subtitle": "Khi đọc đến đoạn có sự kiện lịch sử, tư liệu sẽ tự động hiện ra bên phải.",
    "demo.relatedMedia": "Tư liệu liên quan",

    // ── Landing — AI Feature ──
    "ai.heading": "Trợ lý AI",
    "ai.headingAccent": "Fable Chat",
    "ai.subtitle":
      "Bạn gặp những sự kiện khó hiểu hay muốn tìm hiểu thêm về bài đọc? Fable Chat luôn sẵn sàng giải đáp ngay lập tức, tóm tắt nội dung và mở rộng kiến thức ngay bên cạnh trang sách.",
    "ai.placeholder": "Hỏi Fable Chat về đoạn trích lịch sử này...",

    // ── Landing — Team ──
    "team.heading": "Đội ngũ",
    "team.headingAccent": "HistoriArt",
    "team.subtitle":
      "Những người đằng sau sứ mệnh mang lịch sử Việt Nam đến gần hơn với thế hệ trẻ.",
    "team.member.1.role": "Quản lý Dự án",
    "team.member.1.desc": "Điều phối tiến độ và đội ngũ để đảm bảo dự án vận hành mượt mà.",
    "team.member.2.role": "Nghiên cứu Nội dung",
    "team.member.2.desc":
      "Khám phá và xác thực những câu chuyện lịch sử phong phú đằng sau mỗi tác phẩm.",
    "team.member.3.role": "Quản trị Nội dung",
    "team.member.3.desc":
      "Tổ chức và quản lý kho lưu trữ số để đảm bảo chất lượng và khả năng tiếp cận.",
    "team.member.4.role": "Kỹ sư Trưởng",
    "team.member.4.desc":
      "Xây dựng nền tảng kỹ thuật cho những trải nghiệm lịch sử tương tác sinh động.",
    "team.member.5.role": "Chuyên viên Truyền thông",
    "team.member.5.desc":
      "Sáng tạo các tài liệu hình ảnh sống động để đưa lịch sử Việt Nam đến gần hơn với mọi người.",

    // ── Landing — Footer ──
    "footer.text": "Nền tảng eBook lịch sử Việt Nam",

    // ── Library ──
    "library.title": "Thư viện",
    "library.bookCount": "đầu sách đang chờ bạn",
    "library.uploadPdf": "Tải lên PDF",
    "library.selected": "Đã chọn:",
    "library.bookIdPlaceholder": "ID sách tùy chỉnh (tùy chọn)",
    "library.bookTitlePlaceholder": "Tên sách",
    "library.uploading": "Đang tải...",
    "library.continueReading": "Tiếp tục đọc",
    "library.errorLoadingBooks": "Lỗi khi tải thư viện",
    "library.errorLoadingBooksDescription": "Vui lòng thử lại sau",
    "library.library": "Tủ Sách Lịch Sử",

    // ── Reader — Top Bar ──
    "reader.library": "Thư viện",
    "reader.toc": "Mục lục",
    "reader.edit": "Chỉnh sửa",
    "reader.notes": "Ghi chú",
    "reader.media": "Tư liệu",
    "reader.prevPage": "Trang trước",
    "reader.nextPage": "Trang sau",
    "reader.jumpToPage": "Nhảy đến trang",

    // ── Reader — Chat Sidebar ──
    "chat.clearHistory": "Xóa lịch sử chat",
    "chat.placeholder": "Hỏi Fable Chat về đoạn trích lịch sử này...",
    "chat.unlockFable": "Mở khóa Fable",
    "chat.signInPrompt": "Đăng nhập để hỏi đáp và trò chuyện với AI theo nội dung bạn đang đọc.",
    "chat.signInCta": "Đăng Nhập",
    "chat.attachedMedia": "Đã đính kèm tư liệu",
    "chat.removeMedia": "Gỡ tư liệu",
    "chat.confirmClearTitle": "Xóa lịch sử chat",
    "chat.confirmClearText": "Bạn chắc chắn muốn xóa toàn bộ tin nhắn?",
    "chat.bookText": "Văn bản sách",
    "chat.highlight": "Ghi chú",
    "chat.image": "Hình ảnh",
    "chat.video": "Video",
    "chat.audio": "Âm thanh",
    "chat.annotation": "Chú thích",
    "chat.decorativeUser": "Bạn có thể giải thích chủ đề chính của chương này không?",
    "chat.decorativeAI":
      "Chương này tập trung vào xung đột giữa quyền lực và lương tâm, thể hiện qua các quyết định mà nhân vật chính buộc phải đưa ra.",

    // ── Reader — Media Panel ──
    "media.relatedMedia": "Tư liệu liên quan",
    "media.addMedia": "+ Thêm tư liệu",
    "media.addToChat": "Thêm vào khung chat",
    "media.editMedia": "Sửa tư liệu",
    "media.deleteMedia": "Xóa tư liệu",
    "media.emptyTitle": "Tiếp tục đọc để xem tư liệu lịch sử liên quan",
    "media.emptyHint":
      "Hình ảnh, video và chú thích sẽ tự động hiển thị khi bạn đọc đến đoạn văn liên quan.",
    "media.playVideo": "Bấm để phát video",
    "media.sources": "Nguồn tham khảo",

    // ── Reader — Highlights ──
    "highlights.title": "Ghi chú",
    "highlights.newestFirst": "Mới nhất",
    "highlights.oldestFirst": "Cũ nhất",
    "highlights.customOrder": "Tùy chỉnh",
    "highlights.empty": "Chưa có ghi chú nào. Chọn văn bản trong sách để thêm!",
    "highlights.clearAll": "Xóa tất cả",
    "highlights.clearAllTitle": "Xóa tất cả ghi chú",
    "highlights.clearAllText":
      "Bạn có chắc chắn muốn xóa tất cả ghi chú trong cuốn sách này? Hành động này không thể hoàn tác.",
    "highlights.deleteAll": "Xóa tất cả",

    // ── Reader — Selection Tooltip ──
    "tooltip.options": "Tùy chọn",
    "tooltip.copy": "Sao chép",
    "tooltip.sendToChat": "Gửi tới AI chat",
    "tooltip.addMedia": "Thêm tư liệu",
    "tooltip.lookup": "Tra cứu",

    // ── Reader — Chapters ──
    "chapters.title": "Mục lục",
    "chapters.empty": "Không tìm thấy thông tin mục lục.",
    "chapters.page": "Trang",

    // ── Settings ──
    "settings.title": "Cài đặt",
    "settings.general": "Chung",
    "settings.account": "Tài khoản",
    "settings.preferences": "Tùy chỉnh đọc",
    "settings.security": "Bảo mật",

    // ── Settings — General ──
    "settings.generalTitle": "Chung",
    "settings.appearance": "Giao diện",
    "settings.appearanceHint": "Chọn giao diện cho HistoriArt.",
    "settings.fontSize": "Cỡ chữ",
    "settings.fontSmall": "Nhỏ",
    "settings.fontLarge": "Lớn",
    "settings.language": "Ngôn ngữ",
    "settings.languageHint": "Chọn ngôn ngữ giao diện cho HistoriArt.",

    // ── Settings — Account ──
    "settings.profile": "Hồ sơ",
    "settings.firstName": "Tên",
    "settings.lastName": "Họ",
    "settings.age": "Tuổi",
    "settings.ageHint": "Phải từ 13 tuổi trở lên.",
    "settings.gender": "Giới tính",
    "settings.genderSelect": "Chọn giới tính",
    "settings.genderMale": "Nam",
    "settings.genderFemale": "Nữ",
    "settings.genderNonBinary": "Khác",
    "settings.genderPreferNot": "Không muốn nói",
    "settings.saveProfile": "Lưu hồ sơ",
    "settings.saving": "Đang lưu...",
    "settings.profileSaved": "Đã lưu hồ sơ!",
    "settings.validationError": "Vui lòng đảm bảo tất cả các trường hợp lệ.",
    "settings.loadingProfile": "Đang tải hồ sơ...",
    "settings.failedSave": "Không thể lưu hồ sơ.",

    // ── Settings — Preferences ──
    "settings.readerPrefs": "Tùy chỉnh đọc sách",
    "settings.readerPrefsDesc": "Cài đặt trải nghiệm đọc sách theo ý bạn.",
    "settings.retakeOnboardingTitle": "Cấu hình lại Hồ sơ",
    "settings.retakeOnboardingDesc": "Thực hiện lại bài khảo sát để cập nhật mục tiêu đọc và phong cách trò chuyện.",
    "settings.retakeOnboardingButton": "Bắt đầu",

    // ── Settings — Security ──
    "settings.securityTitle": "Bảo mật",
    "settings.authentication": "Xác thực",
    "settings.securityPlaceholder": "Tùy chọn bảo mật và quản lý phiên sẽ có tại đây.",

    // ── Onboarding ──
    "ob.back": "← Quay lại",
    "ob.continue": "Tiếp tục →",
    "ob.saving": "Đang lưu...",
    "ob.start": "Bắt đầu →",
    "ob.step1.title": "Một chút về bạn",
    "ob.step1.subtitle": "Giúp chúng tôi hiểu bạn hơn.",
    "ob.step2.title": "Điều gì đưa bạn đến đây?",
    "ob.step2.subtitle": "Chọn tất cả những gì phù hợp với hành trình đọc của bạn.",
    "ob.step3.title": "Bạn đang tìm kiếm điều gì?",
    "ob.step3.subtitle": "Mục tiêu chính khi đọc sách của bạn là gì?",
    "ob.step4.title": "Phong cách đọc của bạn",
    "ob.step4.subtitle": "Người khác sẽ miêu tả bạn như thế nào?",
    "ob.step5.title": "Bạn thích trò chuyện thế nào?",
    "ob.step5.subtitle": "Chúng tôi sẽ điều chỉnh AI để phù hợp với giọng văn của bạn.",

    // ── Onboarding Data ──
    "ob.gender.male": "Nam",
    "ob.gender.female": "Nữ",
    "ob.gender.nonBinary": "Khác",
    "ob.gender.preferNotToSay": "Không muốn nói",

    "ob.purpose.learn": "Mở rộng kiến thức",
    "ob.purpose.learnDesc": "Học hỏi sâu hơn về các sự kiện và nhân vật lịch sử",
    "ob.purpose.academic": "Tra cứu học thuật",
    "ob.purpose.academicDesc": "Sử dụng cho nghiên cứu hoặc học tập trên trường",
    "ob.purpose.stories": "Khám phá giai thoại",
    "ob.purpose.storiesDesc": "Đọc những câu chuyện dã sử và anh hùng ca",
    "ob.purpose.media": "Trải nghiệm đa phương tiện",
    "ob.purpose.mediaDesc": "Tìm hiểu lịch sử trực quan qua hình ảnh và video",
    "ob.purpose.other": "Lý do khác",
    "ob.purpose.otherDesc": "Tôi muốn tự do khám phá",

    "ob.goal.facts": "Sự kiện & Dữ liệu",
    "ob.goal.factsDesc": "Mốc thời gian và chi tiết lịch sử chính xác",
    "ob.goal.insights": "Góc nhìn sâu sắc",
    "ob.goal.insightsDesc": "Hiểu rõ nguyên nhân và bài học đằng sau sự kiện",
    "ob.goal.epic": "Giải trí & Hào hùng",
    "ob.goal.epicDesc": "Tận hưởng những trận đánh rực lửa và kịch tính",
    "ob.goal.roots": "Kết nối cội nguồn",
    "ob.goal.rootsDesc": "Tìm lại niềm tự hào và di sản dân tộc",

    "ob.personality.researcher": "Nhà nghiên cứu",
    "ob.personality.researcherDesc": "Logic, thích đào sâu và kiểm chứng thông tin",
    "ob.personality.storyteller": "Người kể chuyện",
    "ob.personality.storytellerDesc": "Đam mê cốt truyện, nhân vật và sự kịch tính",
    "ob.personality.student": "Học sinh / Sinh viên",
    "ob.personality.studentDesc": "Tập trung vào tóm tắt và ghi nhớ ý chính",
    "ob.personality.explorer": "Người tò mò",
    "ob.personality.explorerDesc": "Khám phá tự do, lan man qua nhiều chủ đề",

    "ob.comm.professor": "Giáo sư",
    "ob.comm.professorDesc": "Chuyên sâu, học thuật và khách quan",
    "ob.comm.narrator": "Người kể chuyện",
    "ob.comm.narratorDesc": "Lôi cuốn, có âm hưởng phim tài liệu",
    "ob.comm.guide": "Hướng dẫn viên",
    "ob.comm.guideDesc": "Thân thiện, đơn giản và dễ hiểu",
    "ob.comm.quick": "Hỏi đáp nhanh",
    "ob.comm.quickDesc": "Trả lời ngắn gọn, trực diện, gạch đầu dòng",

    "ob.misc.otherPlaceholder": "Nhập mục đích của bạn...",

    // ── Quiz UI ──
    "quiz.title": "Câu hỏi ôn tập",
    "quiz.chapterComplete": "Bạn đã hoàn thành chương này!",
    "quiz.takeQuizPrompt": "Bạn có muốn làm quiz không?",
    "quiz.startQuiz": "Bắt đầu làm quiz",
    "quiz.skipQuiz": "Bỏ qua",
    "quiz.dontShowAgain": "Không hiển thị lại",
    "quiz.question": "Câu hỏi",
    "quiz.of": "trong",
    "quiz.submit": "Hoàn thành",
    "quiz.next": "Tiếp theo",
    "quiz.correct": "Đúng rồi!",
    "quiz.incorrect": "Chưa đúng",
    "quiz.yourAnswer": "Câu trả lời của bạn",
    "quiz.correctAnswer": "Đáp án đúng",
    "quiz.explanation": "Giải thích",
    "quiz.score": "Điểm số",
    "quiz.quizComplete": "Hoàn thành quiz!",
    "quiz.tryAgain": "Làm lại",
    "quiz.viewHistory": "Xem lịch sử",
    "quiz.noQuestions": "Chưa có câu hỏi cho chương này",
    "quiz.typeShortAnswer": "Nhập câu trả lời...",
    "quiz.true": "Đúng",
    "quiz.false": "Sai",
    "quiz.grading": "Đang chấm điểm...",
    "quiz.gradingError": "Không thể chấm điểm. Vui lòng thử lại.",
    "quiz.openQuiz": "Làm quiz",
    "quiz.previousChapter": "Chương trước",
    "quiz.chapterNotCompleted": "Vui lòng đọc xong ít nhất một chương trước khi thực hiện quiz!",
    "quiz.shortAnswerPlaceholder": "Nhập câu trả lời của bạn...",
    "quiz.completedPercent": "Đã hoàn thành {percent}%",
    "quiz.resultsDetail": "Chi tiết kết quả",
    "quiz.questionNumber": "Câu {number}:",
    "quiz.finish": "Hoàn tất",
    "quiz.alreadyCompleted": "Bạn đã hoàn thành quiz của chương này rồi!",

    // ── Admin ──
    "admin.dashboard": "Trang quản trị",
    "admin.quizManager": "Quản lý câu hỏi",
    "admin.addQuestion": "Thêm câu hỏi",
    "admin.editQuestion": "Sửa câu hỏi",
    "admin.deleteQuestion": "Xóa câu hỏi",
    "admin.generateWithAI": "Tạo bằng AI",
    "admin.generating": "Đang tạo...",
    "admin.publish": "Xuất bản",
    "admin.unpublish": "Ẩn",
    "admin.draft": "Bản nháp",
    "admin.published": "Đã xuất bản",
    "admin.performance": "Hiệu suất",
    "admin.totalAttempts": "Tổng lượt làm",
    "admin.avgScore": "Điểm trung bình",
    "admin.Book": "Sách",
    "admin.selectChapter": "Chọn chương",
    "admin.questionType": "Loại câu hỏi",
    "admin.multipleChoice": "Trắc nghiệm",
    "admin.trueFalse": "Đúng/Sai",
    "admin.shortAnswer": "Tự luận ngắn",
    "admin.acceptedAnswers": "Đáp án chấp nhận (mỗi dòng một đáp án)",
    "admin.options": "Các lựa chọn",
    "admin.correctOption": "Đáp án đúng",
    "admin.saveDraft": "Lưu bản nháp",
    "admin.publishNow": "Xuất bản ngay",
    "admin.addAll": "Thêm tất cả",
    "admin.addToDraft": "Thêm vào bản nháp",
    "admin.questionCount": "Số lượng câu hỏi",
    "admin.passRate": "Tỷ lệ pass",
    "admin.deleteConfirm": "Bạn có chắc chắn muốn xóa câu hỏi này?",
    "admin.quizDescription": "Quản lý câu hỏi cho các chương",
    "admin.performanceDescription": "Thống kê dữ liệu quiz của người dùng",

    // ── User Dashboard ──
    "dashboard.title": "Trang cá nhân",
    "dashboard.quizHistory": "Lịch sử làm bài",
    "dashboard.noHistory": "Bạn chưa làm quiz nào",
    "dashboard.chapter": "Chương",
    "dashboard.date": "Ngày",
    "dashboard.result": "Kết quả",
    "dashboard.totalQuizzes": "Tổng bài quiz",
    "dashboard.bestScore": "Điểm cao nhất",

    // ── Navbar extras ──
    "nav.dashboard": "Trang cá nhân",
    "nav.admin": "Quản trị",
  },

  en: {
    // ── Common ──
    "common.loading": "Loading...",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.delete": "Delete",
    "common.confirm": "Confirm",
    "common.error": "Error",
    "common.refresh": "Refresh",
    "common.copied": "Copied!",

    // ── Navbar ──
    "nav.library": "Library",

    // ── User Menu ──
    "user.signIn": "Sign In",
    "user.signOut": "Sign out",
    "user.signingOut": "Signing out...",
    "user.settings": "Settings",
    "user.lightMode": "Light Mode",
    "user.darkMode": "Dark Mode",
    "user.errorTitle": "Error",
    "user.errorRefresh": "Refresh",

    // ── Login ──
    "login.welcome": "Welcome",
    "login.subtitle": "Sign in to continue your reading adventure",

    // ── Landing — Hero ──
    "hero.badge": "Multimedia eBook platform for Vietnamese history",
    "hero.titleLine1": "Vietnamese History",
    "hero.titleLine2": "through vivid book pages",
    "hero.subtitle":
      "From Bạch Đằng to Điện Biên Phủ — read history with images, documentary footage and music embedded right into every page.",
    "hero.cta": "Start Reading",
    "hero.learnMore": "Learn More",

    // ── Landing — Features ──
    "features.heading": "Read — Watch — Ask —",
    "features.headingAccent": "Review",
    "features.subtitle": "A brand-new way to learn history with multimedia eBook technology.",
    "features.0.title": "Vivid History Books",
    "features.0.desc":
      "Read classic works on Vietnamese history, from the Hùng Vương era to national reunification.",
    "features.1.title": "Multimedia Resources",
    "features.1.desc":
      "Images, videos and historical audio appear right when you reach the relevant passage.",
    "features.2.title": "AI Assistant Fable",
    "features.2.desc":
      "Instant Q&A, summaries and knowledge expansion right beside the page you're reading.",
    "features.3.title": "Review with Quizzes",
    "features.3.desc":
      "Test your history knowledge after each chapter with engaging questions.",
    "features.4.title": "Community Contributions",
    "features.4.desc":
      "Readers can suggest and contribute images and videos to enrich the library.",

    // ── Landing — Books Preview ──
    "books.heading": "History",
    "books.headingAccent": "Library",
    "books.subtitle":
      "Explore classic works on Vietnamese history from the founding era to reunification.",
    "books.loading": "Loading library...",
    "books.readTime": "min read",
    "books.pages": "pages",
    "books.readNow": "Read now",

    // ── Landing — Demo Preview ──
    "demo.heading": "Resources",
    "demo.headingAccent": "right inside the book",
    "demo.subtitle":
      "When you reach a historical event, related media appears automatically to the side.",
    "demo.relatedMedia": "Related Media",

    // ── Landing — AI Feature ──
    "ai.heading": "AI Assistant",
    "ai.headingAccent": "Fable Chat",
    "ai.subtitle":
      "Encounter confusing events or want to learn more about the reading? Fable Chat is always ready to answer instantly, summarize content and expand knowledge right beside the book page.",
    "ai.placeholder": "Ask Fable Chat about this historical passage...",

    // ── Landing — Team ──
    "team.heading": "The",
    "team.headingAccent": "HistoriArt Team",
    "team.subtitle":
      "The people behind the mission to bring Vietnamese history closer to the younger generation.",
    "team.member.1.role": "Project Manager",
    "team.member.1.desc": "Coordinating timelines and teams to ensure seamless project delivery.",
    "team.member.2.role": "Content Researcher",
    "team.member.2.desc":
      "Uncovering and verifying the rich historical stories behind every artwork.",
    "team.member.3.role": "Content Administrator",
    "team.member.3.desc": "Organizing and managing digital archives for quality and accessibility.",
    "team.member.4.role": "Lead Engineer",
    "team.member.4.desc":
      "Architecting the technical foundation for an interactive historical experience.",
    "team.member.5.role": "Media Specialist",
    "team.member.5.desc": "Creating immersive visual assets to bring Vietnamese history to life.",

    // ── Landing — Footer ──
    "footer.text": "Vietnamese History eBook Platform",

    // ── Library ──
    "library.title": "Library",
    "library.bookCount": "books waiting for you",
    "library.uploadPdf": "Upload PDF Book",
    "library.selected": "Selected:",
    "library.bookIdPlaceholder": "Custom Book ID (optional)",
    "library.bookTitlePlaceholder": "Book title",
    "library.uploading": "Uploading...",
    "library.continueReading": "Continue reading",
    "library.errorLoadingBooks": "Error loading books",
    "library.errorLoadingBooksDescription": "Please try again later",
    "library.library": "Historic Bookshelves",

    // ── Reader — Top Bar ──
    "reader.library": "Library",
    "reader.toc": "Contents",
    "reader.edit": "Edit",
    "reader.notes": "Notes",
    "reader.media": "Media",
    "reader.prevPage": "Previous page",
    "reader.nextPage": "Next page",
    "reader.jumpToPage": "Jump to page",

    // ── Reader — Chat Sidebar ──
    "chat.clearHistory": "Clear Chat History",
    "chat.placeholder": "Ask Fable Chat about this historical passage...",
    "chat.unlockFable": "Unlock Fable",
    "chat.signInPrompt": "Sign in to chat and interact with AI based on what you're reading.",
    "chat.signInCta": "Sign In",
    "chat.attachedMedia": "Media attached",
    "chat.removeMedia": "Remove media",
    "chat.confirmClearTitle": "Clear chat history",
    "chat.confirmClearText": "Are you sure you want to delete all messages?",
    "chat.bookText": "Book Text",
    "chat.highlight": "Highlight",
    "chat.image": "Image",
    "chat.video": "Video",
    "chat.audio": "Audio",
    "chat.annotation": "Annotation",
    "chat.decorativeUser": "Can you explain the main theme of this chapter?",
    "chat.decorativeAI":
      "This chapter focuses on the conflict between power and conscience, expressed through the decisions the protagonist is forced to make.",

    // ── Reader — Media Panel ──
    "media.relatedMedia": "Related Media",
    "media.addMedia": "+ Add Media",
    "media.addToChat": "Add to chat",
    "media.editMedia": "Edit media",
    "media.deleteMedia": "Delete media",
    "media.emptyTitle": "Keep reading to see related historical media",
    "media.emptyHint":
      "Images, videos and annotations will appear automatically when you reach the relevant passage.",
    "media.playVideo": "Click to play video",
    "media.sources": "References",

    // ── Reader — Highlights ──
    "highlights.title": "Highlights",
    "highlights.newestFirst": "Newest First",
    "highlights.oldestFirst": "Oldest First",
    "highlights.customOrder": "Custom Order",
    "highlights.empty": "No highlights yet. Select text in the book to add some!",
    "highlights.clearAll": "Clear All",
    "highlights.clearAllTitle": "Clear All Highlights",
    "highlights.clearAllText":
      "Are you sure you want to delete all highlights in this book? This action cannot be undone.",
    "highlights.deleteAll": "Delete All",

    // ── Reader — Selection Tooltip ──
    "tooltip.options": "Options",
    "tooltip.copy": "Copy",
    "tooltip.sendToChat": "Send to AI chat",
    "tooltip.addMedia": "Add media",
    "tooltip.lookup": "Look up",

    // ── Reader — Chapters ──
    "chapters.title": "Table of Contents",
    "chapters.empty": "No chapter information found.",
    "chapters.page": "Page",

    // ── Settings ──
    "settings.title": "Settings",
    "settings.general": "General",
    "settings.account": "Account",
    "settings.preferences": "Reader Preferences",
    "settings.security": "Security",

    // ── Settings — General ──
    "settings.generalTitle": "General",
    "settings.appearance": "Appearance",
    "settings.appearanceHint": "Choose how HistoriArt looks to you.",
    "settings.fontSize": "Font Size",
    "settings.fontSmall": "Small",
    "settings.fontLarge": "Large",
    "settings.language": "Language",
    "settings.languageHint": "Choose the display language for HistoriArt.",

    // ── Settings — Account ──
    "settings.profile": "Profile",
    "settings.firstName": "First name",
    "settings.lastName": "Last name",
    "settings.age": "Age",
    "settings.ageHint": "Must be above 13 years old.",
    "settings.gender": "Gender",
    "settings.genderSelect": "Select gender",
    "settings.genderMale": "Male",
    "settings.genderFemale": "Female",
    "settings.genderNonBinary": "Non-binary",
    "settings.genderPreferNot": "Prefer not to say",
    "settings.saveProfile": "Save Profile",
    "settings.saving": "Saving...",
    "settings.profileSaved": "Profile saved!",
    "settings.validationError": "Please ensure all fields are valid.",
    "settings.loadingProfile": "Loading profile...",
    "settings.failedSave": "Failed to save profile.",

    // ── Settings — Preferences ──
    "settings.readerPrefs": "Reader Preferences",
    "settings.readerPrefsDesc": "Customize your reading experience to your liking.",
    "settings.retakeOnboardingTitle": "Retake Questionnaire",
    "settings.retakeOnboardingDesc": "Retake the survey to update your reading goals and conversation style.",
    "settings.retakeOnboardingButton": "Start",

    // ── Settings — Security ──
    "settings.securityTitle": "Security",
    "settings.authentication": "Authentication",
    "settings.securityPlaceholder":
      "Security options and session management will be available here.",

    // ── Onboarding ──
    "ob.back": "← Back",
    "ob.continue": "Continue →",
    "ob.saving": "Saving...",
    "ob.start": "Let's begin →",
    "ob.step1.title": "A little about you",
    "ob.step1.subtitle": "Helps us speak your language.",
    "ob.step2.title": "What brings you here?",
    "ob.step2.subtitle": "Select all that apply to your reading journey.",
    "ob.step3.title": "What are you seeking?",
    "ob.step3.subtitle": "What do you most want to get out of reading history?",
    "ob.step4.title": "Your reading persona",
    "ob.step4.subtitle": "How would other people describe you?",
    "ob.step5.title": "How do you like to talk?",
    "ob.step5.subtitle": "We'll match your pace and tone.",

    // ── Onboarding Data ──
    "ob.gender.male": "Male",
    "ob.gender.female": "Female",
    "ob.gender.nonBinary": "Non-binary",
    "ob.gender.preferNotToSay": "Prefer not to say",

    "ob.purpose.learn": "Expand Knowledge",
    "ob.purpose.learnDesc": "Learn deeply about historical events and figures",
    "ob.purpose.academic": "Academic Research",
    "ob.purpose.academicDesc": "Use the platform for school or university studies",
    "ob.purpose.stories": "Explore Anecdotes",
    "ob.purpose.storiesDesc": "Read entertaining folktales and heroic stories",
    "ob.purpose.media": "Multimedia Experience",
    "ob.purpose.mediaDesc": "See history through documentaries and real photos",
    "ob.purpose.other": "My own reasons",
    "ob.purpose.otherDesc": "I'll explore freely",

    "ob.goal.facts": "Facts & Data",
    "ob.goal.factsDesc": "Precise timelines and historical details",
    "ob.goal.insights": "Deep Insights",
    "ob.goal.insightsDesc": "Understand the 'why' and lessons behind events",
    "ob.goal.epic": "Epic Entertainment",
    "ob.goal.epicDesc": "Enjoy the drama of epic battles and narratives",
    "ob.goal.roots": "Connect to Roots",
    "ob.goal.rootsDesc": "Find pride and connection in national heritage",

    "ob.personality.researcher": "The Researcher",
    "ob.personality.researcherDesc": "Analytical, detail-oriented, fact-checker",
    "ob.personality.storyteller": "The Storyteller",
    "ob.personality.storytellerDesc": "Loves the narrative, characters, and drama",
    "ob.personality.student": "The Student",
    "ob.personality.studentDesc": "Focused on quick summaries and keys takeaways",
    "ob.personality.explorer": "Curious Explorer",
    "ob.personality.explorerDesc": "Browses freely and jumps between topics",

    "ob.comm.professor": "Professor",
    "ob.comm.professorDesc": "Professional, academic, detailed, and objective",
    "ob.comm.narrator": "Documentary Narrator",
    "ob.comm.narratorDesc": "Engaging, dramatic, story-driven",
    "ob.comm.guide": "Tour Guide",
    "ob.comm.guideDesc": "Friendly, simple, and highly accessible",
    "ob.comm.quick": "Quick Q&A",
    "ob.comm.quickDesc": "Short, direct answers, bullet points",

    "ob.misc.otherPlaceholder": "Type your purpose...",

    // ── Quiz UI ──
    "quiz.title": "Chapter Quiz",
    "quiz.chapterComplete": "Chapter complete!",
    "quiz.takeQuizPrompt": "Would you like to take the quiz?",
    "quiz.startQuiz": "Start Quiz",
    "quiz.skipQuiz": "Skip",
    "quiz.dontShowAgain": "Don't show again",
    "quiz.question": "Question",
    "quiz.of": "of",
    "quiz.submit": "Submit",
    "quiz.next": "Next",
    "quiz.correct": "Correct!",
    "quiz.incorrect": "Incorrect",
    "quiz.yourAnswer": "Your answer",
    "quiz.correctAnswer": "Correct answer",
    "quiz.explanation": "Explanation",
    "quiz.score": "Score",
    "quiz.quizComplete": "Quiz Complete!",
    "quiz.tryAgain": "Try Again",
    "quiz.viewHistory": "View History",
    "quiz.noQuestions": "No questions for this chapter yet",
    "quiz.typeShortAnswer": "Type your answer...",
    "quiz.true": "True",
    "quiz.false": "False",
    "quiz.grading": "Grading...",
    "quiz.gradingError": "Unable to grade your answer. Please try again.",
    "quiz.openQuiz": "Take Quiz",
    "quiz.previousChapter": "Previous chapter",
    "quiz.chapterNotCompleted":
      "Please finish reading at least one chapter before taking the quiz!",
    "quiz.shortAnswerPlaceholder": "Type your answer here...",
    "quiz.completedPercent": "Completed {percent}%",
    "quiz.resultsDetail": "Results Detail",
    "quiz.questionNumber": "Question {number}:",
    "quiz.finish": "Finish",
    "quiz.alreadyCompleted": "You have already completed the quiz for this chapter!",

    // ── Admin ──
    "admin.dashboard": "Admin Dashboard",
    "admin.quizManager": "Quiz Manager",
    "admin.addQuestion": "Add Question",
    "admin.editQuestion": "Edit Question",
    "admin.deleteQuestion": "Delete Question",
    "admin.generateWithAI": "Generate with AI",
    "admin.generating": "Generating...",
    "admin.publish": "Publish",
    "admin.unpublish": "Unpublish",
    "admin.draft": "Draft",
    "admin.published": "Published",
    "admin.performance": "Performance",
    "admin.totalAttempts": "Total Attempts",
    "admin.avgScore": "Average Score",
    "admin.Book": "Book",
    "admin.selectChapter": "Select chapter",
    "admin.questionType": "Question type",
    "admin.multipleChoice": "Multiple Choice",
    "admin.trueFalse": "True/False",
    "admin.shortAnswer": "Short Answer",
    "admin.acceptedAnswers": "Accepted answers (one per line)",
    "admin.options": "Options",
    "admin.correctOption": "Correct option",
    "admin.saveDraft": "Save Draft",
    "admin.publishNow": "Publish Now",
    "admin.addAll": "Add All",
    "admin.addToDraft": "Add to Draft",
    "admin.questionCount": "Question count",
    "admin.passRate": "Pass Rate",
    "admin.deleteConfirm": "Are you sure you want to delete this question?",
    "admin.quizDescription": "Manage questions for chapters",
    "admin.performanceDescription": "Manage quiz performance data",

    // ── User Dashboard ──
    "dashboard.title": "My Dashboard",
    "dashboard.quizHistory": "Quiz History",
    "dashboard.noHistory": "No quiz history yet",
    "dashboard.chapter": "Chapter",
    "dashboard.date": "Date",
    "dashboard.result": "Result",
    "dashboard.totalQuizzes": "Total Quizzes",
    "dashboard.bestScore": "Best Score",

    // ── Navbar extras ──
    "nav.dashboard": "Dashboard",
    "nav.admin": "Admin",
  },
} as const;

export type TranslationKey = keyof typeof translations.vi;
