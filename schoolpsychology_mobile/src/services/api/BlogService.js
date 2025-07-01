const blogs = [
  {
    id: 1,
    title: "Chăm sóc sức khỏe tâm thần: Tiếp cận dễ dàng cho mọi người",
    description:
      "Khám phá những tiêu chí giúp chăm sóc sức khỏe tâm thần trở nên gần gũi, dễ tiếp cận và hiệu quả hơn cho cộng đồng.",
    author: "manager",
    authorRole: "Chuyên gia tâm lý",
    date: "2025-05-05",
    image:
      "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=800&q=80",
    content: `\n**Sức khỏe tâm thần quan trọng như thế nào?**\n\nTheo báo cáo mới nhất của Tổ chức Y tế Thế giới, hơn 40% thanh thiếu niên gặp khó khăn về tâm lý nhưng chưa được tiếp cận dịch vụ hỗ trợ phù hợp. Việc nâng cao nhận thức và tạo điều kiện tiếp cận dịch vụ là vô cùng cần thiết.\n\n**Những rào cản thường gặp:**\n- Thiếu thông tin, kiến thức về sức khỏe tâm thần.\n- Ngại ngùng, e dè khi tìm kiếm sự giúp đỡ.\n- Thiếu niềm tin vào hiệu quả của các dịch vụ hỗ trợ.\n\n**Giải pháp:**\n- Đẩy mạnh truyền thông, giáo dục về sức khỏe tâm thần.\n- Xây dựng môi trường thân thiện, bảo mật thông tin cá nhân.\n- Đa dạng hóa các kênh tiếp cận: trực tuyến, trực tiếp, qua trường học...\n\n*Hãy cùng nhau lan tỏa thông điệp: Sức khỏe tâm thần là quyền lợi của tất cả mọi người!*\n    `,
  },
  {
    id: 2,
    title: "Sức mạnh của sự lắng nghe trong hỗ trợ tâm lý",
    description:
      "Lắng nghe chủ động là chìa khóa giúp người thân vượt qua khủng hoảng tâm lý. Học cách lắng nghe để đồng hành cùng nhau.",
    author: "manager",
    date: "2024-12-01",
    image:
      "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80",
    content: `Lắng nghe không chỉ là nghe, mà còn là thấu hiểu và đồng cảm. Khi ai đó đang trải qua khó khăn tâm lý, sự lắng nghe chủ động sẽ giúp họ cảm thấy được chia sẻ, giảm bớt áp lực và tìm ra hướng giải quyết phù hợp.\n\n**Bí quyết lắng nghe hiệu quả:**\n- Không ngắt lời\n- Thể hiện sự quan tâm qua ánh mắt, cử chỉ\n- Đặt câu hỏi mở để người đối diện chia sẻ nhiều hơn\n\n*Hãy là người bạn đồng hành đáng tin cậy!*`,
  },
  {
    id: 3,
    title: "Hành trình yêu thương bản thân mỗi ngày",
    description:
      "Tự yêu thương là nền tảng để xây dựng sức khỏe tinh thần vững chắc. Cùng khám phá những bước nhỏ để yêu chính mình hơn.",
    author: "manager",
    date: "2024-11-20",
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    content: `Yêu thương bản thân không phải là ích kỷ, mà là biết chăm sóc và trân trọng giá trị của mình. Hãy bắt đầu từ những điều nhỏ nhất: ngủ đủ giấc, ăn uống lành mạnh, dành thời gian cho sở thích cá nhân...\n\n**Gợi ý thực hành:**\n- Viết nhật ký biết ơn\n- Tự thưởng cho mình sau khi hoàn thành mục tiêu\n- Tha thứ cho bản thân khi mắc lỗi\n\n*Mỗi ngày một chút, bạn sẽ thấy mình mạnh mẽ và hạnh phúc hơn!*`,
  },
  {
    id: 4,
    title: "Vượt qua áp lực học tập: Bí quyết cho học sinh, sinh viên",
    description:
      "Áp lực học tập là điều không thể tránh khỏi. Làm sao để cân bằng và giữ vững tinh thần tích cực?",
    author: "manager",
    date: "2024-10-15",
    image:
      "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=800&q=80",
    content: `Áp lực học tập có thể khiến bạn mệt mỏi, căng thẳng. Hãy học cách quản lý thời gian, đặt mục tiêu hợp lý và đừng ngại tìm kiếm sự hỗ trợ từ thầy cô, bạn bè.\n\n**Mẹo nhỏ:**\n- Chia nhỏ nhiệm vụ lớn\n- Nghỉ giải lao hợp lý\n- Tập thể dục nhẹ nhàng\n\n*Học tập là hành trình, không phải cuộc đua!*`,
  },
  {
    id: 5,
    title: "Kết nối xã hội: Liều thuốc cho tâm hồn",
    description:
      "Những mối quan hệ tích cực giúp giảm căng thẳng, tăng cảm giác hạnh phúc và ý nghĩa cuộc sống.",
    author: "manager",
    date: "2024-09-30",
    image:
      "https://images.unsplash.com/photo-1503676382389-4809596d5290?auto=format&fit=crop&w=800&q=80",
    content: `Con người là sinh vật xã hội. Việc duy trì các mối quan hệ tích cực giúp chúng ta cảm thấy được yêu thương, chia sẻ và hỗ trợ khi cần thiết.\n\n**Cách xây dựng kết nối:**\n- Chủ động trò chuyện, hỏi thăm\n- Tham gia các hoạt động cộng đồng\n- Chia sẻ cảm xúc thật với người thân\n\n*Đừng ngần ngại mở lòng, bạn sẽ nhận lại nhiều hơn mong đợi!*`,
  },
  {
    id: 6,
    title: "Nghệ thuật chấp nhận bản thân",
    description:
      "Chấp nhận bản thân là bước đầu để chữa lành và phát triển. Hãy học cách trân trọng những điều chưa hoàn hảo.",
    author: "manager",
    date: "2024-09-10",
    image:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
    content: `Không ai hoàn hảo. Khi bạn học cách chấp nhận cả điểm mạnh lẫn điểm yếu của mình, bạn sẽ cảm thấy nhẹ nhõm và tự tin hơn.\n\n**Thực hành:**\n- Tự nhủ những câu tích cực mỗi ngày\n- Đừng so sánh bản thân với người khác\n- Ghi nhận sự tiến bộ của chính mình\n\n*Bạn xứng đáng được yêu thương, dù là phiên bản nào của chính mình!*`,
  },
  {
    id: 7,
    title: "Sức mạnh của lời động viên đúng lúc",
    description:
      "Một lời động viên có thể thay đổi cả một ngày, thậm chí là cuộc đời ai đó. Đừng ngần ngại trao đi sự tích cực!",
    author: "manager",
    date: "2024-08-25",
    image:
      "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=800&q=80",
    content: `Lời động viên, dù nhỏ bé, cũng có thể tiếp thêm sức mạnh cho người khác vượt qua khó khăn. Hãy học cách khen ngợi, khích lệ đúng lúc và chân thành.\n\n**Gợi ý:**\n- Gửi tin nhắn tích cực cho bạn bè\n- Động viên bản thân mỗi khi gặp thử thách\n- Lan tỏa năng lượng tốt đến mọi người xung quanh\n\n*Hãy là nguồn cảm hứng cho chính mình và người khác!*`,
  },
  {
    id: 8,
    title: "Quản lý cảm xúc: Kỹ năng cần thiết cho mọi lứa tuổi",
    description:
      "Biết nhận diện và điều tiết cảm xúc giúp chúng ta sống an yên, chủ động hơn trước mọi thử thách.",
    author: "manager",
    date: "2024-08-10",
    image:
      "https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=800&q=80",
    content: `Cảm xúc là một phần tự nhiên của cuộc sống. Khi biết quản lý cảm xúc, bạn sẽ kiểm soát tốt hơn hành động và quyết định của mình.\n\n**Bí quyết:**\n- Thở sâu, thiền định\n- Viết nhật ký cảm xúc\n- Tìm kiếm sự hỗ trợ khi cần\n\n*Hãy làm bạn với cảm xúc của mình!*`,
  },
  {
    id: 9,
    title: "Sống chậm lại để cảm nhận hạnh phúc",
    description:
      "Giữa nhịp sống hối hả, hãy dành thời gian cho bản thân, tận hưởng từng khoảnh khắc nhỏ bé của cuộc sống.",
    author: "manager",
    date: "2024-07-30",
    image:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=800&q=80",
    content: `Đôi khi, hạnh phúc đến từ những điều giản dị nhất: một tách trà nóng, một buổi chiều yên tĩnh, một nụ cười thân quen. Hãy sống chậm lại để cảm nhận và biết ơn những điều ấy.\n\n**Gợi ý:**\n- Tắt điện thoại, dành thời gian cho bản thân\n- Đi dạo, hít thở không khí trong lành\n- Ghi lại những khoảnh khắc khiến bạn mỉm cười\n\n*Hạnh phúc là hành trình, không phải đích đến!*`,
  },
];

export const getBlogs = () => Promise.resolve(blogs);

export const getBlogById = (id) =>
  Promise.resolve(blogs.find((blog) => blog.id === id));
