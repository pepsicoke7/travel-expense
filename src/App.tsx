// ============================================================
// 旅游记账应用 - 根组件
// 配置路由和全局状态管理
// ============================================================

import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import TripListPage from './pages/TripListPage';
import CreateTripPage from './pages/CreateTripPage';
import TripDetailPage from './pages/TripDetailPage';
import TripStatsPage from './pages/TripStatsPage';
import AddExpensePage from './pages/AddExpensePage';
import EditExpensePage from './pages/EditExpensePage';

/**
 * 应用根组件
 * 使用 AppProvider 提供全局状态，HashRouter 管理路由
 */
function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Routes>
          {/* 首页 - 旅行列表 */}
          <Route path="/" element={<TripListPage />} />
          {/* 创建旅行 */}
          <Route path="/trip/new" element={<CreateTripPage />} />
          {/* 旅行详情 */}
          <Route path="/trip/:id" element={<TripDetailPage />} />
          {/* 旅行统计 */}
          <Route path="/trip/:id/stats" element={<TripStatsPage />} />
          {/* 添加支出 */}
          <Route path="/trip/:id/expense/new" element={<AddExpensePage />} />
          {/* 编辑支出 */}
          <Route path="/trip/:id/expense/:eid/edit" element={<EditExpensePage />} />
        </Routes>
      </HashRouter>
    </AppProvider>
  );
}

export default App;
