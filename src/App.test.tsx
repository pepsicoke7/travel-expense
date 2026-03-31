// ============================================================
// 应用根组件测试 - 路由配置验证
// ============================================================

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import TripListPage from './pages/TripListPage';
import CreateTripPage from './pages/CreateTripPage';
import TripDetailPage from './pages/TripDetailPage';
import TripStatsPage from './pages/TripStatsPage';
import AddExpensePage from './pages/AddExpensePage';
import EditExpensePage from './pages/EditExpensePage';
import { Routes, Route } from 'react-router-dom';

/** 辅助函数：在指定路由下渲染应用 */
function renderWithRouter(initialRoute: string) {
  return render(
    <AppProvider>
      <MemoryRouter initialEntries={[initialRoute]}>
        <Routes>
          <Route path="/" element={<TripListPage />} />
          <Route path="/trip/new" element={<CreateTripPage />} />
          <Route path="/trip/:id" element={<TripDetailPage />} />
          <Route path="/trip/:id/stats" element={<TripStatsPage />} />
          <Route path="/trip/:id/expense/new" element={<AddExpensePage />} />
          <Route path="/trip/:id/expense/:eid/edit" element={<EditExpensePage />} />
        </Routes>
      </MemoryRouter>
    </AppProvider>,
  );
}

describe('App 路由配置', () => {
  it('/ 路由应渲染旅行列表页', () => {
    renderWithRouter('/');
    // TripListPage 应包含"创建旅行"按钮
    expect(screen.getByText('我的旅行')).toBeInTheDocument();
  });

  it('/trip/new 路由应渲染创建旅行页', () => {
    renderWithRouter('/trip/new');
    expect(screen.getByText('创建旅行')).toBeInTheDocument();
  });
});
