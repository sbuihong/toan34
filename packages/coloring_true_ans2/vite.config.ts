import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
    base: './',
    server: {
    open: true // tự động mở browser
  },
  build: {
    chunkSizeWarningLimit: 1500, // Tăng giới hạn cảnh báo lên 1500kB (vì Phaser ~1.2MB)
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Nếu file nằm trong node_modules, gộp nó vào chunk riêng tên là 'vendor'
          // if (id.includes('node_modules')) {
          //   return 'vendor';
          // }
          
          // HOẶC: Cách nâng cao để tách riêng từng thư viện lớn nếu file vendor vẫn quá to
          
          if (id.includes('node_modules')) {
            if (id.includes('phaser')) {
              return 'phaser_vendor'; // Tách Phaser ra riêng (Thư viện nặng nhất)
            }
            return 'vendor'; // Các thư viện còn lại
          }
          
        },
      },
    },
  },
});
