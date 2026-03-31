// ============================================================
// CreateTripPage 测试
// 验证旅行创建表单页，提交后跳转到旅行详情
// 验证需求：1.1, 1.2, 1.3, 1.4
// ============================================================

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CreateTripPage from './CreateTripPage';

// 模拟 useAppContext
const mockDispatch = vi.fn();
vi.mock('../context/AppContext', () => ({
  useAppContext: () => ({
    state: { trips: [], version: 1 },
    dispatch: mockDispatch,
  }),
}));

// 模拟 useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

/** 辅助函数：渲染组件 */
function renderPage() {
  return render(
    <MemoryRouter>
      <CreateTripPage />
    </MemoryRouter>,
  );
}

describe('CreateTripPage', () => {
  beforeEach(() => {
    mockDispatch.mockClear();
    mockNavigate.mockClear();
  });

  it('渲染页面标题和返回链接', () => {
    renderPage();

    expect(screen.getByText('创建旅行')).toBeInTheDocument();
    expect(screen.getByText('← 返回')).toBeInTheDocument();
  });

  it('渲染 TripForm 表单', () => {
    renderPage();

    // TripForm 包含旅行名称输入框
    expect(screen.getByLabelText(/旅行名称/)).toBeInTheDocument();
    expect(screen.getByText('保存旅行')).toBeInTheDocument();
  });

  it('提交表单后 dispatch ADD_TRIP 并跳转到详情页', async () => {
    const user = userEvent.setup();
    renderPage();

    // 填写表单
    await user.clear(screen.getByLabelText(/旅行名称/));
    await user.type(screen.getByLabelText(/旅行名称/), '东京之旅');

    // 提交表单
    await user.click(screen.getByText('保存旅行'));

    // 验证 dispatch 被调用，action 类型为 ADD_TRIP
    expect(mockDispatch).toHaveBeenCalledOnce();
    const action = mockDispatch.mock.calls[0][0];
    expect(action.type).toBe('ADD_TRIP');
    expect(action.payload.name).toBe('东京之旅');

    // 验证跳转到旅行详情页
    expect(mockNavigate).toHaveBeenCalledWith(`/trip/${action.payload.id}`);
  });

  it('返回链接指向首页', () => {
    renderPage();

    const backLink = screen.getByText('← 返回');
    expect(backLink).toHaveAttribute('href', '/');
  });
});
