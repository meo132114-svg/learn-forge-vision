// Holland Code Test Questions - Complete Data
// Based on Dr. John Holland's theory

export interface HollandQuestion {
  id: number;
  text: string;
  group: 'R' | 'I' | 'A' | 'S' | 'E' | 'C';
}

export interface HollandGroup {
  code: 'R' | 'I' | 'A' | 'S' | 'E' | 'C';
  name: string;
  fullName: string;
  color: string;
  description: string;
  careers: string[];
}

export const hollandGroups: HollandGroup[] = [
  {
    code: 'R',
    name: 'Kỹ thuật',
    fullName: 'Realistic - Nhóm Kỹ thuật',
    color: 'holland-r',
    description: 'Yếu tố di truyền và kinh nghiệm của nhóm Kỹ thuật dẫn đến sự ưu tiên cho các hoạt động đòi hỏi sự tương tác với các đồ vật, công cụ, máy móc và động vật một cách rõ ràng, có trật tự hoặc có hệ thống. Những khuynh hướng hành vi này dẫn đến việc thu được các năng lực thủ công, cơ khí, nông nghiệp, điện và kỹ thuật.',
    careers: ['Kỹ sư cơ khí', 'Kỹ thuật viên điện', 'Thợ sửa chữa', 'Nông nghiệp', 'Xây dựng', 'Thể thao']
  },
  {
    code: 'I',
    name: 'Nghiên cứu',
    fullName: 'Investigative - Nhóm Nghiên cứu',
    color: 'holland-i',
    description: 'Yếu tố di truyền và kinh nghiệm của nhóm Nghiên cứu dẫn đến việc ưu tiên cho các hoạt động đòi hỏi sự điều tra các hiện tượng vật lý, sinh học và văn hóa theo phương pháp quan sát, tượng trưng, có hệ thống và sáng tạo để hiểu và kiểm soát các hiện tượng đó.',
    careers: ['Nhà khoa học', 'Bác sĩ', 'Nhà nghiên cứu', 'Dược sĩ', 'Lập trình viên', 'Nhà phân tích']
  },
  {
    code: 'A',
    name: 'Nghệ thuật',
    fullName: 'Artistic - Nhóm Nghệ thuật',
    color: 'holland-a',
    description: 'Yếu tố di truyền và kinh nghiệm của nhóm Nghệ thuật dẫn đến việc ưu tiên cho các hoạt động chưa rõ ràng, tự do, chưa được hệ thống hóa. Các hoạt động này đòi hỏi sự vận dụng các vật liệu vật lý, qua ngôn ngữ nói, hoặc liên quan đến con người để tạo ra các hình thức hoặc sản phẩm nghệ thuật.',
    careers: ['Họa sĩ', 'Nhạc sĩ', 'Nhà thiết kế', 'Nhà văn', 'Diễn viên', 'Nhiếp ảnh gia']
  },
  {
    code: 'S',
    name: 'Xã hội',
    fullName: 'Social - Nhóm Xã hội',
    color: 'holland-s',
    description: 'Yếu tố di truyền và kinh nghiệm của nhóm Xã hội dẫn đến việc ưu tiên cho các hoạt động đòi hỏi làm việc với người khác để thông báo, huấn luyện, phát triển, chữa lành hoặc giác ngộ. Những khuynh hướng hành vi này dẫn đến việc thu được các khả năng liên quan đến con người như năng lực giao tiếp giữa các cá nhân.',
    careers: ['Giáo viên', 'Tư vấn viên', 'Nhân viên xã hội', 'Y tá', 'Nhà tâm lý', 'Huấn luyện viên']
  },
  {
    code: 'E',
    name: 'Quản lý',
    fullName: 'Enterprising - Nhóm Quản lý',
    color: 'holland-e',
    description: 'Yếu tố di truyền và kinh nghiệm của nhóm Quản lý dẫn đến sự ưu tiên cho các hoạt động đòi hỏi sự ảnh hưởng và chi phối lên người khác để đạt được các mục tiêu của tổ chức hoặc lợi ích kinh tế. Những khuynh hướng hành vi này dẫn đến việc thu được các năng lực lãnh đạo, giao tiếp giữa các cá nhân và thuyết phục.',
    careers: ['Doanh nhân', 'Quản lý', 'Luật sư', 'Chính trị gia', 'Sales', 'Marketing']
  },
  {
    code: 'C',
    name: 'Nghiệp vụ',
    fullName: 'Conventional - Nhóm Nghiệp vụ',
    color: 'holland-c',
    description: 'Yếu tố di truyền và kinh nghiệm của nhóm Nghiệp vụ dẫn đến sự ưu tiên cho các hoạt động đòi hỏi phải xử lý dữ liệu rõ ràng, có trật tự, có hệ thống. Ví dụ cụ thể là việc lưu giữ hồ sơ, lưu trữ tài liệu, sắp xếp dữ liệu văn bản và dữ liệu số theo kế hoạch quy định.',
    careers: ['Kế toán', 'Thư ký', 'Nhân viên hành chính', 'Ngân hàng', 'Kiểm toán', 'Phân tích dữ liệu']
  }
];

