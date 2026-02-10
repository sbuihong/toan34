# Iruka Mini Game SDK – Drag (Kéo thả) Integration Guide (Hands-on)

Tài liệu này hướng dẫn tích hợp **SDK tracker cho game drag** theo chuẩn `iruka.item_results.v1` với flow:
- Mỗi **level = 1 item**
- Mỗi lần bé “thử” (drag bắt đầu → thả đủ 3 slot → auto-check) = **1 attempt**
- Hint bấm trong level sẽ ghi `hint_used` đúng vào `history[]` + `item.hint_used`
- Thoát game / replay / shutdown giữa chừng sẽ ghi `USER_ABANDONED`

---

## 0) Bạn cần có gì?

Trong game:
```ts
import { game as irukaGame } from "@iruka-edu/mini-game-sdk";
const createDragTracker = irukaGame.createDragTracker;
````

Trong SDK bạn đã có sẵn:

* `BaseTracker.hint()` gọi `itemsCore.useHint()`
* `dragTracker.onDragStart()` -> mở attempt
* `dragTracker.onDrop()` -> end attempt với response
* `dragTracker.onQuit()` -> attempt USER_ABANDONED
* `dragTracker.finalize()` -> push item vào `items[]`

---

## 1) Mục tiêu schema output

Mỗi item dạng:

```json
{
  "item_id": "DRAG_SORT_1",
  "item_type": "drag",
  "seq": 1,
  "run_seq": 1,
  "scene_id": "SCN_DRAG_01",
  "scene_seq": 1,
  "scene_type": "drag",
  "expected": {
    "draggables": ["BOOK_1","BOOK_2","BOOK_3"],
    "droppables": ["slot1","slot2","slot3"],
    "correct_pairs": [
      { "drag": "BOOK_1", "drop": "slot1" },
      { "drag": "BOOK_2", "drop": "slot2" },
      { "drag": "BOOK_3", "drop": "slot3" }
    ],
    "snap_radius_px": 70
  },
  "history": [
    {
      "attempt": 1,
      "started_at_ms": 1735612500000,
      "ended_at_ms": 1735612504200,
      "time_spent_ms": 4200,
      "response": {
        "drag_item_id": "BOOK_2",
        "drop_target_id": "slot1",
        "drop_distance_px": 55,
        "placements": [
          { "drag_item_id": "BOOK_3", "drop_target_id": "slot1" },
          { "drag_item_id": "BOOK_1", "drop_target_id": "slot2" },
          { "drag_item_id": "BOOK_2", "drop_target_id": "slot3" }
        ],
        "is_correct": false
      },
      "is_correct": false,
      "error_code": "WRONG_TARGET",
      "hint_used": 1
    }
  ],
  "hint_used": 1
}
```

> Lưu ý: Schema cho phép `response` có field mở rộng (VD `placements`) để debug/BI.

---

## 2) Quy ước tích hợp (nên giữ)

### 2.1 Level = 1 item

* Mỗi lần vào level: tạo tracker mới
* Nếu tracker level trước chưa finalize: coi như quit (USER_ABANDONED)

### 2.2 Attempt = 1 lần thử

* Mở attempt ở `dragstart` đầu tiên của lần thử
* Kết attempt khi đủ slot và auto-check đúng/sai

### 2.3 Hint

* Khi bé bấm hint: gọi cả hub + tracker
* `tracker.hint()` **không nhận timestamp** (chỉ nhận count)

---

## 3) 5 điểm “cắm” bắt buộc trong code

### (1) Khai báo state + helper fields

Trong Scene class:

```ts
private runSeq = 1;
private itemSeq = 0;
private dragTracker: ReturnType<typeof createDragTracker> | null = null;

private dragAttemptOpen = false;
private dragAttemptStartedAtMs = 0;
private lastDrop: { drag_item_id: string; drop_target_id: string; drop_distance_px?: number } | null = null;
```

---

### (2) Khi start level: tạo tracker + expected chuẩn

Trong `startLevel()`:

```ts
this.__finalizeDragItemAsQuit();  // đảm bảo level trước không rơi item

this.itemSeq += 1;

const expectedOrder = this.getExpectedOrder();
const droppables = expectedOrder.map((_, i) => `slot${i + 1}`);

this.dragTracker = createDragTracker({
  meta: {
    item_id: `DRAG_SORT_${this.itemSeq}`,
    item_type: "drag",
    seq: this.itemSeq,
    run_seq: this.runSeq,
    difficulty: 1,
    scene_id: "SCN_DRAG_01",
    scene_seq: this.itemSeq,
    scene_type: "drag",
    skill_ids: [],
  },
  expected: {
    draggables: [...this.currentLevelItemIds],
    droppables,
    correct_pairs: expectedOrder.map((id, i) => ({ drag: id, drop: `slot${i + 1}` })),
    snap_radius_px: Math.round(this.slotSize * 0.65),
  },
  errorOnWrong: "WRONG_TARGET",
});

this.dragAttemptOpen = false;
this.dragAttemptStartedAtMs = 0;
this.lastDrop = null;
```

---

### (3) DragStart: mở attempt lần đầu của “lượt thử”

Trong `this.input.on('dragstart', ...)`:

```ts
if (this.dragTracker && !this.dragAttemptOpen) {
  const ts = Date.now();
  this.dragAttemptOpen = true;
  this.dragAttemptStartedAtMs = ts;
  this.dragTracker.onDragStart?.(item.id, ts);
}
```

---

### (4) DragEnd: lưu “last drop” (dữ liệu response)

Trong `dragend`:

```ts
const nearest = this.__nearestSlotInfo(item.container.x, item.container.y);

