# Love Math - Game Tô Màu Động Vật (game_coloring_animal)

## 1. Mô tả & Luật chơi

- **Mục tiêu**: Bé tô màu cho các con vật dễ thương.
- **Cơ chế**:
  - Chọn màu từ bảng màu (Palette).
  - Chạm vào các vùng trắng trên con vật để tô.
  - **Thông minh**:
    - Nếu bé dùng 1 màu duy nhất cho một vùng -> Game tự động fill tràn viền cho đẹp.
    - Nếu bé dùng nhiều màu (tô sặc sỡ) -> Game giữ nguyên nét vẽ của bé.

## 2. Config & Dữ liệu

- **File**: `public/assets/data/level_s1_config.json`
- **Cấu trúc**:
  - `teacher`: Chứa thông tin về nhân vật chính (con vật).
  - `parts`: Danh sách các vùng cần tô (id, scale, offset, hintPoints).
  - `outlineKey`: Hình viền đè lên trên.

## 3. Hướng dẫn Test

- **Happy Path**: Tô hết tất cả các vùng trắng -> Win Game -> End Scene.
- **Tính năng**:
  - Thử tô 1 màu xem có auto-fill không.
  - Thử tô nhiều màu xem có giữ nguyên không.
  - Đợi 1 lúc không thao tác xem có hiện tay gợi ý (Idle Hint) không.

## 4. Checklist Pre-merge

- [ ] **SDK**: Check `game.setTotal(1)` và `sdk.progress`.
- [ ] **Assets**: Đảm bảo hình ảnh tải lên đúng, không bị lệch viền.
