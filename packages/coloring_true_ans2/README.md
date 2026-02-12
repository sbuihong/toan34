# Love Math - Game Tô Màu Đúng Đáp Án 2 (coloring_true_ans2)

## 1. Mô tả & Luật chơi

- **Mục tiêu**: Chọn màu và tô vào đáp án đúng.
- **Cơ chế**:
  - Tương tự `coloring_true_ans1` nhưng chỉ có **1 Level** (`game.setTotal(1)`).
  - Intro Voice: `voice_intro_s2`.

## 2. Config & Dữ liệu

- **File**: `public/assets/data/level_s1_config.json`
- **Logic**:
  - `isCorrectAnswer: true` -> Được phép tô.
  - `isCorrectAnswer: false` -> Báo sai.

## 3. Hướng dẫn Test

- **Happy Path**: Tô đúng -> Win -> EndGame.
- **Audio**: Intro `voice_intro_s2`.

## 4. Checklist Pre-merge

- [ ] **SDK**: Kiểm tra `sdk.requestSave` khi thắng.
- [ ] **UI**: Kiểm tra hiển thị bảng màu và nút bấm.
