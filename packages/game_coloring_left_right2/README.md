# Love Math - Game Tô Màu Trái Phải 2 (game_coloring_left_right2)

## 1. Mô tả & Luật chơi

- **Mục tiêu**: Phân biệt bên Trái/Phải và tô màu theo yêu cầu (Phiên bản 2).
- **Cơ chế**:
  - Tương tự game `game_coloring_left_right`, nhưng có thể khác về Asset hoặc Config.

## 2. Config & Dữ liệu

- **File**: `public/assets/data/level_s1_config.json`
- **Logic**:
  - Sử dụng `isCorrect` để quy định bên nào cần tô.

## 3. Hướng dẫn Test

- **Happy Path**: Tô đúng bên theo voice -> Win.
- **Audio**: Kiểm tra `voice_intro_s2`.

## 4. Checklist Pre-merge

- [ ] **Data**: Kiểm tra xem `sdk.progress` có gửi đúng `levelIndex: 0` không.
- [ ] **UI**: Bảng màu ngang (Horizontal) hiển thị đúng vị trí.
