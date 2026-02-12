# Love Math - Game Tô Màu Hình Học (game_coloring_circle_spuare)

## 1. Mô tả & Luật chơi

- **Mục tiêu**: Bé tô màu Hình Tròn và Hình Vuông (Square).
- **Cơ chế**:
  - Giúp bé nhận biết hình học qua việc tô màu.
  - Gameplay đơn giản, tập trung vào mảng màu lớn.

## 2. Config & Dữ liệu

- **File**: `public/assets/data/level_s1_config.json`
- **Levels**: Có thể có 1 hoặc nhiều màn tùy config (Hiện tại code Scene1 logic `game.setTotal(1)`).

## 3. Hướng dẫn Test

- **Happy Path**: Tô xong hình -> Win.
- **Validation**:
  - Kiểm tra xem tô hình tròn có bị lem ra góc vuông không (masking).

## 4. Checklist Pre-merge

- [ ] **Typo**: Tên folder `game_coloring_circle_spuare` (sai chính tả 'square').
- [ ] **Logic**: Đảm bảo `PaintManager` xử lý tốt các hình dạng cơ bản.
