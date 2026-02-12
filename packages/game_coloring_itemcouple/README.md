# Love Math - Game Tô Màu Cặp Đôi (game_coloring_itemcouple)

## 1. Mô tả & Luật chơi

- **Mục tiêu**: Tô màu các cặp đồ vật tương ứng.
- **Cơ chế**:
  - **Color Validation**: Config có thể quy định `correctColor` (Màu đúng).
  - Bảng màu (Palette) được bố trí dọc (`Vertical Layout`) bên phải màn hình.

## 2. Config & Dữ liệu

- **File**: `public/assets/data/level_s1_config.json`
- **Validation**:
  - `correctColor`: ID màu bắt buộc phải dùng. Nếu bé chọn màu khác, có thể sẽ không tô được hoặc bị `recordWrong` (tuỳ logic PaintManager).

## 3. Hướng dẫn Test

- **Happy Path**: Chọn đúng màu (nếu có yêu cầu) và tô -> Win.
- **UI**: Kiểm tra bảng màu dọc có bị che khuất không trên các tỷ lệ màn hình khác nhau.

## 4. Checklist Pre-merge

- [ ] **Palette**: Vị trí `GameUtils.pctX(this, 0.84)` có hợp lý trên iPad (4:3) và Phone (16:9/20:9) không?
- [ ] **Hand Hint**: Kiểm tra tay hướng dẫn animation từ bảng màu dọc.
