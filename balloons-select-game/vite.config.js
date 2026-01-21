import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
    server: {
        open: true, // tự động mở browser
    },
    build: {
        // Hạ target xuống mức mà iOS cũ vẫn chịu được
        // Có thể chỉnh tuỳ mức bạn muốn hỗ trợ:
        // - 'safari13' cho iOS 13 trở lên
        // - hoặc mix ES + Safari
        target: ['es2018', 'safari13'],
    },

    // Target cho dev server (npm run dev)
    esbuild: {
        target: 'es2018',
    },
});
