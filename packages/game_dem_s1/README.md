# Game Đếm Số 1 (game_dem_s1)

## 1. Mô tả & Luật chơi

- **Mục tiêu**: Bé tập đếm số lượng vật thể (1 cái) và nói vào micro.
- **Cơ chế**:
    1. **Intro**: Voice hướng dẫn "Bé hãy đếm xem có bao nhiêu...".
    2. **Gameplay**:
        - Màn hình hiện 1 vật thể (VD: 1 quả bóng).
        - Bé bấm vào nút Micro và nói đáp án (VD: "Một").
        - Game ghi âm và gửi lên server để chấm điểm.
    3. **Kết quả**:
        - **Đúng** (Score >= 60): Khen ngợi, hoàn thành game.
        - **Sai/Nói nhỏ**: Nhắc nhở, yêu cầu nói lại.

## 2. Config & Dữ liệu

- **File**: `public/assets/data/level_s1_config.json`
- **Logic**:
    - `targetText`: "1" (Đáp án đúng).
    - Config chứa danh sách ảnh để hiển thị.

## 3. Hướng dẫn Test

- **Happy Path**: Bấm Mic -> Nói "Một" -> Server trả về điểm cao -> Win.
- **Fail Path**: Nói sai ("Hai") hoặc nói linh tinh -> Voice nhắc thử lại.
- **Lưu ý**: Cần cấp quyền Micro cho trình duyệt.

## 4. Checklist Pre-merge

- [ ] **Voice**: Test thử flow ghi âm và gửi API.
- [ ] **Config**: Target text đúng là "1".
- [ ] **Assets**: Đảm bảo hình ảnh scale vừa phải.
