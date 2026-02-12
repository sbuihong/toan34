# Game Đếm Số 3 (game_dem_s3)

## 1. Mô tả & Luật chơi

- **Mục tiêu**: Bé tập đếm số lượng (3 levels).
- **Cơ chế**:
    - Tương tự `game_dem_s2` nhưng có 3 màn chơi.
    - Sử dụng **VoiceManager**.

## 2. Config & Dữ liệu

- **File**: `public/assets/data/level_s1_config.json`
- **Levels**: ID 1, 2, 3.

## 3. Hướng dẫn Test

- **Happy Path**: Hoàn thành đủ 3 level liên tiếp.
- **SDK**: Kiểm tra `sdk.progress` cập nhật 1/3, 2/3, 3/3.

## 4. Checklist Pre-merge

- [ ] **Logic**: `game.setTotal(3)`.
- [ ] **Assets**: Check ảnh cho cả 3 level hiển thị đủ.
