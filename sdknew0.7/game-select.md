# README — Tích hợp SDK Items cho game SELECT (game chọn đáp án)

---

# 0) Bạn cần có sẵn 2 thứ trong SDK

* `createSelectTracker` (ở `src/core/game/trackers/selectTracker.ts`)
* `prepareSubmitData` (ở `src/core/game/statsCore.ts`)

Trong game bạn chỉ dùng tracker + cuối game gọi submit.

---

# 1) Bạn thêm tracker ở file nào của game select?

Tìm file “scene/màn select” — thường là 1 trong các kiểu:

* PixiJS: `SelectScene.ts` / `SelectGame.ts` / `SceneSelect.ts`
* Phaser: `SelectScene.ts`
* React wrapper: `SelectScreen.tsx` hoặc `SelectGame.tsx`

**Bạn sẽ thêm 3 block code:**

1. import tracker
2. tạo tracker khi vào câu (init)
3. gọi tracker ở các event (shown, choose, quit/timeout, finalize)

---

# 2) Import tracker (đặt ở đầu file)

```ts
import { game } from "@iruka-edu/mini-game-sdk";
const createSelectTracker = game.createSelectTracker;
```

> Nếu path khác thì sửa theo repo bạn (vd `src/core/game/trackers`).

---

# 3) Tạo tracker đúng lúc (khi câu/màn bắt đầu)

Bạn phải tạo tracker **mỗi item** (mỗi câu). Tạo ở hàm kiểu `onEnter/init/create`.

### Ví dụ (pseudo Pixi/Phaser style)

```ts
class SelectScene {
  private tracker: ReturnType<typeof createSelectTracker> | null = null;

  startQuestion(question: any, seq: number, runSeq: number) {
    this.tracker = createSelectTracker({
      meta: {
        item_id: question.itemId,     // "SELECT_ONE_MANY_001"
        seq,                          // 1,2,3...
        run_seq: runSeq,              // 1 cho lần đầu, replay tăng
        difficulty: question.difficulty ?? 1,
        scene_id: question.sceneId ?? "SCN_SELECT_01",
        scene_seq: seq,
        scene_type: "select",
        skill_ids: question.skillIds ?? [],
      },
      expected: {
        question_type: question.type,       // "identify_one"
        options: question.options,          // [{id,count,object},...]
        correct_option: question.correctId, // "option_A"
        has_submit_button: false,           // game bạn chọn là chốt
      },
      errorOnWrong: "CONFUSED_ONE_MANY",    // đúng ví dụ của bạn
    });

    // ✅ QUAN TRỌNG: gọi khi câu “thật sự hiển thị”
    this.tracker.onShown(Date.now());
  }
}
```

**Chỗ đặt code này chính xác là:**
👉 nơi bạn đã “set dữ liệu câu hỏi lên UI” xong và bắt đầu cho user tương tác.

---

# 4) Gọi tracker khi user chọn đáp án (đặt trong onClick/touch handler)

Tìm event bạn đang xử lý click option, kiểu như:

* `onOptionClick(optionId)`
* `handleSelect(option)`
* `option.on('pointertap', ...)`

Ở đó bạn thêm đúng 1 dòng:

```ts
this.tracker?.onChoose(optionId, Date.now());
```

### Ví dụ

```ts
onOptionTapped(optionId: string) {
  // (UI logic cũ của bạn: highlight, check đúng sai,... giữ nguyên)

  // ✅ log attempt: chọn là chốt (auto end attempt)
  this.tracker?.onChoose(optionId, Date.now());

  // nếu bạn muốn cho bé làm lại trong cùng câu:
  // nếu sai -> bạn hiển thị thử lại -> khi user bấm retry -> gọi tracker.retryAttempt()
}
```

> Với `has_submit_button:false`, `onChoose` sẽ tự đóng attempt và ghi `selected_at_ms/time_response_ms/is_correct/error_code`.

---

# 5) Nếu game có nút “Thử lại” trong cùng câu

Tìm handler của nút retry trong select (vd `onRetry()`).

Thêm:

```ts
this.tracker?.retryAttempt(Date.now());
```

### Ví dụ

```ts
onRetryPressed() {
  // reset UI selection...
  this.tracker?.retryAttempt(Date.now());
}
```

Kết quả: `history[]` sẽ có attempt #2, #3… đúng format.

---

# 6) Khi rời màn/câu (chuyển sang câu tiếp theo) BẮT BUỘC finalize

Tìm chỗ bạn chuyển câu:

* `nextQuestion()`
* `goToNextScene()`
* `endQuestion()`

Thêm:

```ts
this.tracker?.finalize();
this.tracker = null;
```

### Ví dụ

```ts
nextQuestion() {
  // ✅ chốt item -> đẩy vào items[]
  this.tracker?.finalize();
  this.tracker = null;

  // rồi mới load câu tiếp theo
  this.startQuestion(this.questions[this.index + 1], this.index + 2, this.runSeq);
}
```

> Nếu không finalize, `items[]` sẽ không có item đó và bạn tưởng “SDK sai”.

---

# 7) Case bé thoát giữa chừng (quit)

Nếu select scene có nút “Thoát” / “Back” / “Home”
Trong handler đó thêm:

```ts
this.tracker?.onQuit(Date.now());
this.tracker?.finalize();
```

### Ví dụ

```ts
onExitPressed() {
  this.tracker?.onQuit(Date.now());
  this.tracker?.finalize();
  this.tracker = null;

  // navigate out...
}
```

---

# 8) Case timeout

Nếu câu có timer và hết giờ:

```ts
this.tracker?.onTimeout(Date.now());
this.tracker?.finalize();
```

---

# 9) Test nhanh: in payload ra console

Ở chỗ bạn “kết thúc game / endgame / submit”:

```ts
const submit = game.prepareSubmitData();
console.log("SUBMIT", submit);
console.log("ITEMS", submit.items);
```

Bạn sẽ thấy:

* `submit.items_total`
* `submit.items` có đúng item select
* `history` có 2 attempts nếu bạn retry
* `presented_at_ms/selected_at_ms/time_response_ms`
* `is_correct/error_code`

---

# Checklist để bạn test ra đúng JSON mẫu

Để ra đúng y hệt ví dụ của bạn:

1. `tracker.onShown()` được gọi **1 lần** ngay khi câu hiện.
2. Lần 1 chọn `"option_B"` → `onChoose("option_B")` (fail + `"CONFUSED_ONE_MANY"`)
3. Gọi `retryAttempt()` (hoặc cơ chế của bạn tạo lại attempt)
4. Lần 2 chọn `"option_A"` → `onChoose("option_A")` (pass)
5. Gọi `finalize()` trước khi sang câu khác / endgame
6. Endgame gọi `prepareSubmitData()`

---
