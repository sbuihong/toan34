# Love Math - Game Tô Màu Cây (game_coloring_tree)

## 1. Mô tả & Luật chơi

- **Mục tiêu**: Bé tô màu cây (2 Levels).
- **Cơ chế**:
  - **Levels**: Có 2 màn chơi (`game.setTotal(2)`).
  - Sau khi hoàn thành màn 1 -> Chuyển sang màn 2 (`Scene2`).

## 2. Config & Dữ liệu

- **File**: `public/assets/data/level_s1_config.json`
- **Transition**:
  - `game.finishQuestionTimer` -> `sfx-correct` -> `Scene2`.

## 3. Hướng dẫn Test

- **Happy Path**: Tô xong cây 1 -> Chuyển cảnh -> Tô xong cây 2 -> End Game.
- **SDK**: Kiểm tra log `sdk.progress`:
  - Màn 1: `levelIndex: 0`
  - Màn 2: `levelIndex: 1`

## 4. Checklist Pre-merge

- [ ] **Scene2**: Đảm bảo `Scene2` tồn tại và hoạt động (thường `Scene1` chỉ handle level 1).
- [ ] **Performance**: Chuyển cảnh không bị leak memory (texture cũ có được destroy không?).
