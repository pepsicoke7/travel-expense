// ============================================================
// EditExpensePage 测试
// 验证编辑支出表单页，预填充当前数据
// 验证需求：5.1, 5.2, 5.3
// ============================================================

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Trip } from '../types';
import EditExpensePage from './EditExpensePage';

// 测试用旅行数据
const baseTrip: Trip = {
  id: 'trip-1',
  name: '东京之旅',
  destination: '东京',
  startDate: '2024-03-01',
  endDate: '2024-03-07',
  expenses: [
    {
      id: 'exp-1',
      tripId: 'trip-1',
      amount: 350,
      category: '交通',
      note: '机票',
      date: '2024-03-01',
      createdAt: '2024-03-01T10:00:00Z',
    },
  ],
  createdAt: '2024-02-28T10:00:00Z',
};

// 模拟 dispatch 和 navigate
const mockDispatch = vi.fn();
const mockNavigate = vi.fn();
let mockTrips: Trip[] = [baseTrip];

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

/** 辅助函数：渲染组件（路由匹配 /trip/:id/expense/:eid/edit） */
function renderPage(tripId = 'trip-1', eid = 'exp-1') {
  return render(
    <MemoryRouter initialEntries={[`/trip/${tripId}/expense/${eid}/edit`]}>
      <Routes>
        <Route path="/trip/:id/expense/:eid/edit" element={<EditExpensePage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('EditExpensePage', () => {
  beforeEach(() => {
    mockDispatch.mockClear();
    mockNavigate.mockClear();
    mockTrips = [baseTrip];
  });

  it('渲染页面标题和返回链接', () => {
    renderPage();

    expect(screen.getByText('编辑支出')).toBeInTheDocument();
    expect(screen.getByText('← 返回')).toBeInTheDocument();
  });

  it('返回链接指向旅行详情页', () => {
    renderPage();

    const backLink = screen.getByText('← 返回');
    expect(backLink).toHaveAttribute('href', '/trip/trip-1');
  });

  it('预填充当前支出数据（需求 5.1）', () => {
    renderPage();

    // 验证金额预填充
    expect(screen.getByLabelText(/金额/)).toHaveValue(350);
    // 验证分类预填充
    expect(screen.getByLabelText(/分类/)).toHaveValue('交通');
    // 验证备注预填充
    expect(screen.getByLabelText(/备注/)).toHaveValue('机票');
    // 验证日期预填充
    expect(screen.getByLabelText(/日期/)).toHaveValue('2024-03-01');
    // 编辑模式按钮文本为"保存修改"
    expect(screen.getByText('保存修改')).toBeInTheDocument();
  });

  it('提交表单后 dispatch UPDATE_EXPENSE 并跳转回详情页（需求 5.2）', async () => {
    const user = userEvent.setup();
    renderPage();

    // 修改金额
    const amountInput = screen.getByLabelText(/金额/);
    await user.clear(amountInput);
    await user.type(amountInput, '500');

    // 提交表单
    await user.click(screen.getByText('保存修改'));

    // 验证 dispatch 被调用
    expect(mockDispatch).toHaveBeenCalledOnce();
    const action = mockDispatch.mock.calls[0][0];
    expect(action.type).toBe('UPDATE_EXPENSE');
    expect(action.payload.tripId).toBe('trip-1');
    expect(action.payload.expense.amount).toBe(500);
    expect(action.payload.expense.id).toBe('exp-1');

    // 验证跳转回旅行详情页
    expect(mockNavigate).toHaveBeenCalledWith('/trip/trip-1');
  });

  it('旅行不存在时显示提示', () => {
    mockTrips = [];
    renderPage('non-existent');

    expect(screen.getByText('旅行不存在或已被删除')).toBeInTheDocument();
  });

  it('支出不存在时显示提示', () => {
    renderPage('trip-1', 'non-existent');

    expect(screen.getByText('支出记录不存在或已被删除')).toBeInTheDocument();
  });
});
