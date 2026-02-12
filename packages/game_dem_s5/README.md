# Game Đếm Số 5 (game_dem_s5)

## 1. Mô tả & Luật chơi

- **Mục tiêu**: Bé tập đếm số lượng (2 levels - Biến thể).
- **Cơ chế**:
    - 2 màn chơi (theo config và logic hiện tại).
    - Có thể là các số lượng lớn hơn hoặc cách hiển thị khác (VD: nhóm vật thể).

## 2. Config & Dữ liệu

- **File**: `public/assets/data/level_s1_config.json`
- **Levels**: ID 1, 2.

## 3. Hướng dẫn Test

- **Happy Path**: Hoàn thành 2 level.
- **Voice**: Check độ nhạy Mic và phản hồi từ API.

## 4. Checklist Pre-merge

- [ ] **Logic**: `game.setTotal(2)`. Config phải khớp.
- [ ] **Shared Assets**: Kiểm tra các assets dùng chung (`sharedImages`) có load được không.
