## Tổng quan
- App hiện xây bằng Vite + React, tập trung đúng một mini game “Đếm & Chọn Số Đúng” với hai chế độ `count` và `quiz` (src/App.tsx:6).
- Toàn bộ vòng đời game (menu → chơi → kết quả) đã được bao trong `CountingGame` nên có thể embed dưới dạng component độc lập (src/components/CountingGame.tsx:22).

## Chức năng đã làm
- Sinh câu hỏi tự động cho cả chế độ trắc nghiệm và đếm vật thông qua `GameGenerator` (src/utils/gameGenerator.ts:8).
- Giao diện điều khiển độ khó, chế độ chơi và tiến độ có hiệu ứng/timer, bảng điểm cuối trò (src/components/CountingGame.tsx:82).
- Chế độ `CountMode` hiển thị emoji ngẫu nhiên với animation `motion` + phản hồi âm thanh TTS (src/components/CountMode.tsx:19).
- Chế độ `QuizMode` phát câu hỏi bằng giọng nói và tô màu đáp án đúng/sai (src/components/QuizMode.tsx:10).

## Điểm đáng chú ý
- API ghi nhận sự kiện game hiện chỉ mock, mới log ra console (src/services/gameApi.ts:9).
- Khoá FPT TTS đang hard-code trong cả hai chế độ; cần chuyển sang biến môi trường trước khi public (src/components/CountMode.tsx:7, src/components/QuizMode.tsx:13).
- Bộ UI dùng Tailwind v4 + shadcn/button/card, nên khi nhúng vào app khác phải bảo đảm layer CSS/tokens tương thích (src/components/ui/button.tsx:6).

## Khoảng trống & gợi ý tích hợp Next.js
- Chưa có packaging dưới dạng module; muốn dùng trong Next chỉ cần xuất `CountingGame` và mount trong page/client component, đồng thời bảo đảm import global CSS (src/main.tsx:1).
- Thêm provider cho fetch/âm thanh nếu chạy trong môi trường client-only của Next (Next 13+ dùng `use client`).
- Cần cấu hình biến môi trường cho FPT_TTS, và nối `gameApi` với backend thực tế hoặc API route Next.
- Hiện chưa có test/storybook; nên bổ sung nếu định chia sẻ cho team product.

## Next coding round – Issues & hướng xử lý
- Cần xây lại hệ thống tài liệu: bổ sung thư mục `doc/` với cấu trúc rõ ràng cho phạm vi game, phân tích kỹ thuật (asset loading, scene, game object, animation/motion, logic handler, main-app integration) và khung tổ chức source. Mục tiêu là đảm bảo repo luôn mạch lạc, DRY và đúng bài toán.
- Rà soát các component copy từ nguồn ngoài, đóng gói thành `common_lib` hoặc tương tự và chỉ giữ những phần thực sự dùng; tránh clone tràn lan.
- Tổ chức lại `src/`: tách riêng asset và code, chia module theo từng mini game, gom phần dùng chung (UI, logic, giao tiếp API) thành thư viện chung, đảm bảo dễ mở rộng thêm game mới.

## Kế hoạch tái cấu trúc tài liệu (next coding round)
- **Mục tiêu**: xây bộ tài liệu dẫn dắt rõ ràng để team mở rộng N mini game nhưng vẫn đồng nhất về mục tiêu học tập và kiến trúc kỹ thuật.
- **Cấu trúc đề xuất cho `doc/`**
  - `doc/README.md`: mô tả mục tiêu tổng quát, tiến độ, liên kết tới toàn bộ tài liệu con và ghi chú cách đóng góp.
  - `doc/scope/overview.md`: phân tích phạm vi bài toán, liệt kê danh sách game dự kiến, các điểm chung (core mechanic, khó khăn, kỹ năng học tập) và khác biệt từng game (asset, rule riêng). Tham chiếu `doc/1_all_game_ver1.md` làm nguồn yêu cầu.
  - `doc/tech/architecture.md`: trình bày kiến trúc kỹ thuật cốt lõi của phiên bản mới: cơ chế asset loading, scene/state manager, quản lý game object, animation/motion, audio/TTS, cùng chiến lược tích hợp vào React/Next.
  - `doc/tech/pipeline.md`: mô tả pipeline build/asset, quy ước đặt tên, thư mục asset, guideline tối ưu cho mobile/web, checklist kiểm thử.
  - `doc/app/structure.md`: mô hình hoá tổ chức source code, quan hệ giữa router, game manager, UI shell, module chia sẻ.
  - Giữ `doc/1_all_game_ver1.md` làm tài liệu yêu cầu; liên kết chéo từ README và các file trên.
