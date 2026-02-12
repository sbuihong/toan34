# Game Khoanh: Tìm Con Vật Nhỏ Hơn (game_khoanh_smaller_animal)

## 1. Mô tả & Luật chơi (Game Flow)

- **Mục tiêu**: Người chơi cần tìm và dùng tay vẽ đường bao quanh (lasso) các **con vật nhỏ hơn** (đáp án đúng).
- **Cơ chế**:
  1. **Intro**: Nghe voice hướng dẫn yêu cầu tìm con vật nhỏ hơn.
  2. **Gameplay**:
     - Vẽ một đường khép kín bao quanh **duy nhất 01 đối tượng**.
     - Hệ thống validate vùng chọn (polygon).
  3. **Kết quả**:
     - **ĐÚNG**: Hiện vòng xanh lá, phát âm thanh tích cực, cộng điểm.
     - **SAI**: Rung lắc đối tượng, phát âm thanh sai (nếu chọn vật to hơn).
     - **LỖI**: Nếu khoanh trúng >1 vật hoặc vùng quá nhỏ -> Không nhận diện/vẽ lại.
  4. **Win**: Tìm đủ số lượng đáp án đúng (tùy config/code setTotal).

## 2. Điểm dễ lỗi (Common Pitfalls)

- **Lasso Validation**:
  - Người chơi vẽ không khép kín hẳn -> Code tự nối điểm đầu cuối, nhưng nếu quá hở sẽ méo polygon.
  - Vẽ trùm lên 2 vật sát nhau -> Code `LassoValidation` sẽ reject (trả về >1 object hoặc diện tích intersection sai).
- **Config ID**:
  - Sai ID trong `level_s1_config.json` dẫn đến việc chọn đúng nhưng game báo sai.
- **Restart**:
  - Check kỹ âm thanh Intro có bị chồng lấn khi nhấn nút "Chơi lại" liên tục không.

## 3. Hướng dẫn chạy & Test

### Cài đặt & Chạy

```bash
pnpm install
pnpm dev
# Truy cập localhost để test
```

### Cách Test hiệu quả

- **Test Case 1 (Happy Path)**: Khoanh đúng từng con nhỏ -> Win -> Popup EndGame.
- **Test Case 2 (Fail Path)**: Khoanh con to -> Rung lắc.
- **Test Case 3 (Edge Case)**:
  - Vẽ vòng tròn bao quanh cả 2 con (nhỏ + to) -> Phải không nhận (hoặc báo lỗi).
  - Vẽ vùng trống dính 1 chút vào hình -> Check xem `INTERSECTION_RATIO` có chặn không.

## 4. Checklist trước khi Merge (Pre-merge)

- [ ] **Code Quality**: Không còn `console.log` thừa, đã chạy `pnpm build` không lỗi type.
- [ ] **Config**: File `public/assets/data/level_s1_config.json` chuẩn cấu trúc, `setTotal` trong code khớp số lượng đúng.
- [ ] **Assets**: File ảnh/âm thanh đầy đủ, không 404.
- [ ] **SDK Integration**:
  - [ ] Gọi `sdk.start()` lúc vào game.
  - [ ] Gọi `sdk.score()`/`sdk.progress()` mỗi lần khoanh đúng.
  - [ ] Gọi `game.finalizeAttempt()` **DUY NHẤT** khi thắng.
- [ ] **Mobile**: Test cảm ứng (touch) trên thiết bị thật/giả lập chrome.
