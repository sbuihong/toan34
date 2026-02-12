# Love Math - Game Chọn Mũ (chose_hpb_hat)

## 1. Mô tả & Luật chơi

- **Mục tiêu**: Bé chọn chiếc mũ đúng theo yêu cầu.
- **Cơ chế**:
  - Chọn đáp án đúng/sai (`config.correct`).
  - **1 Level** (`game.setTotal(1)`).
  - Intro Voice: `voice_intro_s2`.

## 2. Config & Dữ liệu

- **File**: `public/assets/data/level_s1_config.json`
- **Output**:
  - Đúng: `sfx-answer` -> `sfx-correct` -> EndGame.
  - Sai: `sfx-wrong` -> Shake effect.

## 3. Hướng dẫn Test

- **Happy Path**: Chọn mũ đúng -> Win.
- **Audio**: Intro, SFX đúng/sai.

## 4. Checklist Pre-merge

- [ ] **Assets**: Kiểm tra hình ảnh mũ hiển thị rõ nét.
