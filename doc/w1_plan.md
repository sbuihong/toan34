## Task list hướng tới bộ game học toán kiểu Lingokid

### 1. Thiết lập nền tảng & kiến trúc (30–36 giờ, độ khó: Trung bình)
- **1.1 Chuẩn hoá tài liệu kiến trúc** (5 giờ)  
  Cập nhật lại `doc/` theo cấu trúc mới, thêm template game, checklist QA.
- **1.2 Xây project shell** (10 giờ)  
  Tạo Next.js app shell + cấu hình Vite/Pixi playground cho dev, thiết lập monorepo nếu cần.
- **1.3 Khởi tạo engine nhẹ** (10–15 giờ)  
  Viết `Renderer` abstraction (Canvas/WebGL), `GameLoop`, `EventBus`; benchmark PixiJS vs custom để chọn hướng chính.
- **1.4 Thiết lập common services** (5–10 giờ)  
  Module `analytics`, `audio/TTS`, `asset manifest`, `difficulty service`, kết nối với Next API route mẫu.

### 2. Pipeline asset & UI framework (20–30 giờ, độ khó: Trung bình)
- **2.1 Asset pipeline** (10 giờ)  
  Xây tool convert sprite sheet, audio, tilemap; tổ chức thư mục `public/assets/games/<name>`.
- **2.2 Library UI chung** (5–7.5 giờ)  
  Gom component cần dùng (Button, Modal, HUD) vào `src/common/ui`, dọn phần dư thừa.
- **2.3 Style guideline & theming** (5 giờ)  
  Thiết lập hệ màu, typography, token Tailwind; support reskin theo theme.
- **2.4 Hero character system** (5 giờ)  
  Định nghĩa nhân vật chính/phụ, animation sheet, hook điều khiển để tái sử dụng giữa các game.

### 3. Mini game lõi 1 – Đếm & nhận biết số (20–30 giờ, độ khó: Trung bình)
- **3.1 Thiết kế game data & difficulty curve** (5 giờ)  
  Định nghĩa JSON câu hỏi, mức độ easy/med/advanced, cơ chế scaling (ví dụ thời gian, distractor).
- **3.2 Dựng scene gameplay** (10 giờ)  
  Tạo lớp `CountingScene` (object spawn, animation, HUD, input handler, feedback loop).
- **3.3 Camera view & responsive scaling** (7.5 giờ)  
  Xây preset camera cho tỉ lệ 16:9, 4:3, 3:4; auto-fit desktop/phone, xử lý xoay màn, crop background hợp lý.
- **3.4 Gamification meta (race theme)** (7.5 giờ)  
  Thêm lớp `RaceProgress` thể hiện vị trí trên đường đua; cập nhật khi trả lời đúng/sai.
- **3.5 Polish audio/animation** (5 giờ)  
  Gắn TTS, âm phản hồi, tween cho nhân vật, particle hiệu ứng đơn giản.
- **3.6 QA & integration** (2.5 giờ)  
  Test multi device, log event chuẩn, report kết quả.

### 4. Mini game lõi 2 – Nhận diện hình khối (20–30 giờ, độ khó: Trung bình)
- **4.1 Research mechanic & asset** (5 giờ)  
  Chọn theme (ví dụ Underwater race), chuẩn bị hình khối/3D card.
- **4.2 Logic sinh bài** (7.5 giờ)  
  Viết service sinh câu hỏi: matching hình, chọn hình giống mô tả, tăng độ khó theo lượng distractor.
- **4.3 Scene gameplay + drag-drop** (10 giờ)  
  Tạo `ShapeMatchScene` với input drag/drop hoặc tap giữ; animation highlight.
- **4.4 Gamification meta (boat race)** (5 giờ)  
  Cập nhật dòng bơi/đua thuyền khi trả lời, thêm HUD cạnh tranh.
- **4.5 Polish + QA** (2.5 giờ)  
  Âm thanh, animation, test thiết bị.

### 5. Meta loop & progression (20 giờ, độ khó: Khá)
- **5.1 Profile & progression service** (5 giờ)  
  Lưu tiến độ người chơi, badge, star rating; API mock + storage local.
- **5.2 Difficulty adapt** (7.5 giờ)  
  Xây logic nâng/giảm độ khó theo performance; hook với mini game.
- **5.3 Reward hub & UI** (5 giờ)  
  Màn hình tổng kết: bảng xếp hạng, đồng xu, gợi ý game tiếp theo.
- **5.4 Telemetry analytics** (2.5 giờ)  
  Standardize event schema, gắn tracking.

### 6. Reskin & extensibility toolkit (15–20 giờ, độ khó: Trung bình)
- **6.1 Theme engine** (7.5 giờ)  
  Cho phép thay đổi background, character skin, color palette qua config.
- **6.2 Asset swap demo** (5 giờ)  
  Tạo 2 skin minh hoạ (ví dụ Forest và Space) chạy trên cả hai mini game.
- **6.3 Authoring guide** (2.5–5 giờ)  
  Viết hướng dẫn thêm game mới: template logic, asset checklist, cách plug vào meta loop.

### 7. Tổng hợp, kiểm thử & bàn giao (10–15 giờ, độ khó: Trung bình)
- **7.1 Cross-device QA** (5 giờ)  
  Test trên Chrome, Safari iPad, Android Chrome; tối ưu FPS, touch input.
- **7.2 Documentation final** (5 giờ)  
  Cập nhật `doc/README`, `tech/architecture`, tạo video/gif demo.
- **7.3 Retro & next steps** (2.5–5 giờ)  
  Tổng kết kết quả, bài học, đề xuất roadmap vòng sau (ví dụ game luyện đếm nâng cao, multiplayer).

> Tổng nỗ lực 100–120 giờ cho 1 dev chính, có thể song song một số task (asset pipeline, doc). Task đủ nhỏ để nghiên cứu, code, test và report.
