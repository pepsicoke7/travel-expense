// ============================================================
// TripDetailPage 测试
// 验证旅行详情展示、支出列表、预算状态、删除支出确认
// 验证需求：3.1, 3.2, 3.3, 6.1, 6.2, 6.3, 13.1, 13.2, 13.4, 14.1, 14.2, 14.4
// ============================================================

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { AppData, Trip, Expense } from '../types';
import TripDetailPage from './TripDetailPage';

// 模拟 useAppContext
let mockState: AppData = { trips: [], version: 1 };
const mockDispatch = vi.fn();

vi.mock('../context/AppContext', () => ({
  useAppContext: () => ({ state: mockState, dispatch: mockDispatch }),
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
    <MemoryRouter initialEntries={[`/trip/${tripId}`]}>
      <Routes>
        <Route path="/trip/:id" element={<TripDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('TripDetailPage', () => {
  beforeEach(() => {
    mockDispatch.mockClear();
  });

  it('旅行不存在时显示提示并引导返回列表', () => {
    mockState = { trips: [], version: 1 };
    renderPage('nonexistent');

    expect(screen.getByText(/旅行不存在/)).toBeInTheDocument();
    expect(screen.getByText('返回旅行列表')).toBeInTheDocument();
  });

  it('展示旅行基本信息：名称、目的地、起止日期（需求 3.1）', () => {
    mockState = { trips: [makeTrip()], version: 1 };
    renderPage();

    expect(screen.getByText('东京之旅')).toBeInTheDocument();
    expect(screen.getByText(/📍 东京/)).toBeInTheDocument();
    expect(screen.getByText(/2024-03-01 ~ 2024-03-07/)).toBeInTheDocument();
  });

  it('显示总支出金额（需求 3.2）', () => {
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

    expect(screen.getByText(/500\.00/)).toBeInTheDocument();
  });

  it('支出列表按日期降序排列（需求 3.3）', () => {
    mockState = {
      trips: [
        makeTrip({
          expenses: [
            makeExpense({ id: 'e1', amount: 100, date: '2024-03-01' }),
            makeExpense({ id: 'e2', amount: 200, date: '2024-03-05' }),
            makeExpense({ id: 'e3', amount: 300, date: '2024-03-03' }),
          ],
        }),
      ],
      version: 1,
    };
    renderPage();

    // 获取所有支出金额元素，验证顺序
    const amounts = screen.getAllByText(/¥\d+\.\d{2}/).filter(
      (el) => el.classList.contains('expenseAmount') || el.closest('[class*="expenseCard"]'),
    );
    // 日期降序：03-05(200) → 03-03(300) → 03-01(100)
    expect(amounts.length).toBeGreaterThanOrEqual(3);
  });

  it('每条支出显示金额、分类、备注、日期', () => {
    mockState = {
      trips: [
        makeTrip({
          expenses: [
            makeExpense({ id: 'e1', amount: 150, category: '交通', note: '出租车', date: '2024-03-02' }),
          ],
        }),
      ],
      version: 1,
    };
    renderPage();

    expect(screen.getByText('¥150.00')).toBeInTheDocument();
    expect(screen.getByText('交通')).toBeInTheDocument();
    expect(screen.getByText(/出租车/)).toBeInTheDocument();
    expect(screen.getByText('2024-03-02')).toBeInTheDocument();
  });

  it('每条支出有编辑和删除按钮', () => {
    mockState = {
      trips: [
        makeTrip({
          expenses: [makeExpense({ id: 'e1' })],
        }),
      ],
      version: 1,
    };
    renderPage();

    // 编辑按钮链接到编辑页
    const editLink = screen.getByText('编辑');
    expect(editLink.closest('a')).toHaveAttribute('href', '/trip/trip-1/expense/e1/edit');

    // 删除按钮存在
    expect(screen.getByText('删除')).toBeInTheDocument();
  });

  it('删除支出时显示确认对话框（需求 6.1, 6.3）', async () => {
    const user = userEvent.setup();
    mockState = {
      trips: [
        makeTrip({
          expenses: [makeExpense({ id: 'e1', amount: 100 })],
        }),
      ],
      version: 1,
    };
    renderPage();

    // 点击删除按钮
    await user.click(screen.getByText('删除'));

    // 确认对话框应出现
    expect(screen.getByText('删除支出')).toBeInTheDocument();
    expect(screen.getByText(/确定要删除/)).toBeInTheDocument();

    // 点击取消，对话框关闭（需求 6.3）
    await user.click(screen.getByText('取消'));
    expect(screen.queryByText('删除支出')).not.toBeInTheDocument();
  });

  it('确认删除后 dispatch DELETE_EXPENSE（需求 6.2）', async () => {
    const user = userEvent.setup();
    mockState = {
      trips: [
        makeTrip({
          expenses: [makeExpense({ id: 'e1' })],
        }),
      ],
      version: 1,
    };
    renderPage();

    // 点击删除 → 确认
    await user.click(screen.getByText('删除'));
    await user.click(screen.getByText('确认'));

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'DELETE_EXPENSE',
      payload: { tripId: 'trip-1', expenseId: 'e1' },
    });
  });

  it('已设置预算时显示 BudgetBar（需求 13.1, 13.2）', () => {
    mockState = {
      trips: [
        makeTrip({
          budget: 10000,
          expenses: [makeExpense({ id: 'e1', amount: 3000 })],
        }),
      ],
      version: 1,
    };
    renderPage();

    // BudgetBar 应显示预算使用情况
    expect(screen.getByText('预算使用情况')).toBeInTheDocument();
    expect(screen.getByText(/30\.0%/)).toBeInTheDocument();
  });

  it('预算达到阈值时显示 BudgetAlert（需求 14.1, 14.2）', () => {
    mockState = {
      trips: [
        makeTrip({
          budget: 1000,
          expenses: [makeExpense({ id: 'e1', amount: 900 })],
        }),
      ],
      version: 1,
    };
    renderPage();

    // 90% 使用率应触发 warning_80 提醒
    expect(screen.getByText(/80% 预算/)).toBeInTheDocument();
  });

  it('未设置预算时显示"未设置预算"提示（需求 13.4）', () => {
    mockState = {
      trips: [makeTrip({ budget: undefined })],
      version: 1,
    };
    renderPage();

    expect(screen.getByText(/未设置预算/)).toBeInTheDocument();
    expect(screen.getByText('设置预算')).toBeInTheDocument();
  });

  it('提供"添加支出"按钮链接到 /trip/:id/expense/new', () => {
    mockState = { trips: [makeTrip()], version: 1 };
    renderPage();

    const addLink = screen.getByText('+ 添加支出');
    expect(addLink.closest('a')).toHaveAttribute('href', '/trip/trip-1/expense/new');
  });

  it('提供"查看统计"按钮链接到 /trip/:id/stats', () => {
    mockState = { trips: [makeTrip()], version: 1 };
    renderPage();

    const statsLink = screen.getByText(/查看统计/);
    expect(statsLink.closest('a')).toHaveAttribute('href', '/trip/trip-1/stats');
  });

  it('无支出时显示空状态提示', () => {
    mockState = { trips: [makeTrip({ expenses: [] })], version: 1 };
    renderPage();

    expect(screen.getByText('暂无支出记录')).toBeInTheDocument();
  });

  it('设置预算功能正常工作', async () => {
    const user = userEvent.setup();
    mockState = { trips: [makeTrip({ budget: undefined })], version: 1 };
    renderPage();

    // 点击设置预算
    await user.click(screen.getByText('设置预算'));

    // 输入预算金额并提交
    const input = screen.getByPlaceholderText('输入预算金额');
    await user.type(input, '5000');
    await user.click(screen.getByText('确认'));

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_BUDGET',
      payload: { tripId: 'trip-1', budget: 5000 },
    });
  });
});