- **Template chung cho từng game**: tạo file mẫu (ví dụ `doc/scope/templates/game.md`) với các mục: mục tiêu học tập, mechanic chính, luồng màn chơi, nguồn dữ liệu câu hỏi, danh sách asset (image/audio), API hoặc event cần gửi, ghi chú accessibility.

## Định hướng kỹ thuật cho phiên bản hiện tại
- **Game framework**: sử dụng PixiJS cho phần canvas/game loop; bọc bằng React component để nhúng vào Next.js. UI phụ (menu, HUD) tiếp tục dùng React/Tailwind để đảm bảo reuse.
- **Asset loading**: chuẩn hoá manifest per game (JSON) và tải thông qua Pixi Asset Loader; asset đặt dưới `public/assets`. Thiết lập preloading + progress event, tách asset khỏi bundle code.
- **Scene & state manager**: xây `GameOrchestrator` chịu trách nhiệm lifecycle (init → intro → question → feedback → outro) và phát event thông qua emitter; React wrapper lắng nghe event để update UI.
- **Game objects & animation**: định nghĩa lớp cơ sở cho sprite/game object với helper tween (Pixi ticker + easing). Viết thư viện animation chung (spawn, correct, wrong) để tránh lặp.
- **Logic handler**: tách core logic thành service thuần TypeScript (ví dụ `countingLogic`) xử lý sinh câu hỏi, đánh giá đáp án; hook React chỉ wrap input/output. Cho phép cấu hình độ khó bằng JSON.
- **Main-app integration**: API component dạng `<MiniGame mode difficulty onProgress onEnd />` trả event chuẩn (start, answer, end) để Next.js shell thu thập analytics và điều hướng.

## Đề xuất tổ chức lại `src/`
- `src/app/`: shell React (router, layout, provider, analytics/global services).
- `src/games/`: mỗi mini game một thư mục (`counting`, `quiz`, ...) với cấu trúc con `config/`, `scenes/`, `logic/`, `ui/`, `assets/manifest.ts`. Wrapper React đặt ở `ui/`.
- `src/common/`: tài nguyên dùng chung (hooks, UI thành phần nhỏ, services như `analytics`, `tts`, `audio`, `storage`). Gồm cả component chuẩn hoá (`SoundButton`, `ScoreBoard`, ...).
- `src/engine/` (hoặc `src/lib/engine/`): lớp tiện ích Pixi (app factory, scene manager, animation helpers, object pool).
- `src/styles/`: global styles, tokens Tailwind.
- `public/assets/`: asset tĩnh chia theo game (`games/counting/`, `games/quiz/`). Di chuyển logo/emoji nếu tái sử dụng.

## Next coding round – việc ưu tiên
1. Thiết lập skeleton thư mục `doc/` theo cấu trúc mới, chuyển nội dung hiện tại vào file tương ứng và thêm template game.
2. Dọn dẹp component UI: gom phần đang dùng vào `src/common/ui/`, di chuyển phần dư thừa sang thư viện riêng hoặc loại bỏ để repo gọn nhẹ.
3. Tái cấu trúc `src/` bắt đầu từ game hiện tại: tạo `src/games/counting/` với module rõ ràng (logic, scene, React wrapper) và cập nhật import.
4. Chuẩn hoá xử lý asset: di chuyển hình ảnh/emoji vào `public/assets/games/counting/`, cập nhật loader + manifest.
5. Bổ sung `GameOrchestrator` + layer event bus, cập nhật `CountingGame` để sử dụng, đảm bảo sẵn sàng mở rộng game mới.

### Bổ sung định hướng framework/game loop
- Không khoá cứng vào PixiJS; ưu tiên khung quy chuẩn cho mini edu game: render các đối tượng trên canvas với hiệu năng cao, tận dụng hardware acceleration. Chấp nhận dùng lib có sẵn hoặc xây native wrapper nếu phù hợp.
- **Render pipeline**: xây abstraction cho scene graph `(x, y, z)` để platform bên dưới (WebGL, Canvas2D, WebGPU, lib đồ hoạ) tối ưu việc draw song song.
- **Game loop**: thiết kế tick/event loop đảm bảo FPS cao; mỗi tick xử lý lần lượt 3 nhóm chính: input đa thiết bị (touch/mouse/drag-drop/scratch), logic nội bộ (animation, collision, kết quả), và tương tác ngoài (API main app, audio/TTS, AI input nếu có).
- **Scene composition**: chuẩn hoá quy trình load asset (tilemap, spritesheet, audio), dựng scene/object, đăng ký handler, gắn tween/animation. Cấu trúc component/game object nên đủ nhẹ để mở rộng dần và thử nghiệm nhiều thư viện.
- Khuyến khích thử nghiệm và benchmark nhiều thư viện JS (PixiJS, Phaser, Three, Unity WebGL…) song song phương án tự xây lightweight engine rồi mở rộng.
