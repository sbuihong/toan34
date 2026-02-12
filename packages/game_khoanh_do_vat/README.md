# Game Khoanh: Đồ Vật (game_khoanh_do_vat)

## 1. Mô tả & Luật chơi

- **Mục tiêu**: Người chơi nghe voice hướng dẫn và khoanh tròn vào **nhóm đồ vật đúng** (ví dụ: nhóm có số lượng tương ứng hoặc đặc điểm cụ thể).
- **Cơ chế**:
  1. **Intro**: Voice yêu cầu (VD: "Bé hãy khoanh vào nhóm có 5 quả bóng").
  2. **Gameplay**:
     - Màn hình hiện 2 nhóm đồ vật (Trái/Phải).
     - Người chơi vẽ lasso quanh 1 trong 2 nhóm.
     - Hệ thống check `side` ("left"/"right") với `correctKey` trong config.
  3. **Kết quả**:
     - **Đúng**: Hiện vòng xanh, voice khen, sang màn tiếp.
     - **Sai**: Rung lắc, voice nhắc nhở.
  4. **Level**: Game có **3 màn (Levels)**.

## 2. Config & Dữ liệu

- **File**: `public/assets/data/level_s1_config.json`
- **Cấu trúc Level**:
  ```json
  {
      "id": 1,
      "correctKey": "right", // Đáp án đúng là bên Phải
      "left": { ... },       // Cấu hình ảnh bên Trái
      "right": { ... }       // Cấu hình ảnh bên Phải
  }
  ```

## 3. Hướng dẫn Test

- **Happy Path**: Chơi hết 3 level.
  - Level 1: Khoanh Phải.
  - Level 2: Khoanh Trái.
  - Level 3: Khoanh Phải.
- **SDK Tracking**:
  - Kiểm tra log `[SDK Hint]` khi đợi lâu.
  - Kiểm tra log `[SDK Finalize]` khi hoàn thành level 3.

## 4. Checklist Pre-merge

- [ ] **Config**: Đủ 3 level, `correctKey` khớp với nội dung ảnh/voice.
- [ ] **Visual**: Ảnh không bị méo, scale phù hợp (check `baseScale`).
- [ ] **SDK**:
  - [ ] `game.createCircleSelectTracker` được gọi khi load level.
  - [ ] `circleTracker.finalize()` được gọi khi chuyển level hoặc hết game.
