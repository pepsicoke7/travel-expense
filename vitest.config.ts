/// <reference types="vitest/config" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    // 测试环境配置
    environment: 'jsdom',
    globals: true,
    // 测试文件匹配模式
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    // 测试设置文件
    setupFiles: ['./src/test/setup.ts'],
    // 覆盖率配置
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/test/**', 'src/**/*.d.ts'],
    },
  },
});
