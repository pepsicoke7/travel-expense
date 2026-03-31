// ============================================================
// TripStatsPage 测试
// 验证旅行统计页：分类饼图、分类列表、每日趋势图
// 验证需求：7.1, 7.2, 7.3, 7.4, 8.1, 8.2, 8.3, 8.4
// ============================================================

import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import type { AppData, Trip, Expense } from '../types';
import TripStatsPage from './TripStatsPage';

// 模拟 useAppContext
let mockState: AppData = { trips: [], version: 1 };

vi.mock('../context/AppContext', () => ({
  useAppContext: () => ({ state: mockState, dispatch: vi.fn() }),
}));

// 模拟 Recharts 组件，避免在测试环境中渲染 SVG
vi.mock('recharts', () => ({
  PieChart: ({ children }: { children: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => null,
  Cell: () => null,
  Tooltip: () => null,
  Legend: () => null,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
}));

/** 辅助函数：创建测试用支出数据 */
function makeExpense(overrides: Partial<Expense> & { id: string }): Expense {
  return {
    tripId: 'trip-1',
    amount: 100,
    category: '餐饮',
    note: '',
    date: '2024-03-01',
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

/** 辅助函数：创建测试用旅行数据 */
function makeTrip(overrides: Partial<Trip> = {}): Trip {
  return {
    id: 'trip-1',
    name: '东京之旅',
    destination: '东京',
    startDate: '2024-03-01',
    endDate: '2024-03-07',
    expenses: [],
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

/** 辅助函数：渲染组件（带路由参数） */
function renderPage(tripId = 'trip-1') {
  return render(
    <MemoryRouter initialEntries={[`/trip/${tripId}/stats`]}>
      <Routes>
        <Route path="/trip/:id/stats" element={<TripStatsPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('TripStatsPage', () => {
  it('旅行不存在时显示提示并引导返回', () => {
    mockState = { trips: [], version: 1 };
    renderPage('nonexistent');

    expect(screen.getByText(/旅行不存在/)).toBeInTheDocument();
    expect(screen.getByText('返回旅行列表')).toBeInTheDocument();
  });

  it('展示旅行名称和总支出', () => {
    mockState = {
      trips: [
        makeTrip({
          expenses: [
            makeExpense({ id: 'e1', amount: 300 }),
            makeExpense({ id: 'e2', amount: 200 }),
          ],
        }),
      ],
      version: 1,
    };
    renderPage();

    expect(screen.getByText(/东京之旅/)).toBeInTheDocument();
    // 总支出金额会同时出现在概览卡片和分类列表中
    expect(screen.getAllByText(/500\.00/).length).toBeGreaterThanOrEqual(1);
  });

  it('无支出时显示空状态提示', () => {
    mockState = { trips: [makeTrip({ expenses: [] })], version: 1 };
    renderPage();

    expect(screen.getByText(/暂无支出记录/)).toBeInTheDocument();
  });

  it('有支出时展示分类饼图（需求 7.2）', () => {
    mockState = {
      trips: [
        makeTrip({
          expenses: [
            makeExpense({ id: 'e1', amount: 500, category: '交通' }),
            makeExpense({ id: 'e2', amount: 300, category: '餐饮' }),
          ],
        }),
      ],
      version: 1,
    };
    renderPage();

    // CategoryPieChart 组件应渲染标题
    expect(screen.getByText('分类支出占比')).toBeInTheDocument();
  });

  it('展示分类列表：金额和占比百分比（需求 7.3）', () => {
    mockState = {
      trips: [
        makeTrip({
          expenses: [
            makeExpense({ id: 'e1', amount: 600, category: '交通' }),
            makeExpense({ id: 'e2', amount: 400, category: '餐饮' }),
          ],
        }),
      ],
      version: 1,
    };
    renderPage();

    // 分类明细标题
    expect(screen.getByText('分类明细')).toBeInTheDocument();

    // 分类名称
    expect(screen.getByText('交通')).toBeInTheDocument();
    expect(screen.getByText('餐饮')).toBeInTheDocument();

    // 金额
    expect(screen.getByText('¥600.00')).toBeInTheDocument();
    expect(screen.getByText('¥400.00')).toBeInTheDocument();

    // 百分比
    expect(screen.getByText('60.0%')).toBeInTheDocument();
    expect(screen.getByText('40.0%')).toBeInTheDocument();
  });

  it('有支出时展示每日趋势图（需求 8.2）', () => {
    mockState = {
      trips: [
        makeTrip({
          expenses: [
            makeExpense({ id: 'e1', amount: 200, date: '2024-03-01' }),
          ],
        }),
      ],
      version: 1,
    };
    renderPage();

    // DailyTrendChart 组件应渲染标题
    expect(screen.getByText('每日花费趋势')).toBeInTheDocument();
  });

  it('零支出分类不出现在列表中（需求 7.4）', () => {
    mockState = {
      trips: [
        makeTrip({
          expenses: [
            makeExpense({ id: 'e1', amount: 500, category: '交通' }),
          ],
        }),
      ],
      version: 1,
    };
    renderPage();

    // 只有交通分类，其他分类不应出现在列表中
    expect(screen.getByText('交通')).toBeInTheDocument();
    expect(screen.queryByText('住宿')).not.toBeInTheDocument();
    expect(screen.queryByText('门票')).not.toBeInTheDocument();
    expect(screen.queryByText('购物')).not.toBeInTheDocument();
  });

  it('提供返回旅行详情的链接', () => {
    mockState = { trips: [makeTrip()], version: 1 };
    renderPage();

    const backLink = screen.getByText('← 返回详情');
    expect(backLink.closest('a')).toHaveAttribute('href', '/trip/trip-1');
  });
});
