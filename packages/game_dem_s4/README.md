# Game Đếm Số 4 (game_dem_s4)

## 1. Mô tả & Luật chơi

- **Mục tiêu**: Bé tập đếm số lượng (4 levels).
- **Cơ chế**:
    - 4 màn chơi liên tiếp.
    - Logic chuyển màn: Pass L1 -> L2 -> L3 -> L4 -> End.

## 2. Config & Dữ liệu

- **File**: `public/assets/data/level_s1_config.json`
- **Levels**: ID 1, 2, 3, 4.

## 3. Hướng dẫn Test

- **Happy Path**: Chơi hết 4 màn không lỗi.
- **Fail Path**: Sai ở bất kỳ màn nào -> Retry màn đó.

## 4. Checklist Pre-merge

- [ ] **Logic**: `game.setTotal(4)`.
- [ ] **Performance**: Đảm bảo không bị leak memory khi chuyển qua 4 màn (cleanup tốt).
