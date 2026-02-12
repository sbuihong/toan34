# Game Khoanh Số 1 (game_khoanh_so_1)

## 1. Mô tả & Luật chơi

- **Mục tiêu**: Người chơi tìm và khoanh tròn **duy nhất 1 quả bóng** (Ball).
- **Cơ chế**:
  1. **Intro**: Voice yêu cầu tìm quả bóng.
  2. **Gameplay**:
     - Màn hình có nhiều vật thể, trong đó có 1 quả bóng (`S1_Ball`).
     - Người chơi vẽ lasso quanh quả bóng.
  3. **Kết quả**:
     - **Đúng**: Khoanh trúng quả bóng -> Thắng ngay (Total = 1).
     - **Sai**: Khoanh nhầm vật khác -> Rung lắc.
  4. **Level**: Chỉ có 1 màn chơi đơn giản.

## 2. Config & Dữ liệu

- **File**: `public/assets/data/level_s1_config.json`
- **Logic**:
  - `ObjectManager` spawn đồ vật từ config.
  - Code hard-code tìm `TextureKeys.S1_Ball`.

## 3. Hướng dẫn Test

- **Happy Path**: Khoanh đúng quả bóng -> Win -> EndGame.
- **Fail Path**: Khoanh vào các hình khác (vuông, tam giác...) -> Rung lắc.
- **SDK**: Kiểm tra gọi `sdk.score(1, 1)` và `game.finalizeAttempt()` khi thắng.

## 4. Checklist Pre-merge

- [ ] **Config**: Đảm bảo có ít nhất 1 quả bóng trong config.
- [ ] **Assets**: Texture `ball` hiển thị đúng.
- [ ] **Logic**: Đảm bảo `game.setTotal(1)`.
