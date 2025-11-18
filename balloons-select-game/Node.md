Hình **không hiển thị** trong Phaser + Vite gần như chắc chắn do **sai đường dẫn asset**.
Vite **không cho load file trong `src/` trực tiếp bằng URL**, nên Phaser không tìm thấy hình.

Đây là lỗi **60% dev gặp**, nhất là khi mới dùng Vite.

---

# ✅ **Giải pháp đúng trong Vite: đặt asset vào thư mục `public/`**

### 👉 Bạn hãy tạo cấu trúc sau:

```
public/
   assets/
      images/
         bg_forest.png
         rabbit_idle.png
         banner_top.png
         ...
      audio/
         vo_prompt_1.mp3
         ...
src/
   main.ts
   scenes/
      GameScene.ts
```

🎯 Khi asset đặt trong `public/`, Vite sẽ phục vụ file đúng chuẩn như static server.

---

# ✅ Sau đó, thay preload() như sau:

```ts
preload() {
  this.load.image("bg_forest", "/assets/images/bg_forest.png");
  this.load.image("rabbit_idle", "/assets/images/rabbit_idle.png");
  this.load.image("rabbit_cheer", "/assets/images/rabbit_cheer.png");
  this.load.image("banner_top", "/assets/images/banner_top.png");

  this.load.image("balloon_red", "/assets/images/balloon_red.png");
  this.load.image("balloon_blue", "/assets/images/balloon_blue.png");
  this.load.image("balloon_green", "/assets/images/balloon_green.png");
  this.load.image("balloon_purple", "/assets/images/balloon_purple.png");

  // AUDIO
  this.load.audio("vo_prompt_1", "/assets/audio/vo_prompt_1.mp3");
  this.load.audio("sfx_correct", "/assets/audio/sfx_correct.mp3");
  this.load.audio("sfx_wrong", "/assets/audio/sfx_wrong.mp3");
  this.load.audio("sfx_pop", "/assets/audio/sfx_pop.mp3");
  this.load.audio("sfx_flyaway", "/assets/audio/sfx_flyaway.mp3");
}
```

💡 Lưu ý:
**Đường dẫn phải bắt đầu bằng `/`**
→ vì `public/` luôn map vào root của server.

---

# 🟩 Tổng kết: Cách đúng để hiển thị hình trong Phaser + Vite

✔ Đặt asset vào `public/assets/...`
✔ Load bằng đường dẫn `/assets/...`
✔ Không được load từ `src/assets`

---

