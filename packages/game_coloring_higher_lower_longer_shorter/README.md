# Love Math - Game Tô Màu Cao/Thấp/Dài/Ngắn (game_coloring_higher_lower_longer_shorter)

## 1. Mô tả & Luật chơi

- **Mục tiêu**: Tô màu vào đối tượng đúng theo yêu cầu (Cao hơn, Thấp hơn, Dài hơn, Ngắn hơn).
- **Cơ chế**:
  - **3 Levels** (`game.setTotal(3)`).
  - Config có cờ `isCorrect`. Chỉ đối tượng có `isCorrect: true` mới cần tô và tô được.
  - Nếu tô vào đối tượng sai (`isCorrect: false` hoặc không định nghĩa) -> Phát âm thanh Sai (`sfx-wrong`) và ghi nhận lỗi (`game.recordWrong`).

## 2. Config & Dữ liệu

- **File**: `public/assets/data/level_s1_config.json`
- **Quan trọng**:
  - `isCorrect`: Xác định đáp án đúng.
  - Các part không đúng sẽ không được đưa vào danh sách `unfinishedPartsMap`.

## 3. Hướng dẫn Test

- **Happy Path**: Tô vào hình đúng theo voice hướng dẫn -> Win.
- **Wrong Case**: Cố tình tô vào hình sai -> Nghe âm thanh 'buzz/wrong', không tô được màu.

## 4. Checklist Pre-merge

- [ ] **Voice**: Voice hướng dẫn phải khớp với đáp án đúng (VD: Voice bảo "Tô cây cao hơn" thì cây thấp phải có config `isCorrect: false` hoặc không active).
- [ ] **Levels**: Test đủ 3 levels.
