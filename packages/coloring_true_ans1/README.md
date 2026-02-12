# Love Math - Game Tô Màu Đúng Đáp Án 1 (coloring_true_ans1)

## 1. Mô tả & Luật chơi

- **Mục tiêu**: Bé chọn màu và tô vào các vùng được xác định là "đáp án đúng".
- **Cơ chế**:
  - So sánh `isCorrectAnswer` trong config.
  - Nếu tô sai -> `game.recordWrong()` -> Reset màu.
  - Nếu tô đúng -> `game.recordCorrect()` -> Cộng điểm.
  - **Levels**: Game báo `game.setTotal(3)`, có thể là 3 câu hỏi hoặc 3 stage.

## 2. Config & Dữ liệu

- **File**: `public/assets/data/level_s1_config.json`
- **Transition**:
  - Hoàn thành -> Chuyển sang `Scene2`.

## 3. Hướng dẫn Test

- **Happy Path**: Tô đúng các đáp án -> Qua màn -> End Game (nếu Scene2 là cuối).
- **Audio**: Kiểm tra `voice_intro_s1`.
- **Wrong Answer**: Cố tình tô vào vùng sai -> Phải có âm thanh báo sai (`sfx-wrong`) và màu bị reset.

## 4. Checklist Pre-merge

- [ ] **Data**: Check `sdk.progress` với `total: 3`.
- [ ] **Scene2**: Đảm bảo Scene2 hoạt động bình thường.
