# Love Math - Game Tô Màu Đúng Đáp Án 3 (coloring_true_ans3)

## 1. Mô tả & Luật chơi

- **Mục tiêu**: Chọn màu và tô vào đáp án đúng (Biến thể 3).
- **Cơ chế**:
  - **1 Level** (`game.setTotal(1)`).
  - Intro Voice: `voice_intro_s2`.

## 2. Config & Dữ liệu

- **File**: `public/assets/data/level_s1_config.json`

## 3. Hướng dẫn Test

- **Happy Path**: Tô đúng -> Win -> EndGame.
- **Hint**: Kiểm tra tính năng gợi ý (Bàn tay chỉ vào đáp án đúng).

## 4. Checklist Pre-merge

- [ ] **Debug**: Tắt các tính năng debug (vẽ trục tọa độ) trước khi build production (nếu có).
