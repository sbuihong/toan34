# Love Math - Game Tô Màu Trái Phải (game_coloring_left_right)

## 1. Mô tả & Luật chơi

- **Mục tiêu**: Phân biệt bên Trái/Phải và tô màu theo yêu cầu.
- **Cơ chế**:
  - Tương tự game Cao/Thấp, logic xác định đáp án đúng qua vị trí hoặc config.

## 2. Config & Dữ liệu

- **File**: `public/assets/data/level_s1_config.json`
- **Logic**:
  - Thường sử dụng `isCorrect` để quy định bên nào cần tô.

## 3. Hướng dẫn Test

- **Happy Path**: Nghe voice "Tô bạn bên phải" -> Tô đúng -> Win.
- **Audio**: Kiểm tra `voice_intro_s2` (Intro).

## 4. Checklist Pre-merge

- [ ] **Orientation**: Game này phân biệt Trái/Phải nên đặc biệt chú ý nếu màn hình bị đảo chiều (ít gặp trên web game xoay ngang nhưng cần lưu ý).
- [ ] **Hint**: Tay chỉ dẫn phải chỉ đúng vào đối tượng mục tiêu.
