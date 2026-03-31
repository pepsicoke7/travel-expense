// ============================================================
// 旅行列表页 - 展示所有旅行、总览统计、排序切换、空状态处理
// 路由：/
// 验证需求：2.1, 2.2, 2.3, 2.4, 9.1, 9.2, 9.3
// ============================================================

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import { useAppContext } from '../context/AppContext';
import type { SortOrder, TripSortField } from '../types';
import { getOverallStats } from '../utils/statisticsEngine';
import { calculateTripTotal, getTrips } from '../utils/tripManager';
import styles from './TripListPage.module.css';

export default function TripListPage() {
  const { state } = useAppContext();
  const navigate = useNavigate();

  // 排序状态：默认按起始日期降序（需求 2.2）
  const [sortField, setSortField] = useState<TripSortField>('startDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // 获取排序后的旅行列表
  const sortedTrips = getTrips(state.trips, sortField, sortOrder);

  // 获取总览统计（需求 9.1, 9.2, 9.3）
  const overallStats = getOverallStats(state.trips);

  /** 切换排序方向 */
  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  // 无旅行时显示空状态（需求 2.4）
  if (state.trips.length === 0) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>我的旅行</h1>
        </div>
        <EmptyState
          message="还没有旅行记录，开始创建你的第一次旅行吧！"
          actionLabel="创建旅行"
          onAction={() => navigate('/trip/new')}
        />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* 页面头部 */}
      <div className={styles.header}>
        <h1 className={styles.title}>我的旅行</h1>
        <Link to="/trip/new" className={styles.createBtn}>
          + 创建旅行
        </Link>
      </div>

      {/* 总览统计（需求 9.1, 9.2） */}
      <div className={styles.statsBar}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>旅行总数</div>
          <div className={styles.statValue}>{overallStats.totalTrips}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>累计总支出</div>
          <div className={styles.statValue}>¥{overallStats.totalExpense.toFixed(2)}</div>
        </div>
      </div>

      {/* 排序控制（需求 2.3） */}
      <div className={styles.sortBar}>
        <span>排序：</span>
        <select
          className={styles.sortSelect}
          value={sortField}
          onChange={(e) => setSortField(e.target.value as TripSortField)}
        >
          <option value="startDate">起始日期</option>
          <option value="name">名称</option>
          <option value="totalExpense">总支出</option>
        </select>
        <button className={styles.sortBtn} onClick={toggleSortOrder} type="button">
          {sortOrder === 'desc' ? '↓ 降序' : '↑ 升序'}
        </button>
      </div>

      {/* 旅行列表（需求 2.1） */}
      <div className={styles.tripList}>
        {sortedTrips.map((trip) => (
          <Link key={trip.id} to={`/trip/${trip.id}`} className={styles.tripCard}>
            <div className={styles.tripInfo}>
              <span className={styles.tripName}>{trip.name}</span>
              <span className={styles.tripMeta}>
                {trip.destination && `${trip.destination} · `}
                {trip.startDate} ~ {trip.endDate}
              </span>
            </div>
            <span className={styles.tripAmount}>
              ¥{calculateTripTotal(trip.expenses).toFixed(2)}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