export const hollandQuestions: HollandQuestion[] = [
  // NHÓM R - Kỹ thuật (Realistic) - 19 câu
  { id: 1, text: 'Thích học công nghệ (thử lắp ráp đồ đạc, máy móc, v.v.)', group: 'R' },
  { id: 2, text: 'Thích thao tác trên máy tính để giải trí hoặc học tập', group: 'R' },
  { id: 3, text: 'Thích sửa chữa vật dụng/đồ dùng cá nhân', group: 'R' },
  { id: 4, text: 'Thích cài đặt và kiểm tra ứng dụng trên điện thoại hoặc máy tính', group: 'R' },
  { id: 5, text: 'Thích chuẩn bị và lắp ráp vật dụng cắm trại, dã ngoại, trại hè', group: 'R' },
  { id: 6, text: 'Thường chạy xe đạp trong thời gian rảnh', group: 'R' },
  { id: 7, text: 'Thường lắp ráp mô hình Lego hoặc mô hình xe trong thời gian rảnh', group: 'R' },
  { id: 8, text: 'Thường tham gia các hoạt động thể thao/thể dục/vận động ngoài trời trong thời gian rảnh', group: 'R' },
  { id: 9, text: 'Thường trồng cây/trồng hoa trong thời gian rảnh', group: 'R' },
  { id: 10, text: 'Thường chơi với thú nuôi trong nhà hay thú nuôi nhà hàng xóm trong thời gian rảnh', group: 'R' },
  { id: 11, text: 'Thường mất ít thời gian (so với những hoạt động khác) để học một môn thể thao hay vận động mới', group: 'R' },
  { id: 12, text: 'Thường mất ít thời gian (so với những hoạt động khác) để học một công cụ, công nghệ, hay máy móc mới', group: 'R' },
  { id: 13, text: 'Thường mất ít thời gian (so với những hoạt động khác) để học chạy xe đạp, xe máy/xe điện, hay một phương tiện di chuyển nào đó', group: 'R' },
  { id: 14, text: 'Thường mất ít thời gian (so với những hoạt động khác) khi học và thực hành sửa chữa các đồ vật, máy móc trong nhà', group: 'R' },
  { id: 15, text: 'Thường mất ít thời gian (so với những hoạt động khác) khi học cách chăm sóc, hiểu, và tương tác với thú nuôi', group: 'R' },
  { id: 16, text: 'Phần lớn thời gian thích làm việc với đồ vật/máy móc/dụng cụ hơn với con người', group: 'R' },
  { id: 17, text: 'Thường yêu cầu thông tin phải cụ thể, rõ ràng từ người khác', group: 'R' },
  { id: 18, text: 'Phần lớn thời gian nói thẳng những gì đang nghĩ trong lòng', group: 'R' },
  { id: 19, text: 'Thường ít chia sẻ ý kiến khi mới gặp người lạ', group: 'R' },

  // NHÓM I - Nghiên cứu (Investigative) - 19 câu
  { id: 20, text: 'Thích tìm hiểu về chủ đề mình thích qua sách báo hoặc video', group: 'I' },
  { id: 21, text: 'Thích nghiên cứu cách giải quyết vấn đề mà mình quan tâm', group: 'I' },
  { id: 22, text: 'Thích quan sát và phân tích sự vật hoặc hành vi con người', group: 'I' },
  { id: 23, text: 'Thích đặt câu hỏi về chủ đề mình hứng thú', group: 'I' },
  { id: 24, text: 'Thích lý giải vấn đề trong cuộc sống một cách hợp lý (logic)', group: 'I' },
  { id: 25, text: 'Thường tìm hiểu về nguồn gốc của trái đất, mặt trời, và các vì sao trong thời gian rảnh', group: 'I' },
  { id: 26, text: 'Thường ngồi suy ngẫm về đề tài các con ưa thích trong thời gian rảnh', group: 'I' },
  { id: 27, text: 'Thường chọn một đề tài (lịch sử, tâm lý, văn hoá, nghệ thuật, khoa học, v.v.) để tìm hiểu khi rảnh', group: 'I' },
  { id: 28, text: 'Thường học theo cách riêng của mình', group: 'I' },
  { id: 29, text: 'Thường quan sát, tìm hiểu, và có ý kiến của riêng mình về con người hay sự vật quanh mình', group: 'I' },
  { id: 30, text: 'Có khả năng phân tích một vấn đề cụ thể, rõ ràng, với chính kiến riêng', group: 'I' },
  { id: 31, text: 'Có khả năng quan sát những gì xảy ra quanh mình một cách khách quan và dựa trên chứng cứ', group: 'I' },
  { id: 32, text: 'Mất ít thời gian (so với những hoạt động khác) khi học những môn học (hoặc khối tự nhiên, hoặc khối xã hội, có khi đều các môn) ở trường', group: 'I' },
  { id: 33, text: 'Mất ít thời gian (so với những hoạt động khác) khi tiếp thu những kiến thức mới', group: 'I' },
  { id: 34, text: 'Khi đã quan tâm đề tài gì thì tìm hiểu rất sâu và có thể giải thích cặn kẽ, rõ ràng cho người khác', group: 'I' },
  { id: 35, text: 'Khi đã tìm hiểu kỹ và tin chắc vào điều gì thì khó bị thuyết phục để đổi ý kiến', group: 'I' },
  { id: 36, text: 'Có suy nghĩ và hành vi già hơn bạn đồng tuổi (hay bị gọi đùa là ông cụ non, bà cụ non)', group: 'I' },
  { id: 37, text: 'Thường không tham gia các hoạt động xã hội hay vận động ngoài trời', group: 'I' },
  { id: 38, text: 'Thường khó ra quyết định vì luôn muốn tìm hiểu đầy đủ thông tin hơn', group: 'I' },

  // NHÓM A - Nghệ thuật (Artistic) - 19 câu
  { id: 39, text: 'Thích tham gia câu lạc bộ âm nhạc, hội họa, văn nghệ', group: 'A' },
  { id: 40, text: 'Thích minh họa các ý tưởng qua hình ảnh hoặc điệu bộ', group: 'A' },
  { id: 41, text: 'Thích sáng tạo nội dung (âm nhạc, bài văn, tranh ảnh, v.v.) theo cảm hứng', group: 'A' },
  { id: 42, text: 'Thích học chơi nhạc cụ', group: 'A' },
  { id: 43, text: 'Thích phác họa và vẽ tranh', group: 'A' },
  { id: 44, text: 'Thường bị thu hút bởi những gì liên quan đến cái đẹp (người, quang cảnh, thời trang, vật dụng hàng ngày, v.v.)', group: 'A' },
  { id: 45, text: 'Dành thời gian rảnh để học một hay nhiều trong những môn sau: vẽ, chụp hình, âm nhạc, hát, đóng kịch, múa, nhảy, viết truyện, kể chuyện', group: 'A' },
  { id: 46, text: 'Tự chọn và mua trang phục cho bản thân', group: 'A' },
  { id: 47, text: 'Thường đọc sách, xem phim hay Youtube, nghe nhạc, xem kịch nghệ trong thời gian rảnh', group: 'A' },
  { id: 48, text: 'Thường chọc cười người khác bằng cách làm trò, biểu diễn, kể chuyện cười', group: 'A' },
  { id: 49, text: 'Thường có những ý tưởng mới và sáng tạo trong lĩnh vực các con quan tâm', group: 'A' },
  { id: 50, text: 'Có trí tưởng tượng phong phú từ khi còn rất nhỏ', group: 'A' },
  { id: 51, text: 'Thường có gu thẩm mỹ độc đáo, khác lạ', group: 'A' },
  { id: 52, text: 'Thường mất ít thời gian (so với những hoạt động khác) khi học một hay nhiều trong những môn sau: vẽ, chụp hình, âm nhạc, hát, đóng kịch, múa, nhảy, viết truyện, kể chuyện', group: 'A' },
  { id: 53, text: 'Thường thu hút sự chú ý của bạn bè chung lớp hay người xung quanh', group: 'A' },
  { id: 54, text: 'Thường xúc động trước các hoạt động nghệ thuật yêu thích', group: 'A' },
  { id: 55, text: 'Thường nhạy cảm trước cái đẹp', group: 'A' },
  { id: 56, text: 'Thường dao động giữa hai cung bậc cảm xúc vui buồn', group: 'A' },
  { id: 57, text: 'Thường nghĩ hay làm những điều tạo nét riêng cho bản thân (trang phục, trang điểm, chọn lựa nhạc, v.v..)', group: 'A' },

  // NHÓM S - Xã hội (Social) - 19 câu
  { id: 58, text: 'Thích giảng hòa cuộc tranh cãi giữa những người bạn', group: 'S' },
  { id: 59, text: 'Sẵn lòng dành thời gian cho các em nhỏ', group: 'S' },
  { id: 60, text: 'Thích giúp bạn bè vượt qua trở ngại trong học tập', group: 'S' },
  { id: 61, text: 'Thích làm vui lòng người khác', group: 'S' },
  { id: 62, text: 'Thích quan tâm đến cảm xúc của người xung quanh', group: 'S' },
  { id: 63, text: 'Thường hay giúp đỡ bạn bè', group: 'S' },
  { id: 64, text: 'Thường ưu tiên mong muốn của người khác trước mong muốn của bản thân', group: 'S' },
  { id: 65, text: 'Thường dạy và chơi chung với trẻ nhỏ hơn trong thời gian rảnh', group: 'S' },
  { id: 66, text: 'Thường tham gia hoạt động xã hội hay từ thiện trong thời gian rảnh', group: 'S' },
  { id: 67, text: 'Thường lắng nghe bạn bè hay người quen khi họ có nhu cầu', group: 'S' },
  { id: 68, text: 'Rất nhạy trong việc hiểu cảm xúc của người khác', group: 'S' },
  { id: 69, text: 'Thường tạo được thiện cảm với người khác trong thời gian ngắn', group: 'S' },
  { id: 70, text: 'Thường diễn đạt cảm xúc và ý tưởng của bản thân dễ dàng', group: 'S' },
  { id: 71, text: 'Mất ít thời gian (so với những hoạt động khác) khi học các kiến thức liên quan đến ngôn ngữ (văn học, ngoại ngữ)', group: 'S' },
  { id: 72, text: 'Mất ít thời gian (so với những hoạt động khác) khi học các kiến thức liên quan đến tâm lý và cảm xúc', group: 'S' },
  { id: 73, text: 'Thường mủi lòng trước đau khổ của người khác', group: 'S' },
  { id: 74, text: 'Thường làm theo ý người khác ngay cả khi không muốn', group: 'S' },
  { id: 75, text: 'Hay cười và thân thiện với người khác', group: 'S' },
  { id: 76, text: 'Thường quan tâm đến những vấn đề của cộng đồng hay xã hội (như giảm nạn đói, bảo vệ môi trường, v.v.)', group: 'S' },

  // NHÓM E - Quản lý (Enterprising) - 19 câu
  { id: 77, text: 'Thích trình bày thông tin trước lớp', group: 'E' },
  { id: 78, text: 'Thích giao nhiệm vụ cho thành viên trong nhóm', group: 'E' },
  { id: 79, text: 'Thích đảm nhiệm vai trò quản lý lớp (lớp trưởng, lớp phó, v.v.)', group: 'E' },
  { id: 80, text: 'Thích xung phong làm nhóm trưởng', group: 'E' },
  { id: 81, text: 'Thích dẫn đầu, dẫn dắt người khác', group: 'E' },
  { id: 82, text: 'Thường thuyết phục người khác theo ý mình', group: 'E' },
  { id: 83, text: 'Thường nói về ý muốn kiếm tiền và kinh doanh trong tương lai', group: 'E' },
  { id: 84, text: 'Thường ứng cử các vị trí quan trọng trong lớp hay trường', group: 'E' },
  { id: 85, text: 'Thường đọc và học từ những tấm gương thành công trong kinh doanh', group: 'E' },
  { id: 86, text: 'Thường kết bạn rất nhanh và có mạng lưới bạn bè khá rộng', group: 'E' },
  { id: 87, text: 'Thường ra quyết định nhanh chóng', group: 'E' },
  { id: 88, text: 'Thường thành công trong việc thuyết phục bạn bè làm theo ý kiến mình', group: 'E' },
  { id: 89, text: 'Thường giữ vai trò lãnh đạo trong các dự án mà mình tham gia', group: 'E' },
  { id: 90, text: 'Ít khi mất tự tin khi đã ra quyết định', group: 'E' },
  { id: 91, text: 'Thường giao tiếp với người lạ nhanh và dễ dàng', group: 'E' },
  { id: 92, text: 'Được nhiều thầy, cô, bạn bè trong trường biết đến', group: 'E' },
  { id: 93, text: 'Quan tâm đến việc kiếm tiền và làm giàu nhanh chóng', group: 'E' },
  { id: 94, text: 'Thường được thầy cô và bạn bè tin tưởng', group: 'E' },
  { id: 95, text: 'Thường rõ ràng về điều mình muốn trong cuộc sống', group: 'E' },

  // NHÓM C - Nghiệp vụ (Conventional) - 19 câu
  { id: 96, text: 'Thích sắp xếp và ghi chú bài học theo quy tắc', group: 'C' },
  { id: 97, text: 'Tuân thủ luật lệ, quy tắc của trường lớp', group: 'C' },
  { id: 98, text: 'Dọn dẹp và sắp xếp bàn học định kỳ', group: 'C' },
  { id: 99, text: 'Làm việc theo sát quy trình, kế hoạch', group: 'C' },
  { id: 100, text: 'Thường sắp xếp vật dụng cá nhân theo trật tự và cách thức mà các con mong muốn', group: 'C' },
  { id: 101, text: 'Có thói quen hình dung và chuẩn bị các bước sẽ xảy ra trước khi tham gia một hoạt động', group: 'C' },
  { id: 102, text: 'Thường khó chịu khi có chuyện bất ngờ xảy ra', group: 'C' },
  { id: 103, text: 'Thường khó chịu khi một kế hoạch đã biết trước bị thay đổi vào phút chót', group: 'C' },
  { id: 104, text: 'Thoải mái khi làm việc theo nguyên tắc, trình tự, và kế hoạch cụ thể', group: 'C' },
  { id: 105, text: 'Thường sắp xếp thời khóa biểu bản thân và nghiêm túc tuân theo thời khoá biểu ấy', group: 'C' },
  { id: 106, text: 'Thường chủ động sắp xếp việc học chứ không cần đợi người lớn nhắc hay giúp', group: 'C' },
  { id: 107, text: 'Có khả năng phân loại và dọn dẹp phòng riêng, đồ vật riêng rất gọn gàng và ngăn nắp', group: 'C' },
  { id: 108, text: 'Thường chi tiêu hợp lý', group: 'C' },
  { id: 109, text: 'Thường hoàn thành hết trách nhiệm đã nhận trước khi giải trí hay nghỉ ngơi', group: 'C' },
  { id: 110, text: 'Có khi bị hiểu lầm bởi người khác là người cứng ngắc và quá nguyên tắc', group: 'C' },
  { id: 111, text: 'Thường tôn trọng cấp bậc và luật lệ trong sinh hoạt ở trường hay ở nhà', group: 'C' },
  { id: 112, text: 'Đã thử kinh doanh với bạn bè và giao các công việc liên quan đến chi tiêu hay thư ký', group: 'C' },
  { id: 113, text: 'Thường làm việc quá mức (ít ngủ, bỏ ăn, làm liên tục) khi gần tới hạn chót của một công việc nào đó', group: 'C' },
  { id: 114, text: 'Thoải mái khi làm việc với số liệu, bảng biểu, và dữ liệu', group: 'C' },
];

export const getQuestionsByGroup = (group: 'R' | 'I' | 'A' | 'S' | 'E' | 'C'): HollandQuestion[] => {
  return hollandQuestions.filter(q => q.group === group);
};

export const getGroupInfo = (code: 'R' | 'I' | 'A' | 'S' | 'E' | 'C'): HollandGroup | undefined => {
  return hollandGroups.find(g => g.code === code);
};