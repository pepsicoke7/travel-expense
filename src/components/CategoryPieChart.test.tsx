// ============================================================
// 分类支出饼图组件 - 单元测试
// 注意：Recharts 在 jsdom 中无法完整渲染 SVG，仅测试基本渲染和空状态
// ============================================================

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CategoryPieChart from './CategoryPieChart';
import type { CategorySummary } from '../types';

describe('CategoryPieChart', () => {
  it('数据为空时显示空状态提示', () => {
    render(<CategoryPieChart data={[]} />);
    expect(screen.getByText('暂无分类支出数据')).toBeInTheDocument();
  });

  it('有数据时渲染标题', () => {
    const data: CategorySummary[] = [
      { category: '餐饮', totalAmount: 500, percentage: 50 },
      { category: '交通', totalAmount: 300, percentage: 30 },
      { category: '住宿', totalAmount: 200, percentage: 20 },
    ];
    render(<CategoryPieChart data={data} />);
    expect(screen.getByText('分类支出占比')).toBeInTheDocument();
  });
});
