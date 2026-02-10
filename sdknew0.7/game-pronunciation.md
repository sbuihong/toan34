# Game Đọc Thành Tiếng (Read Aloud / Pronunciation) – SDK Integration Guide (Phaser)

Game mẫu: Bé nghe mẫu → đọc từng dòng (6 dòng) bằng mic.
Mục tiêu: Tích hợp **Item Tracker (pronunTracker)** để SDK ghi lại **expected**, **history từng attempt**, **đúng/sai theo threshold**, **thời gian**, **hint**, **playback_count**, và thống kê cuối game.

---

## 0) Bạn sẽ có gì sau khi làm xong?

Khi game chạy xong, SDK bắn ra payload `COMPLETE` trong đó có:

* `items[]`: **mỗi dòng = 1 item pronunciation**

  * `expected.text`: text cần đọc của dòng đó
  * `expected.pass_threshold`: ngưỡng pass (ví dụ 0.75)
  * `history[]`: attempt của dòng:

    * `prompt_shown_at_ms`, `record_started_at_ms`, `record_ended_at_ms`, `time_to_start_ms`, `read_duration_ms`
    * `response`: `{ playback_count, audio_record_id, score, details }`
    * `is_correct`, `error_code` (BELOW_THRESHOLD / SYSTEM_ERROR / USER_ABANDONED ...)
  * `hint_used`: tổng hint của dòng

✅ Nói ngắn gọn: **Bạn có full log “bé làm gì – lúc nào – kết quả ra sao” cho từng dòng.**

---

## 1) Luồng hoạt động game đọc (móc SDK đúng chỗ)

Trong Phaser, line-by-line reading thường có 5 “điểm chạm”:

1. **Hiện dòng cho bé đọc** (line được reveal/ready)

   * ✅ `tracker.onPromptShown()`

2. **Bé bấm loa nghe lại prompt** (optional)

   * ✅ tăng `playback_count` (mình tự đếm, gắn vào `response` khi scored)

3. **Bé bấm mic bắt đầu ghi**

   * ✅ `tracker.onRecordStart()`

4. **Ghi âm kết thúc**

   * ✅ `tracker.onRecordEnd()`

5. **Có điểm từ backend**

   * ✅ `tracker.onScored(score01, details)` hoặc `tracker.onError(errorCode)`
   * ✅ `tracker.finalize()`

---

## 2) Cài SDK (nếu project chưa có)

```bash
pnpm run setup
```

---

## 3) Import + lấy factory tạo tracker

Ở đầu file Scene (SpeakScene):

```ts
import { sdk, gameSDK } from "../../main";
import { configureSdkContext, voice } from "@iruka-edu/mini-game-sdk";

configureSdkContext({
  fallback: {
    gameId: "local-game-001",
    lessonId: "local-lesson-001",
    gameVersion: "0.0.0",
  },
});

// factory
const createPronunTracker = gameSDK.createPronunTracker;
```

---

## 4) Khai báo biến trong class

```ts
// ===== Pronun Trackers (mỗi line = 1 item pronunciation) =====
private pronunRunSeq = 1;
private pronunItemSeq = 0;
private pronunByLine = new Map<number, ReturnType<typeof createPronunTracker>>();

// line hiện tại
private currentPronunLine: number | null = null;

// hint chỉ tính 1 lần/line (vì bạn loop 4s)
private hintCountedForLine = new Set<number>();

// đếm số lần bé bấm loa nghe lại prompt của line hiện tại
private playbackCountByLine = new Map<number, number>();
```

---

## 5) Chuẩn hóa text expected của từng line (QUAN TRỌNG)

Bạn **không được để `expected.text` là `"line_1"`** như debug, vì backend/analytics sẽ coi sai dữ liệu.

Bạn đang làm đúng rồi:

```ts
private getLineText(lineIndex: number): string {
  return GameConstants.SPEAK_SCENE.LINE_READING.KEYWORDS_PER_LINE[lineIndex] ?? "";
}
```

✅ Checklist:

* `KEYWORDS_PER_LINE` phải có đủ 6 dòng
* Không được rỗng `""` (rỗng thì expected thiếu → report sai)

---

## 6) Tạo 1 pronun item cho mỗi line: `ensurePronunItemForLine`

Dùng đúng như bạn đang có:

```ts
private ensurePronunItemForLine(lineIndex: number) {
  this.currentPronunLine = lineIndex;

  let t = this.pronunByLine.get(lineIndex);
  if (t) return t;

  this.pronunItemSeq += 1;

  t = createPronunTracker({
    meta: {
      item_id: `READ_TEXT_${String(lineIndex + 1).padStart(3, "0")}`,
      item_type: "pronunciation",
      seq: this.pronunItemSeq,
      run_seq: this.pronunRunSeq,
      difficulty: 1,
      scene_id: "SCN_READ_01",
      scene_seq: lineIndex + 1,
      scene_type: "pronunciation",
      skill_ids: ["doc_thanh_tieng_34_tv_003"],
    },
    expected: {
      text: this.getLineText(lineIndex),
      pass_threshold: 0.75,
      scoring_rule: { by: ["word", "phoneme", "rhythm"] },
    },
  });

  // prompt_shown_at_ms = lúc line được đưa ra cho bé đọc
  t.onPromptShown(Date.now());

  this.pronunByLine.set(lineIndex, t);
  return t;
}
```

