# Game Khoanh Số 2 (game_khoanh_so_2)

## 1. Mô tả & Luật chơi

- **Mục tiêu**: Người chơi tìm và khoanh tròn **2 đối tượng đúng**.
- **Cơ chế**:
  1. **Intro**: Voice hướng dẫn.
  2. **Gameplay**:
     - Màn hình có nhiều vật thể.
     - Người chơi cần tìm 2 vật thể đúng (được định nghĩa trong config hoặc logic `isCorrectAnswer`).
     - Khoanh từng cái một.
  3. **Kết quả**:
     - **Đúng cái 1**: Hiện vòng xanh, voice khen, tìm tiếp cái 2.
     - **Đúng cái 2**: Win -> EndGame.
     - **Sai**: Rung lắc.
     - **Lặp lại**: Khoanh lại cái đã tìm -> Báo đã khoanh rồi (log warning).

## 2. Config & Dữ liệu

- **File**: `public/assets/data/level_s1_config.json`
- **Logic**:
  - `game.setTotal(2)`: Cố định 2 mục tiêu.
  - `ObjectManager.isCorrectAnswer()` xác định vật đúng (thường qua `role` hoặc `id`).

## 3. Hướng dẫn Test

- **Happy Path**: Khoanh đúng vật 1 -> Khoanh đúng vật 2 -> Win.
- **Fail Path**: Khoanh vật sai.
- **Edge Case**: Khoanh lại vật đã đúng -> Không được tính điểm thêm, không lỗi.

## 4. Checklist Pre-merge

- [ ] **Config**: Đảm bảo có đủ 2 vật đúng trong config.
- [ ] **SDK**:
  - [ ] Check `sdk.score(1, 2)` khi tìm được 1.
  - [ ] Check `sdk.score(2, 2)` khi tìm được 2.
  - [ ] `game.finalizeAttempt()` khi tìm đủ.
