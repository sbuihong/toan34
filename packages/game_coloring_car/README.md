# Love Math - Game Tô Màu Ô Tô (game_coloring_car)

## 1. Mô tả & Luật chơi

- **Mục tiêu**: Bé tô màu cho chiếc ô tô.
- **Cơ chế**:
  - Tương tự các game tô màu khác.
  - Các bộ phận xe: Bánh xe, Thân xe, Cửa sổ...

## 2. Config & Dữ liệu

- **File**: `public/assets/data/level_s1_config.json`
- **Logic**:
  - Mỗi bộ phận xe là một layer riêng biệt.
  - `hintX`, `hintY` dùng để chỉ định vị trí bàn tay gợi ý trỏ vào.

## 3. Hướng dẫn Test

- **Happy Path**: Tô màu xong chiếc xe -> Xe có thể chạy hoặc effect chiến thắng.
- **Idle Hint**: Kiểm tra xem tay hướng dẫn có chỉ đúng vào bộ phận chưa tô không.

## 4. Checklist Pre-merge

- [ ] **Assets**: Check độ phân giải ảnh xe, đảm bảo nét trên màn hình lớn.
- [ ] **FPS**: Kiểm tra hiệu năng khi tô nhiều nét (`FPSCounter` có thể được bật để debug).
