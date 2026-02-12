# Love Math - Game Tô Màu Theo Nhóm (game_coloring_group_s1)

## 1. Mô tả & Luật chơi

- **Mục tiêu**: Bé tô màu cho các nhóm đối tượng (4 Levels).
- **Cơ chế**:
  - Mỗi màn chơi yêu cầu bé tô màu cho một nhóm vật thể cụ thể.
  - Sau khi hoàn thành một màn, chuyển sang màn tiếp theo.

## 2. Config & Dữ liệu

- **File**: `public/assets/data/level_s1_config.json`
- **Levels**:
  - Game được thiết lập có 4 màn (`game.setTotal(4)`).
  - Tự động chuyển màn sau khi thắng (`game.finishQuestionTimer` -> `sfx-correct` -> Next Scene).

## 3. Hướng dẫn Test

- **Happy Path**: Tô hết các hình trong Scene 1 -> Chuyển Scene 2 -> ... -> Scene 4 -> End Game.
- **Intro**: Kiểm tra tay hướng dẫn có chỉ đúng vào hình mẫu không.

## 4. Checklist Pre-merge

- [ ] **Scene Transition**: Đảm bảo chuyển màn mượt mà, không bị kẹt.
- [ ] **Data Persistence**: `sdk.progress` được gọi đúng index (0, 1, 2, 3). _Lưu ý: Hiện tại code đang hardcode `levelIndex: 0` ở Scene1, cần kiểm tra logic các Scene tiếp theo nếu chúng là file riêng hoặc logic dynamic._
