# Love Math - Game Tô Màu Hình Học Phức Tạp (game_coloring_geometry)

## 1. Mô tả & Luật chơi

- **Mục tiêu**: Tô màu các hình học phức tạp hơn hoặc tổ hợp hình.
- **Cơ chế**:
  - Khác với `circle_spuare`, game này có thể chứa tam giác, lục giác, hoặc các hình ghép.

## 2. Config & Dữ liệu

- **File**: `public/assets/data/level_s1_config.json`
- **Parts**: Các mảnh ghép của hình học.

## 3. Hướng dẫn Test

- **Happy Path**: Tô hết các mảnh ghép.
- **Audio**: Kiểm tra âm thanh `sfx-ting` khi tô xong 1 mảng và `sfx-correct` khi thắng.

## 4. Checklist Pre-merge

- [ ] **SDK**: `sdk.requestSave` và `game.finalizeAttempt` được gọi đúng lúc Win.
- [ ] **Responsive**: Check hiển thị trên màn hình dọc/ngang (GameUtils pct logic).
