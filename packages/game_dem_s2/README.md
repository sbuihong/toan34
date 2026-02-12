# Game Đếm Số 2 (game_dem_s2)

## 1. Mô tả & Luật chơi

- **Mục tiêu**: Bé tập đếm số lượng (2 levels).
- **Cơ chế**:
    - Sử dụng **VoiceManager** mới để quản lý luồng ghi âm.
    - Có 2 màn chơi (Levels) liên tiếp.
    - Bé đếm và trả lời qua Micro.

## 2. Config & Dữ liệu

- **File**: `public/assets/data/level_s1_config.json`
- **Cấu trúc**:
    - `levels`: array chứa config cho từng level (id 1, id 2).
    - `targetText`: Đáp án cho từng level.

## 3. Hướng dẫn Test

- **Happy Path**:
    1. Level 1: Đếm đúng -> Chuyển Level 2.
    2. Level 2: Đếm đúng -> Win Game.
- **Flow**: Check chuyển cảnh mượt mà, không bị kẹt ở level 1.

## 4. Checklist Pre-merge

- [ ] **Logic**: `game.setTotal(2)` khớp với số level trong config.
- [ ] **VoiceManager**: Hoạt động ổn định, popup hiện đúng lúc xử lý.
