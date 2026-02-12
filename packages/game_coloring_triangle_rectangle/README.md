# Love Math - Game Tô Màu Hình Học (game_coloring_triangle_rectangle)

## 1. Mô tả & Luật chơi

- **Mục tiêu**: Nhận biết và tô màu hình Tam giác / Hình Chữ nhật.
- **Cơ chế**:
  - **2 Levels** (`game.setTotal(2)`).
  - Phân biệt hình học qua việc tô màu.

## 2. Config & Dữ liệu

- **File**: `public/assets/data/level_s1_config.json`
- **Transition**:
  - Chiến thắng màn 1 -> Chuyển sang `Scene2`.

## 3. Hướng dẫn Test

- **Happy Path**: Tô đúng hình (Tam giác/CN) theo yêu cầu -> Win -> Next Level.
- **Audio**: Intro dùng `voice_intro_s1`.

## 4. Checklist Pre-merge

- [ ] **Game Logic**: Nếu voice yêu cầu "Tô hình tam giác", kiểm tra xem click vào hình vuông/tròn có bị tính sai không.
- [ ] **Levels**: Test đủ 2 màn.
