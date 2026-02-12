# Love Math - Game Tô Màu Bươm Bướm (game_coloring_buterfly)

## 1. Mô tả & Luật chơi

- **Mục tiêu**: Bé tô màu cho cánh bướm rực rỡ.
- **Cơ chế**:
  - Chọn màu và tô vào các vùng cánh bướm.
  - Sử dụng `PaintManager` để xử lý logic tô màu.

## 2. Config & Dữ liệu

- **File**: `public/assets/data/level_s1_config.json`
- **Phân tách**:
  - Các vùng cánh bướm được chia nhỏ trong `parts`.
  - Có thể có các chi tiết trang trí khác (nếu config có `decorative`).

## 3. Hướng dẫn Test

- **Happy Path**: Tô hoàn thiện con bướm.
- **Lưu ý**: Kiểm tra xem các vùng tô có bị lem ra ngoài viền không (Depth của Outline phải cao hơn Paint Layer).

## 4. Checklist Pre-merge

- [ ] **Typo**: Lưu ý tên folder là `game_coloring_buterfly` (thiếu chữ 't' trong butterfly), cần giữ nguyên để tránh lỗi đường dẫn hoặc refactor sau (nếu được yêu cầu).
- [ ] **Logic**: Check điều kiện thắng (`finishedParts >= totalParts`).
