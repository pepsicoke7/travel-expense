// ============================================================
// AddExpensePage 测试
// 验证添加支出表单页，集成超支预警提示
// 验证需求：4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 14.3
// ============================================================

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Trip } from '../types';
import AddExpensePage from './AddExpensePage';

// 测试用旅行数据（无预算）
const baseTripNoBudget: Trip = {
  id: 'trip-1',
  name: '东京之旅',
  destination: '东京',
  startDate: '2024-03-01',
  endDate: '2024-03-07',
  expenses: [],
  createdAt: '2024-02-28T10:00:00Z',
};

// 测试用旅行数据（有预算，当前无支出）
const baseTripWithBudget: Trip = {
  ...baseTripNoBudget,
  budget: 1000,
};

// 测试用旅行数据（有预算，已有支出接近预算）
const tripNearBudget: Trip = {
  ...baseTripWithBudget,
  expenses: [
    {
      id: 'exp-1',
      tripId: 'trip-1',
      amount: 900,
      category: '交通',
      note: '机票',
      date: '2024-03-01',
      createdAt: '2024-03-01T10:00:00Z',
    },
  ],
};

// 模拟 dispatch 和 navigate
const mockDispatch = vi.fn();
const mockNavigate = vi.fn();
let mockTrips: Trip[] = [baseTripNoBudget];

vi.mock('../context/AppContext', () => ({
  useAppContext: () => ({
    state: { trips: mockTrips, version: 1 },
    dispatch: mockDispatch,
  }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

/** 辅助函数：渲染组件（路由匹配 /trip/:id/expense/new） */
function renderPage(tripId = 'trip-1') {
  return render(
    <MemoryRouter initialEntries={[`/trip/${tripId}/expense/new`]}>
      <Routes>
        <Route path="/trip/:id/expense/new" element={<AddExpensePage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('AddExpensePage', () => {
  beforeEach(() => {
    mockDispatch.mockClear();
    mockNavigate.mockClear();
    mockTrips = [baseTripNoBudget];
  });

  it('渲染页面标题和返回链接', () => {
    renderPage();

    expect(screen.getByRole('heading', { name: '添加支出' })).toBeInTheDocument();
    expect(screen.getByText('← 返回')).toBeInTheDocument();
  });

  it('返回链接指向旅行详情页', () => {
    renderPage();

    const backLink = screen.getByText('← 返回');
    expect(backLink).toHaveAttribute('href', '/trip/trip-1');
  });

  it('渲染 ExpenseForm 表单', () => {
    renderPage();

    expect(screen.getByLabelText(/金额/)).toBeInTheDocument();
    expect(screen.getByLabelText(/分类/)).toBeInTheDocument();
    expect(screen.getByText('添加支出', { selector: 'button' })).toBeInTheDocument();
  });

  it('旅行不存在时显示提示', () => {
    mockTrips = [];
    renderPage('non-existent');

    expect(screen.getByText('旅行不存在或已被删除')).toBeInTheDocument();
  });

  it('提交表单后 dispatch ADD_EXPENSE 并跳转回详情页', async () => {
    const user = userEvent.setup();
    renderPage();

    // 填写金额
    await user.type(screen.getByLabelText(/金额/), '100');

    // 提交表单
    await user.click(screen.getByText('添加支出', { selector: 'button' }));

    // 验证 dispatch 被调用
    expect(mockDispatch).toHaveBeenCalledOnce();
    const action = mockDispatch.mock.calls[0][0];
    expect(action.type).toBe('ADD_EXPENSE');
    expect(action.payload.tripId).toBe('trip-1');
    expect(action.payload.expense.amount).toBe(100);

    // 验证跳转回旅行详情页
    expect(mockNavigate).toHaveBeenCalledWith('/trip/trip-1');
  });

  it('有预算且将超支时显示超支预警（需求 14.3）', async () => {
    mockTrips = [tripNearBudget];
    const user = userEvent.setup();
    renderPage();

    // 填写金额（900 + 200 > 1000，将超支）
    await user.type(screen.getByLabelText(/金额/), '200');

    // 提交表单
    await user.click(screen.getByText('添加支出', { selector: 'button' }));

    // 应显示超支预警，不应直接提交
    expect(mockDispatch).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('确认添加')).toBeInTheDocument();
    expect(screen.getByText('取消')).toBeInTheDocument();
  });

  it('超支预警确认后继续提交', async () => {
    mockTrips = [tripNearBudget];
    const user = userEvent.setup();
    renderPage();

    // 填写金额并提交触发预警
    await user.type(screen.getByLabelText(/金额/), '200');
    await user.click(screen.getByText('添加支出', { selector: 'button' }));

    // 确认添加
    await user.click(screen.getByText('确认添加'));

    // 验证 dispatch 被调用
    expect(mockDispatch).toHaveBeenCalledOnce();
    expect(mockNavigate).toHaveBeenCalledWith('/trip/trip-1');
  });

  it('超支预警取消后不提交', async () => {
    mockTrips = [tripNearBudget];
    const user = userEvent.setup();
    renderPage();

    // 填写金额并提交触发预警
    await user.type(screen.getByLabelText(/金额/), '200');
    await user.click(screen.getByText('添加支出', { selector: 'button' }));

    // 取消
    await user.click(screen.getByText('取消'));

    // 不应 dispatch
    expect(mockDispatch).not.toHaveBeenCalled();
    // 预警应消失
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