const snapped = this.trySnapToNearestSlot(item);
if (!snapped) {
  this.restoreToPreviousPosition(item);
} else {
  if (nearest && item.slotIndex !== null) {
    this.lastDrop = {
      drag_item_id: item.id,
      drop_target_id: `slot${item.slotIndex + 1}`,
      drop_distance_px: Math.round(nearest.distPx),
    };
  }
}

this.maybeCheckOrderComplete();
```

---

### (5) Auto-check: endAttempt (commit attempt) + correct/wrong flow

Trong `maybeCheckOrderComplete()`:

```ts
const picked = this.slotAssignments.map((x) => (x ? x.id : null));
const expected = this.getExpectedOrder();
const isCorrect = picked.every((id, idx) => id === expected[idx]);

this.__commitDragAttempt(isCorrect);

if (isCorrect) this.onCorrect();
else this.onWrong();
```

Helper `__commitDragAttempt` (giữ đúng như bạn đã làm):

* build `placements`
* dùng `lastDrop`
* gọi `dragTracker.onDrop(resp, ts, { isCorrect, errorCode })`

---

## 4) Hint integration (cực quan trọng)

Trong `useHint()` của game:

```ts
recordHubHint();        // thống kê hub (hintCount)
this.dragTracker?.hint?.();  // thống kê item/history hint_used
```

> Không truyền `Date.now()` vào `hint()`. `hint()` chỉ nhận count.

---

## 5) Quit / Shutdown / Replay: không được rơi item

### 5.1 Khi scene shutdown (thoát scene)

```ts
this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
  this.__finalizeDragItemAsQuit();
});
```

### 5.2 Khi finalizeAttempt (sang endgame)

```ts
this.__finalizeDragItemAsQuit();
irukaGame.finalizeAttempt();
```

### 5.3 Khi retryFromStart (replay)

```ts
this.__finalizeDragItemAsQuit();
this.runSeq += 1;    // replay thì tăng run_seq
this.itemSeq = 0;

irukaGame.retryFromStart();
```

---

## 6) Correct path: finalize item

Trong `onCorrect()`:

```ts
if (this.dragTracker) {
  this.dragTracker.finalize?.();
  this.dragTracker = null;
}
```

> Với flow của bạn: finalize chỉ ở correct (pass).
> Nếu muốn “đủ items[] cho mọi level dù fail/quit” thì finalize ở cả onWrong hoặc trước khi chuyển level, nhưng hiện tại bạn đang theo kiểu “chỉ pass mới chốt item”.

---

## 7) Debug nhanh: kiểm tra items output

Bạn có thể log lúc endgame:

```ts
console.log("[SDK] result =", irukaGame.debug?.());
```

Hoặc nếu SDK đã có event COMPLETE payload thì soi `payload.stats.items`.

---

## 8) Checklist “đúng chuẩn”

* [x] `setTotal(totalLevels)` gọi đầu game
* [x] mỗi level tạo 1 tracker với expected đầy đủ: `draggables/droppables/correct_pairs/snap_radius_px`
* [x] dragstart mở attempt
* [x] đủ slot -> commit attempt bằng onDrop
* [x] hint gọi `tracker.hint()`
* [x] shutdown/retry/finalizeAttempt đều gọi `__finalizeDragItemAsQuit()`
* [x] correct -> finalize item

---

## 9) FAQ nhanh

### Q: Hint bấm trước dragstart có ghi đúng không?

Có. `tracker.hint()` sẽ auto beginAttempt trong `itemsCore`.
Nhưng attempt.started_at_ms sẽ là lúc bấm hint (không phải lúc kéo). Nếu bạn muốn started_at_ms = dragstart thì cần thiết kế “pending hint”, còn hiện tại thì OK.

### Q: `drop_distance_px` nên tính thế nào?

Bạn đang tính theo `distance(itemPos, slotCenter)` trước snap là hợp lý. Đủ dùng để BI biết snap gần hay xa.

### Q: Response thiếu field thì sao?

Schema cho phép response linh hoạt. Bạn tối thiểu cần:

* `drag_item_id`
* `drop_target_id`
* (optional) `drop_distance_px`
  Bạn đang thêm `placements` rất tốt.

---

Done.

```

---

### Nhận xét nhanh về code bạn gửi (để bạn yên tâm)
- Bạn đã **gắn hint đúng** (`this.dragTracker?.hint?.()`), OK.
- Bạn đã **chặn rơi item** bằng `__finalizeDragItemAsQuit()` ở shutdown/finalize/retry, OK.
- Bạn đã **commit attempt** đúng chỗ (khi đủ slot), OK.
- Bạn đã **tạo expected đầy đủ** (`draggables/droppables/correct_pairs/snap_radius_px`), OK.

Một điểm “triết học dữ liệu” thôi (không bắt bạn sửa): hiện tại **item chỉ finalize khi correct**. Nếu BI muốn nhìn thấy cả level fail/quit như item riêng thì bạn sẽ finalize cả khi wrong/quit. Nhưng theo flow hiện tại, bạn đang “attempt-based analytics” vẫn có data attempt cho level đó trước khi quit (do `onQuit`), nên cũng ổn.

```
