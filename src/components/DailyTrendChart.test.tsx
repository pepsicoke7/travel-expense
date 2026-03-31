// ============================================================
// 每日花费趋势图组件 - 单元测试
// 注意：Recharts 在 jsdom 中无法完整渲染 SVG，仅测试基本渲染和空状态
// ============================================================

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import DailyTrendChart from './DailyTrendChart';
import type { DailyExpense } from '../types';

describe('DailyTrendChart', () => {
  it('数据为空时显示空状态提示', () => {
    render(<DailyTrendChart data={[]} />);
    expect(screen.getByText('暂无每日支出数据')).toBeInTheDocument();
  });

  it('有数据时渲染标题', () => {
    const data: DailyExpense[] = [
      { date: '2024-03-01', totalAmount: 200 },
      { date: '2024-03-02', totalAmount: 350 },
      { date: '2024-03-03', totalAmount: 0 },
    ];
    render(<DailyTrendChart data={data} />);
    expect(screen.getByText('每日花费趋势')).toBeInTheDocument();
  });
});
