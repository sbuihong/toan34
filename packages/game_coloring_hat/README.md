# Love Math - Game Tô Màu Cái Mũ (game_coloring_hat)

## 1. Mô tả & Luật chơi

- **Mục tiêu**: Bé tô màu chiếc mũ.
- **Cơ chế**:
  - Load config linh hoạt (hỗ trợ cả dạng `items` array và dạng object config cũ).

## 2. Config & Dữ liệu

- **File**: `public/assets/data/level_s1_config.json`
- **Logic**:
  - Hỗ trợ `definitions` để tái sử dụng config cho các item giống nhau (type).
  - `spawnCharacter` có thể xử lý nhiều object dựa trên index.

## 3. Hướng dẫn Test

- **Happy Path**: Tô xong mũ -> Win.
- **Validation**: Kiểm tra xem màu có bị lem ra khỏi viền mũ không.

## 4. Checklist Pre-merge

- [ ] **Config**: Kiểm tra cấu trúc JSON, đảm bảo `parts` được định nghĩa đúng.
- [ ] **Audio**: `voice_intro_s2` phát đúng khi vào game.
