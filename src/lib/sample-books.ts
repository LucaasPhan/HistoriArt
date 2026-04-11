// ─── Vietnamese History Sample Books for Historiart ───────────

export interface BookData {
  id: string;
  title: string;
  author: string;
  description: string;
  era: string;
  coverGradient: [string, string];
  totalPages: number;
  pages: Record<number, string>;
}

export const SAMPLE_BOOKS: BookData[] = [
  {
    id: "dien-bien-phu",
    title: "Điện Biên Phủ — Điểm hẹn lịch sử",
    author: "Võ Nguyên Giáp",
    description:
      "Hồi ký của Đại tướng Võ Nguyên Giáp về chiến dịch Điện Biên Phủ 1954 — trận đánh chấn động địa cầu, kết thúc chín năm kháng chiến chống Pháp.",
    era: "Kháng chiến chống Pháp",
    coverGradient: ["#8B0000", "#D4A574"],
    totalPages: 8,
    pages: {
      1: `Mùa đông năm 1953, tình hình chiến trường Đông Dương có những chuyển biến lớn. Quân đội Pháp, dù được Mỹ viện trợ ngày càng nhiều, vẫn ngày càng lún sâu vào thế bị động. Tướng Navarre, Tổng chỉ huy quân viễn chinh Pháp, quyết định xây dựng Điện Biên Phủ thành một tập đoàn cứ điểm mạnh nhất Đông Dương.

Navarre tin rằng với lòng chảo Điện Biên Phủ — nơi có sân bay, hệ thống công sự kiên cố và hỏa lực mạnh — quân Pháp sẽ nghiền nát bất cứ cuộc tấn công nào của Việt Minh. Ông ta gọi đây là "một pháo đài bất khả xâm phạm".

Nhưng Navarre đã mắc sai lầm chiến lược nghiêm trọng. Ông ta đánh giá thấp ý chí và khả năng của quân đội nhân dân Việt Nam dưới sự chỉ huy của Đại tướng Võ Nguyên Giáp.`,

      2: `Sau khi cân nhắc kỹ lưỡng tình hình, Bộ Chính trị và Chủ tịch Hồ Chí Minh quyết định mở chiến dịch Điện Biên Phủ. Đại tướng Võ Nguyên Giáp được giao nhiệm vụ trực tiếp chỉ huy.

"Chiến dịch này rất quan trọng. Chắc thắng mới đánh, không chắc thắng không đánh," Bác Hồ căn dặn. Lời dặn ấy trở thành kim chỉ nam cho toàn bộ chiến dịch.

Sở chỉ huy chiến dịch đóng tại Mường Phăng, cách Điện Biên Phủ khoảng 25 km về phía đông. Từ đây, Đại tướng Giáp theo dõi sát sao mọi diễn biến và đưa ra những quyết định mang tính lịch sử.`,

      3: `Một trong những thử thách lớn nhất của chiến dịch là kéo pháo vào trận địa. Hàng ngàn chiến sĩ và dân công phải đưa những khẩu pháo nặng hàng tấn vượt qua đèo cao, rừng rậm, dưới làn bom đạn của không quân Pháp.

Tinh thần "Hò kéo pháo" vang vọng khắp núi rừng Tây Bắc. Mỗi đêm, bộ đội và dân công lại bắt tay vào công việc gian khổ, kéo pháo bằng sức người qua những con đường mòn cheo leo.

Trong một lần kéo pháo qua dốc cao, dây tời bị đứt, khẩu pháo trượt xuống dốc. Anh hùng Tô Vĩnh Diện không ngần ngại, ôm chèn lao vào bánh xe pháo để cứu khẩu pháo. Anh đã anh dũng hy sinh, trở thành biểu tượng của tinh thần quả cảm.`,

      4: `Sau nhiều ngày chuẩn bị, phương châm tác chiến ban đầu là "đánh nhanh, thắng nhanh". Tuy nhiên, khi phân tích kỹ hơn tình hình thực tế, Đại tướng Giáp nhận thấy công sự địch rất vững chắc, hỏa lực mạnh, và quân ta chưa có kinh nghiệm đánh tập đoàn cứ điểm.

Đây là quyết định khó khăn nhất trong đời cầm quân của tôi. Kéo pháo vào đã gian khổ, giờ lại phải kéo pháo ra. Nhưng tôi biết rằng nếu đánh nhanh, chúng ta sẽ thất bại.

Giáp quyết định chuyển sang phương châm "đánh chắc, tiến chắc" — bao vây, chia cắt, tiêu diệt từng cứ điểm. Quyết định này đã thay đổi cục diện chiến dịch.`,

      5: `Ngày 13 tháng 3 năm 1954, chiến dịch Điện Biên Phủ chính thức bắt đầu. Đợt tấn công thứ nhất nhằm vào cụm cứ điểm phía bắc: Him Lam và Độc Lập. Pháo binh Việt Minh nã đạn dữ dội vào trận địa Pháp — điều mà Navarre không hề dự tính.

Đại tá Piroth, chỉ huy pháo binh Pháp, đã tuyên bố sẽ bịt miệng pháo Việt Minh trong vòng vài giờ. Nhưng thực tế hoàn toàn ngược lại. Pháo Việt Minh được giấu kín trong hầm, bắn trực tiếp với độ chính xác cao, khiến sân bay và công sự Pháp bị tàn phá nặng nề.

Him Lam thất thủ ngay trong đêm đầu tiên. Piroth tuyệt vọng, tự kết liễu đời mình. Bài Quốc tế ca trầm hùng vang lên giữa lòng chảo khi cờ Việt Minh tung bay trên cứ điểm vừa chiếm được.`,

      6: `Đợt tấn công thứ hai diễn ra từ ngày 30 tháng 3 đến giữa tháng 4. Mục tiêu là các ngọn đồi phía đông — nơi quân Pháp phòng thủ kiên cố nhất. Trận đánh trên đồi A1 trở thành cuộc chiến giành giật ác liệt nhất của toàn chiến dịch.

Bộ đội ta đào giao thông hào, chạy dích dắc tiến vào sát chân đồi, để giảm thương vong khi xung phong. Hệ thống hào liên hoàn dài hàng chục kilômét bao quanh tập đoàn cứ điểm.

Mùa mưa đến sớm, biến lòng chảo thành biển bùn. Cả hai bên đều kiệt sức, nhưng quân Pháp ngày càng kiệt quệ vì tiếp tế chỉ dựa vào đường không — và đường không cũng bị pháo phòng không Việt Minh khống chế.`,

      7: `Đợt tấn công thứ ba và cuối cùng bắt đầu ngày 1 tháng 5. Quân Việt Minh siết chặt vòng vây, tấn công ồ ạt vào các cứ điểm còn lại.

Ngày 6 tháng 5, bộ đội ta cho nổ một khối thuốc nổ gần 1 tấn đã được đào hầm ngầm đặt ngay dưới đồi A1. Tiếng nổ rung chuyển cả lòng chảo. Lá cờ "Quyết chiến quyết thắng" tung bay trên đỉnh đồi.

Chiều ngày 7 tháng 5 năm 1954, tướng De Castries cùng toàn bộ ban tham mưu bị bắt sống. Lá cờ trắng kéo lên trên hầm chỉ huy. Sau 56 ngày đêm chiến đấu, chiến dịch Điện Biên Phủ toàn thắng.`,

      8: `Chiến thắng Điện Biên Phủ vang dội năm châu, chấn động địa cầu. Một dân tộc thuộc địa nhỏ bé đã đánh bại đội quân viễn chinh hùng mạnh của đế quốc thực dân Pháp — chấm dứt gần một thế kỷ đô hộ.

Tại Hội nghị Genève, Hiệp định đình chiến được ký kết ngày 21 tháng 7 năm 1954. Pháp phải rút quân khỏi Đông Dương. Miền Bắc Việt Nam được hoàn toàn giải phóng.

"Lịch sử Việt Nam đã ghi thêm một trang chói lọi. Điện Biên Phủ cùng với trận Bạch Đằng, Chi Lăng, Đống Đa... đời đời sáng mãi," Đại tướng Võ Nguyên Giáp viết trong hồi ký.

Chiến thắng này không chỉ mang ý nghĩa với Việt Nam mà còn cổ vũ phong trào giải phóng dân tộc trên toàn thế giới, mở ra kỷ nguyên sụp đổ của chủ nghĩa thực dân.`,
    },
  },
  {
    id: "an-tu-cong-chua",
    title: "An Tư",
    author: "Nguyễn Huy Tưởng",
    description:
      "Tiểu thuyết lịch sử về Công chúa An Tư thời nhà Trần — người đã hy sinh thân mình gả cho tướng Mông Cổ để cứu nước trong cuộc kháng chiến chống quân Nguyên lần thứ hai (1285).",
    era: "Chống Mông Nguyên",
    coverGradient: ["#2C1810", "#C4956A"],
    totalPages: 8,
    pages: {
      1: `Mùa xuân năm Ất Dậu (1285), triều đình nhà Trần đang đứng trước hiểm họa lớn nhất trong lịch sử. Năm mươi vạn quân Mông Nguyên dưới quyền chỉ huy của Thái tử Thoát Hoan đã tràn qua biên giới, ào ạt tiến về Thăng Long.

Đây là đội quân hùng mạnh nhất thế giới thời bấy giờ — đội quân đã chinh phục gần như toàn bộ châu Á và một phần châu Âu. Bước chân vó ngựa Mông Cổ đi đến đâu, cỏ không mọc được đến đó.

Khắp kinh thành Thăng Long, không khí lo âu bao trùm. Nhưng vua Trần Nhân Tông vẫn kiên quyết: "Đầu thần chưa rơi xuống đất, xin bệ hạ đừng lo" — lời Trần Hưng Đạo đã trở thành lời thề của cả dân tộc.`,

      2: `Hội nghị Diên Hồng được triệu tập. Các bô lão từ khắp nơi kéo về kinh thành. Vua Trần Nhân Tông hỏi giữa triều đình: "Quân Nguyên tràn sang, nên hòa hay nên đánh?"

"Đánh! Đánh! Đánh!" — tiếng hô vang dội điện Diên Hồng. Những ông già râu tóc bạc phơ, đã sống qua mấy chục mùa gặt, nay đứng lên cùng cất tiếng đánh giặc. Đó là tiếng nói của cả dân tộc.

Hưng Đạo Vương Trần Quốc Tuấn ban Hịch tướng sĩ cho toàn quân. Những dòng hịch cháy bỏng: "Ta thường tới bữa quên ăn, nửa đêm vỗ gối; ruột đau như cắt, nước mắt đầm đìa..." Mỗi tướng sĩ đều thích vào cánh tay hai chữ "Sát Thát" — giết giặc Mông Cổ.`,

      3: `Giữa cơn binh lửa, An Tư công chúa — em gái vua Trần Nhân Tông — sống những ngày thanh bình cuối cùng trong hoàng thành. Nàng là người con gái đẹp nhất kinh thành, với đôi mắt sáng như sao, mái tóc mượt như dòng suối.

An Tư không chỉ đẹp mà còn thông minh và can đảm. Nàng biết đọc chữ Hán, hiểu binh pháp, và luôn theo dõi tin tức chiến trường. Nàng biết rằng vận mệnh đất nước đang treo trên sợi tóc.

Nhưng nàng chưa bao giờ nghĩ rằng chính mình sẽ trở thành một phần của chiến lược — rằng thân phận một công chúa có thể là lá bài cuối cùng trong cuộc cờ giữa hai nước.`,

      4: `Quân Mông Nguyên tiến như vũ bão. Các tướng Trần anh dũng chiến đấu nhưng lực lượng chênh lệch quá lớn. Thăng Long thất thủ. Triều đình phải rời đô, rút về phía nam.

Trong tình thế ngàn cân treo sợi tóc, triều đình quyết định dùng kế "mỹ nhân". Gả công chúa cho Thoát Hoan để kéo dài thời gian, lợi dụng sự chủ quan của giặc.

An Tư nhận lệnh. Nàng không khóc, không van xin. Nàng hiểu rằng đây là sứ mệnh — là cách nàng chiến đấu. "Nếu nước mất, ta cũng mất. Chi bằng lấy thân mình đổi lấy thời gian cho đất nước," nàng nói, giọng bình thản nhưng mắt đỏ hoe.`,

      5: `An Tư vào trại giặc. Thoát Hoan — viên tướng trẻ kiêu ngạo — say mê vẻ đẹp của nàng công chúa. Y giữ nàng bên cạnh, bớt dần sự cảnh giác.

Trong khi đó, Trần Hưng Đạo bí mật tập hợp lực lượng. Quân dân khắp nơi nổi dậy. Lương thảo của giặc bị cắt đứt. Thời tiết nóng bức và dịch bệnh hoành hành trong doanh trại Mông Cổ.

An Tư, ở trong lòng giặc, âm thầm gửi tin tức ra ngoài. Nàng là đôi mắt, đôi tai của quân ta ngay trong sào huyệt của kẻ thù. Mỗi đêm, nàng nén nước mắt, nhớ về quê hương mình đang rên xiết.`,

      6: `Mùa hè năm 1285, khi quân Nguyên đã kiệt sức, Trần Hưng Đạo phát lệnh phản công. Trận Chương Dương, trận Hàm Tử — những chiến thắng vang dội liên tiếp.

Quân Trần đại phá quân Nguyên tại trận Tây Kết. Tướng giặc Toa Đô bị chém đầu. Thoát Hoan hoảng sợ, phải chui vào ống đồng để binh sĩ khiêng chạy sang biên giới.

Thăng Long được giải phóng. Trong niềm vui chiến thắng, không ai quên người công chúa đã hy sinh. An Tư — nàng ở đâu giữa cuộc rút lui hỗn loạn của quân Nguyên? Lịch sử không ghi lại rõ ràng, và đó mãi mãi là câu hỏi đau xót.`,

      7: `Cuộc kháng chiến chống quân Nguyên lần thứ hai kết thúc thắng lợi. Vua Trần Nhân Tông trở về Thăng Long trong niềm reo hò của muôn dân. Đất nước sạch bóng quân thù.

Nhưng An Tư công chúa — người đã góp phần không nhỏ vào chiến thắng — không bao giờ trở về. Nàng biến mất trong sương mù lịch sử, cùng với bao câu chuyện chưa kể.

Có người nói nàng chết trên đường rút quân. Có người nói nàng bị giặc mang về phương Bắc. Dù thế nào, sự hy sinh của nàng đã trở thành biểu tượng cho những người phụ nữ Việt Nam sẵn sàng đặt vận mệnh Tổ quốc lên trên hạnh phúc cá nhân.`,

      8: `Sau chiến thắng, Hưng Đạo Vương Trần Quốc Tuấn soạn "Binh thư yếu lược" — một tác phẩm quân sự để lại cho đời sau. Trong đó, ông nhắc đến công lao của tất cả mọi người, từ tướng lĩnh đến dân thường.

Nhà Trần tiếp tục đánh bại quân Nguyên lần thứ ba năm 1288 với chiến thắng Bạch Đằng lịch sử. Ba lần đánh thắng đế quốc Mông Cổ — kỳ tích mà không quốc gia nào trên thế giới làm được.

An Tư công chúa, dù không có mặt trong lễ mừng chiến thắng, nhưng tên nàng mãi mãi được khắc trong lịch sử dân tộc. Câu chuyện của nàng nhắc nhở rằng chiến thắng được tạo nên không chỉ bằng gươm giáo mà còn bằng những hy sinh thầm lặng, bằng tình yêu nước cháy bỏng trong trái tim mỗi người.`,
    },
  },
  {
    id: "mua-xuan-1975",
    title: "Đại thắng mùa Xuân 1975",
    author: "Văn Tiến Dũng",
    description:
      "Hồi ký của Đại tướng Văn Tiến Dũng về chiến dịch Hồ Chí Minh và Tổng tiến công mùa Xuân 1975 — sự kiện thống nhất đất nước sau 30 năm chia cắt.",
    era: "Kháng chiến chống Mỹ",
    coverGradient: ["#1B4332", "#D4A574"],
    totalPages: 8,
    pages: {
      1: `Đầu năm 1975, tình hình chiến trường miền Nam Việt Nam có những chuyển biến mang tính bước ngoặt. Chiến thắng Phước Long tháng 1/1975 là phép thử quan trọng — lần đầu tiên quân giải phóng chiếm được hoàn toàn một tỉnh, và Mỹ không can thiệp.

Bộ Chính trị nhận định: thời cơ chiến lược đã đến. Kế hoạch giải phóng miền Nam ban đầu dự tính trong hai năm (1975-1976), nhưng diễn biến thực tế đã đẩy nhanh tốc độ hơn mọi dự kiến.

Tại Hội nghị Bộ Chính trị mở rộng tháng 1/1975, quyết định lịch sử được đưa ra: mở cuộc tổng tấn công chiến lược, giải phóng hoàn toàn miền Nam, thống nhất Tổ quốc.`,

      2: `Chiến dịch Tây Nguyên mở màn ngày 4 tháng 3 năm 1975. Mục tiêu đầu tiên là Buôn Ma Thuột — thị xã được coi là "xương sống" của phòng tuyến Tây Nguyên.

Trận đánh diễn ra chớp nhoáng. Quân giải phóng tấn công bất ngờ, đánh chiếm Buôn Ma Thuột chỉ trong 32 giờ. Tổng thống Nguyễn Văn Thiệu ra lệnh rút quân khỏi Tây Nguyên — một quyết định tai hại.

Cuộc rút quân biến thành cuộc tháo chạy hỗn loạn trên "Đường số 7 — con đường máu". Hàng vạn binh sĩ VNCH tan rã. Từ đây, hiệu ứng domino bắt đầu: Pleiku, Kon Tum lần lượt thất thủ.`,

      3: `Thấy tình hình chuyển biến cực kỳ thuận lợi, Bộ Chính trị quyết định đẩy nhanh tốc độ. "Thần tốc, thần tốc hơn nữa! Táo bạo, táo bạo hơn nữa!" — mệnh lệnh của Đại tướng Giáp truyền đi khắp các mặt trận.

Chiến dịch Huế-Đà Nẵng diễn ra như bão táp. Ngày 25 tháng 3, Huế — cố đô lịch sử — được giải phóng. Ngày 29 tháng 3, Đà Nẵng — thành phố lớn thứ hai miền Nam — thất thủ chỉ trong vòng 32 giờ.

Tốc độ tiến quân nhanh đến mức nhiều đơn vị vượt qua mục tiêu được giao mà quân địch chưa kịp tổ chức phòng thủ.`,

      4: `Bộ Chính trị quyết định mở Chiến dịch Hồ Chí Minh — chiến dịch cuối cùng, nhằm giải phóng Sài Gòn. Đại tướng Văn Tiến Dũng được giao chỉ huy chiến dịch.

Năm cánh quân lớn hội tụ từ mọi hướng, siết chặt vòng vây quanh Sài Gòn. Hàng ngàn xe tăng, pháo binh, và hàng chục vạn bộ đội sẵn sàng cho trận đánh quyết định.

"Trận đánh cuối cùng đã đến," Đại tướng Dũng viết. Chiến dịch được đặt tên theo Bác Hồ — người đã ra đi mà chưa kịp nhìn thấy ngày thống nhất.`,

      5: `Sáng ngày 26 tháng 4 năm 1975, chiến dịch Hồ Chí Minh chính thức bắt đầu. Pháo binh và tên lửa nã vào sân bay Tân Sơn Nhất, các căn cứ quân sự quanh Sài Gòn.

Trên đường phố Sài Gòn, không khí hỗn loạn. Người Mỹ tổ chức di tản bằng trực thăng từ nóc Đại sứ quán. Hình ảnh những chiếc trực thăng cất cánh vội vã giữa biển người trở thành biểu tượng cho sự kết thúc của một thời kỳ.

Tổng thống Dương Văn Minh — vừa nhậm chức — kêu gọi ngừng bắn, nhưng quân giải phóng không dừng bước.`,

      6: `Sáng ngày 30 tháng 4, xe tăng quân giải phóng húc đổ cổng Dinh Độc Lập. Đây là khoảnh khắc lịch sử mà cả dân tộc chờ đợi suốt 30 năm.

Xe tăng mang số hiệu 390 — do trung úy Bùi Quang Thận lái — là chiếc đầu tiên tiến vào sân Dinh. Lá cờ giải phóng tung bay trên nóc Dinh Độc Lập lúc 11 giờ 30 phút.

Tổng thống Dương Văn Minh tuyên bố đầu hàng vô điều kiện. "Chúng tôi chờ quân giải phóng đến để bàn giao chính quyền," ông nói. Cuộc chiến tranh dài nhất thế kỷ XX kết thúc.`,

      7: `Sài Gòn được giải phóng. Niềm vui vỡ òa trên khắp đường phố. Người dân đổ ra đường, ôm nhau khóc, cười trong nước mắt. Cờ đỏ sao vàng tung bay trên mọi ngôi nhà.

Bộ đội giải phóng — những người lính trẻ từ miền Bắc, từ rừng núi Tây Nguyên, từ đồng bằng sông Cửu Long — lần đầu tiên nhìn thấy thành phố lớn. Nhiều người chưa bao giờ thấy thang máy, chưa bao giờ uống nước đá.

Họ không đốt phá, không trả thù. Họ kỷ luật, lịch sự, và mỉm cười. Đó là hình ảnh đẹp nhất của ngày thống nhất.`,

      8: `Chiến dịch Hồ Chí Minh kết thúc. Đất nước thống nhất sau 30 năm chia cắt, 21 năm kháng chiến. Tổn thất là không thể đo đếm — hàng triệu người hy sinh, hàng triệu gia đình ly tán.

"Bác ơi, Bác yên nghỉ. Chiến dịch mang tên Bác đã toàn thắng!" — đó là dòng điện gửi về Hà Nội khi Sài Gòn được giải phóng.

Ngày 30 tháng 4 trở thành ngày lịch sử của dân tộc — ngày Giải phóng miền Nam, thống nhất đất nước. Từ đây, Việt Nam bước vào kỷ nguyên mới: hòa bình, độc lập, và thống nhất.

Non sông thu về một mối. Bắc Nam sum họp một nhà. Ước nguyện ngàn đời của dân tộc Việt Nam cuối cùng đã thành hiện thực.`,
    },
  },
];
