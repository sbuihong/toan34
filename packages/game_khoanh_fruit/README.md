# Game Khoanh: So Sánh Số Lượng (game_khoanh_fruit)

## 1. Mô tả & Luật chơi (Game Flow)

- **Mục tiêu**: Người chơi cần tìm và khoanh tròn vào **nhóm đối tượng đúng** (theo yêu cầu của voice, ví dụ: "nhóm có số lượng nhiều hơn").
- **Cơ chế**:
  1. **Intro**: Nghe voice hướng dẫn.
  2. **Gameplay (Multi-level)**:
     - Game có **4 màn chơi (levels)** liên tiếp.
     - Mỗi màn hiện 2 nhóm đối tượng (Trái/Phải).
     - Người chơi dùng tay vẽ đường bao quanh (lasso) **một trong hai nhóm**.
     - Hệ thống kiểm tra xem nhóm được chọn (Left/Right) có khớp với `correctKey` trong config không.
  3. **Kết quả**:
     - **ĐÚNG**: Hiện vòng xanh, cộng điểm, chuyển sang màn tiếp theo sau 1.5s.
     - **SAI**: Rung lắc đối tượng, báo lỗi.
     - **HOÀN THÀNH**: Thắng cả 4 màn -> Chuyển màn EndGame.

## 2. Điểm dễ lỗi (Common Pitfalls)

- **Lasso Validation**:
  - Vẽ trùm lên cả 2 nhóm -> Code không xác định được side -> Báo lỗi hoặc không nhận.
  - Vẽ quá nhỏ hoặc không khép kín -> `LassoManager` có thể reject.
- **Config**:
  - `correctKey` ("left"/"right") phải khớp với vị trí visual của ảnh.
  - Texture key trong config phải tồn tại trong `TextureKeys`.
- **Audio**:
  - Voice intro cần reset state mỗi khi qua level mới để tránh bị chồng tiếng hoặc mất tiếng.

## 3. Hướng dẫn chạy & Test

### Cài đặt & Chạy

```bash
pnpm install
pnpm dev
# Truy cập localhost để test
```

### Cách Test hiệu quả

- **Test Happy Path**: Chơi lần lượt 4 màn, khoanh đúng (hiện tại config đều là **Left**) -> Win -> EndGame.
- **Test Fail Path**: Thử khoanh sai (Right) -> Xem có bị trừ điểm/rung lắc không.
- **Test Retry**:
  - Thua/Thắng xong nhấn "Chơi lại" -> Check xem có reset về Level 1 không.
  - Check voice intro có phát lại đúng không.

## 4. Checklist trước khi Merge (Pre-merge)

- [ ] **Code Quality**: Clean code, không error typescript.
- [ ] **Config**: Check `public/assets/data/level_s1_config.json` đủ 4 level, ID unique.
- [ ] **Assets**: Đảm bảo hình ảnh fruit (texture 1-8) hiển thị đúng.
- [ ] **SDK Integration**:
  - [ ] `game.setTotal(4)` (hoặc theo độ dài config).
  - [ ] `sdk.progress()` được gọi mỗi khi qua màn.
  - [ ] `game.finalizeAttempt()` chỉ gọi khi xong hết level cuối.
- [ ] **End Game**: Chuyển cảnh mượt, không lỗi `sys` property (đã fix ở các game trước).
