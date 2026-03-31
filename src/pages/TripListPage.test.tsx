// ============================================================
// TripListPage 测试
// 验证旅行列表展示、总览统计、排序切换、空状态处理
// 验证需求：2.1, 2.2, 2.3, 2.4, 9.1, 9.2, 9.3
// ============================================================

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import type { AppData, Trip } from '../types';
import TripListPage from './TripListPage';

// 模拟 useAppContext，通过 mockState 控制返回的状态
let mockState: AppData = { trips: [], version: 1 };
const mockDispatch = vi.fn();

vi.mock('../context/AppContext', () => ({
  useAppContext: () => ({ state: mockState, dispatch: mockDispatch }),
}));

/** 辅助函数：创建测试用旅行数据 */
function makeTripData(overrides: Partial<Trip> & { id: string; name: string }): Trip {
  return {
    destination: '',
    startDate: '2024-01-01',
    endDate: '2024-01-07',
    expenses: [],
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

/** 辅助函数：渲染组件 */
function renderPage() {
  return render(
    <MemoryRouter>
      <TripListPage />
    </MemoryRouter>,
  );
}

describe('TripListPage', () => {
  it('无旅行时显示空状态提示（需求 2.4）', () => {
    mockState = { trips: [], version: 1 };
    renderPage();

    // 应显示空状态消息和创建旅行按钮
    expect(screen.getByText(/还没有旅行记录/)).toBeInTheDocument();
    expect(screen.getByText('创建旅行')).toBeInTheDocument();
  });

  it('展示旅行列表，包含名称、目的地、日期和总支出（需求 2.1）', () => {
    mockState = {
      trips: [
        makeTripData({
          id: '1',
          name: '东京之旅',
          destination: '东京',
          startDate: '2024-03-01',
          endDate: '2024-03-07',
          expenses: [
            { id: 'e1', tripId: '1', amount: 500, category: '交通', note: '', date: '2024-03-01', createdAt: '' },
          ],
        }),
      ],
      version: 1,
    };
    renderPage();

    expect(screen.getByText('东京之旅')).toBeInTheDocument();
    expect(screen.getByText(/东京 ·/)).toBeInTheDocument();
    expect(screen.getByText(/2024-03-01/)).toBeInTheDocument();
    // 500.00 同时出现在统计栏和旅行卡片中
    expect(screen.getAllByText(/500\.00/).length).toBeGreaterThanOrEqual(1);
  });

  it('显示总览统计：旅行总数和累计总支出（需求 9.1, 9.2）', () => {
    mockState = {
      trips: [
        makeTripData({
          id: '1',
          name: '旅行A',
          expenses: [
            { id: 'e1', tripId: '1', amount: 100, category: '餐饮', note: '', date: '2024-01-01', createdAt: '' },
          ],
        }),
        makeTripData({
          id: '2',
          name: '旅行B',
          expenses: [
            { id: 'e2', tripId: '2', amount: 200, category: '住宿', note: '', date: '2024-01-01', createdAt: '' },
          ],
        }),
      ],
      version: 1,
    };
    renderPage();

    // 旅行总数
    expect(screen.getByText('2')).toBeInTheDocument();
    // 累计总支出
    expect(screen.getByText('¥300.00')).toBeInTheDocument();
  });

  it('切换排序字段和方向（需求 2.3）', async () => {
    const user = userEvent.setup();
    mockState = {
      trips: [
        makeTripData({ id: '1', name: 'B旅行', startDate: '2024-01-01' }),
        makeTripData({ id: '2', name: 'A旅行', startDate: '2024-06-01' }),
      ],
      version: 1,
    };
    renderPage();

    // 切换到按名称排序
    const sortSelect = screen.getByRole('combobox');
    await user.selectOptions(sortSelect, '名称');

    // 切换排序方向
    const sortBtn = screen.getByText(/降序|升序/);
    await user.click(sortBtn);

    // 验证排序按钮文本已切换
    expect(screen.getByText(/升序/)).toBeInTheDocument();
  });

  it('点击旅行卡片链接到旅行详情页', () => {
    mockState = {
      trips: [makeTripData({ id: 'trip-123', name: '测试旅行' })],
      version: 1,
    };
    renderPage();

    const link = screen.getByText('测试旅行').closest('a');
    expect(link).toHaveAttribute('href', '/trip/trip-123');
  });

  it('创建旅行按钮链接到 /trip/new', () => {
    mockState = {
      trips: [makeTripData({ id: '1', name: '旅行' })],
      version: 1,
    };
    renderPage();

    const createLink = screen.getByText('+ 创建旅行');
    expect(createLink).toHaveAttribute('href', '/trip/new');
  });
});