✅ Đây là chỗ làm cho `expected` **đủ dữ liệu**.

---

## 7) Móc SDK vào flow game (đúng “điểm chạm”)

### 7.1 Khi vào Reading Mode (line 1 hiện ra)

Trong `showMicWithHint()`:

```ts
// line 1 được show => prompt_shown_at_ms
this.ensurePronunItemForLine(0);
```

---

### 7.2 Khi bé bấm loa nghe lại prompt của line hiện tại

Trong `onSpeakerClick()` (case isReadingMode):

```ts
const cur = this.lineMasks.currentLine;
this.playbackCountByLine.set(cur, (this.playbackCountByLine.get(cur) ?? 0) + 1);
```

✅ Bạn tự đếm playback, rồi nhét vào `details` lúc `onScored`.

---

### 7.3 Khi hint hand chỉ mic (chỉ tính 1 lần/line)

Trong `startMicHintLoop()`:

```ts
const lineIndex = this.lineMasks.currentLine;
const tr = this.ensurePronunItemForLine(lineIndex);

if (!this.hintCountedForLine.has(lineIndex)) {
  tr.hint?.(1);
  this.hintCountedForLine.add(lineIndex);
}
```

✅ Hint sẽ lên:

* `attempt.hint_used`
* `item.hint_used`

---

### 7.4 Khi bé bấm mic bắt đầu ghi

Trong `onMicroClick()`:

```ts
const currentLine = this.lineMasks.currentLine;

const tr = this.ensurePronunItemForLine(currentLine);
tr.onRecordStart(Date.now());
```

---

### 7.5 Khi ghi âm xong (record end)

Trong `onLineRecordingComplete()`:

```ts
const lineIndex = this.pendingLineData.lineIndex;
const tr = this.ensurePronunItemForLine(lineIndex);

tr.onRecordEnd(Date.now());
```

---

### 7.6 Khi có điểm từ backend (đây là chỗ quan trọng nhất)

Trong `trySubmitLineAndProceed()` → đoạn `.then((resp) => { ... })`

Bạn đang làm đúng hướng. Mẫu chuẩn:

```ts
this.lineScores
  .submitLineScore(lineIndex, audioBlob, durationMs)
  .then((resp) => {
    if (!resp) return;

    // backend 0..100 -> score01 0..1
    const score01 = resp.score > 1 ? resp.score / 100 : resp.score;

    tr.onScored(
      score01,
      {
        playback_count: this.playbackCountByLine.get(lineIndex) ?? 0,
        audio_record_id: null, // nếu backend có id thì map vào đây
        transcript: resp.transcript ?? "",
        latency_seconds: resp.latency_seconds ?? 0,
        raw_score_100: resp.score,
      },
      Date.now()
    );

    tr.finalize?.();
    this.pronunByLine.delete(lineIndex);

    // progress đúng/sai theo score thật
    const ok = score01 >= 0.75;
    if (ok) gameSDK.recordCorrect({ scoreDelta: 1 });
    else gameSDK.recordWrong?.({ scoreDelta: 0 });
  })
  .catch((err) => {
    tr.onError("SYSTEM_ERROR" as any, { message: String(err) }, Date.now());
    tr.finalize?.();
    this.pronunByLine.delete(lineIndex);
  });
```

✅ Sau bước này, `history[].response.score/details` sẽ **không còn null**, và `is_correct` sẽ đúng theo threshold.

---

## 8) Lỗi “attempt nào cũng sai + response null” thường do đâu?

Dựa đúng case bạn gửi payload sai lúc trước, 99% là do:

1. **Bạn không gọi `onScored()`** (hoặc gọi sai score scale)
   → response.score = 0 / details = null

2. **expected.text rỗng hoặc placeholder**
   → expected thiếu, analytics nhìn như sai data

3. **Bạn recordCorrect bừa trước khi biết score thật**
   → thống kê “pass/ fail” lệch (bạn đã comment cái này rồi ✅)

---

## 9) Checklist “không thể sai được”

* [ ] `getLineText()` trả về đúng text thật cho 6 dòng
* [ ] Mỗi line đều có `ensurePronunItemForLine(lineIndex)` trước khi record
* [ ] mic start gọi `onRecordStart()`
* [ ] mic end gọi `onRecordEnd()`
* [ ] backend trả điểm thì gọi `onScored(score01, details)`
* [ ] lỗi backend/mic thì gọi `onError(errorCode)`
* [ ] line xong thì `finalize()` + `delete` khỏi map
* [ ] **không gọi `recordCorrect` trước khi có score thật**

---

## 10) Ví dụ payload output (rút gọn)

Một line pass:

```json
{
  "item_id": "READ_TEXT_001",
  "expected": { "text": "đi chợ", "pass_threshold": 0.75 },
  "history": [
    {
      "response": {
        "playback_count": 1,
        "audio_record_id": "rec_abc",
        "score": 0.82,
        "details": { "raw_score_100": 82, "transcript": "đi chợ" }
      },
      "is_correct": true,
      "error_code": null
    }
  ]
}
```

Fail vì dưới ngưỡng:

```json
{
  "response": { "score": 0.68, "details": { "raw_score_100": 68 } },
  "is_correct": false,
  "error_code": "BELOW_THRESHOLD"
}
```

---

## Done.
