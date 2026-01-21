# 🎲 Math Quiz Game — Học Toán Vui Từ 1 Đến 5

> 🧮 Một mini game giáo dục giúp trẻ nhỏ làm quen với các con số từ **1 đến 5** thông qua các câu hỏi trắc nghiệm sinh động, dễ hiểu, được xây dựng bằng **PhaserJS**.

---

## 🧠 Giới thiệu

**Math Quiz Game** là trò chơi giúp bé rèn luyện kỹ năng **đếm, nhận biết số lượng, so sánh và cộng trừ cơ bản** thông qua hình ảnh trực quan và âm thanh sinh động.

Người chơi sẽ lần lượt đi qua các màn chơi tương ứng với từng chủ đề nhỏ, với độ khó tăng dần.  
Mỗi màn chơi có các hoạt ảnh nhẹ nhàng, **âm thanh vui nhộn**, và hiệu ứng tương tác khi bé trả lời đúng/sai.

---

## 🎮 Các màn chơi chính

| Scene             | Tên màn         | Chức năng                                                                                   |
| ----------------- | --------------- | ------------------------------------------------------------------------------------------- |
| 🟢 **IntroScene** | Màn giới thiệu  | Hiển thị logo, nhạc nền, chuyển tiếp sang menu                                              |
| 🏠 **MainMenu**   | Màn chính       | Nút “Chơi”, “Bản đồ”, “Thoát”; hiệu ứng nút bấm                                             |
| 🗺️ **MapScene**   | Bản đồ màn chơi | Hiển thị 5 cấp độ (Level 1 → Level 5); chọn màn để bắt đầu                                  |
| 📚 **GameScene**  | Màn câu hỏi     | Hiển thị câu hỏi, hình ảnh, các lựa chọn đáp án, điểm, hiệu ứng đúng/sai, âm thanh phản hồi |

---

## 🧩 Cấu trúc câu hỏi (ví dụ)

```js
this.levelData = {
  questions: [
    {
      question: "Có bao nhiêu ngôi sao đang sáng nhỉ?",
      count: 5,
      object: "star",
      options: [
        { label: "3", isCorrect: false },
        { label: "4", isCorrect: false },
        { label: "5", isCorrect: true },
        { label: "6", isCorrect: false },
      ],
    },
  ],
};
```

---

## 🚀 Cách chạy project

### 🧩 Cách 1: Dùng Live Server (VS Code)

1. Cài extension **Live Server**.
2. Mở project trong VS Code.
3. Nhấn **“Go Live”** ở góc phải dưới.
4. Truy cập `http://localhost:5500/`.

### 🧩 Cách 2: Dùng npm

```bash
npm install
npm run dev
```

---

## ✨ Cơ chế hoạt động chính

### 🔹 Hiển thị câu hỏi

- Lấy dữ liệu từ `this.levelData`.
- Gồm nội dung, hình minh họa và đáp án.
- Có hoạt ảnh fade-in và tween mượt.

### 🔹 Âm thanh

- Khi chọn đúng: phát âm thanh `"correct.wav"`.
- Khi sai: phát `"wrong.wav"`.
- Khi thắng: phát `"win.mp3"` và dừng tất cả nhạc nền.

### 🔹 Hiệu ứng tween

- Tất cả đối tượng (chữ, vật thể, nút) xuất hiện bằng tween `alpha` và `scale`.
- Hiệu ứng hover: phóng to nhẹ.

---

## 🖼️ Giao diện minh họa (ASCII)

```
+--------------------------------------------------------------------------------+
| Câu hỏi: "Có bao nhiêu ngôi sao đang sáng nhỉ?"                               |
|--------------------------------------------------------------------------------|
| ⭐   ⭐   ⭐   ⭐   ⭐                                                            |
|--------------------------------------------------------------------------------|
| [ 3 ]     [ 4 ]     [ 5 ]     [ 6 ]                                           |
|--------------------------------------------------------------------------------|
| 🔊 Nhạc nền: Bật           Câu: 1/5                                   |
+--------------------------------------------------------------------------------+
```

---

## 🧠 Kỹ thuật sử dụng

| Thành phần             | Mô tả                                        |
| ---------------------- | -------------------------------------------- |
| **PhaserJS 3**         | Framework chính để dựng game                 |
| **Tween & Animation**  | Hiệu ứng mượt khi xuất hiện câu hỏi, vật thể |
| **Group & Container**  | Quản lý nhóm vật thể (sao, vật đếm)          |
| **Sound Manager**      | Quản lý và phát âm thanh đúng/sai            |
| **Scene Transition**   | Chuyển giữa Intro → Menu → Map → GameScene   |
| **Responsive scaling** | Tự động co giãn phù hợp với màn hình         |
| **Preloader**          | Tải toàn bộ assets trước khi bắt đầu game    |

---
