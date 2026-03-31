// ============================================================
// 旅行统计页 - 展示分类饼图、分类列表、每日趋势图
// 路由：/trip/:id/stats
// 验证需求：7.1, 7.2, 7.3, 7.4, 8.1, 8.2, 8.3, 8.4
// ============================================================

import { Link, useNavigate, useParams } from 'react-router-dom';
import CategoryPieChart from '../components/CategoryPieChart';
import DailyTrendChart from '../components/DailyTrendChart';
import EmptyState from '../components/EmptyState';
import { useAppContext } from '../context/AppContext';
import { getCategoryBreakdown, getDailyTrend } from '../utils/statisticsEngine';
import { calculateTripTotal } from '../utils/tripManager';
import styles from './TripStatsPage.module.css';

export default function TripStatsPage() {
  const { id } = useParams<{ id: string }>();
  const { state } = useAppContext();
  const navigate = useNavigate();

  // 查找旅行
  const trip = state.trips.find((t) => t.id === id) ?? null;

  // 旅行不存在时显示提示并引导返回
  if (!trip) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <Link to="/" className={styles.backLink}>← 返回</Link>
          <h1 className={styles.title}>旅行统计</h1>
        </div>
        <EmptyState
          message="旅行不存在或已被删除"
          actionLabel="返回旅行列表"
          onAction={() => navigate('/')}
        />
      </div>
    );
  }

  // 计算总支出
  const totalExpense = calculateTripTotal(trip.expenses);

  // 获取分类汇总数据（需求 7.1）
  const categoryBreakdown = getCategoryBreakdown(trip.expenses);

  // 获取每日趋势数据（需求 8.1）
  const dailyTrend = getDailyTrend(trip.expenses, trip.startDate, trip.endDate);

  // 判断是否有支出记录
  const hasExpenses = trip.expenses.length > 0;

  return (
    <div className={styles.page}>
      {/* 页面头部 */}
      <div className={styles.header}>
        <Link to={`/trip/${id}`} className={styles.backLink}>← 返回详情</Link>
        <h1 className={styles.title}>{trip.name} - 统计</h1>
      </div>

      {/* 总支出概览 */}
      <div className={styles.summaryCard}>
        <span className={styles.summaryLabel}>总支出</span>
        <span className={styles.summaryAmount}>¥{totalExpense.toFixed(2)}</span>
      </div>

      {/* 无支出时显示空状态提示 */}
      {!hasExpenses ? (
        <EmptyState
          message="暂无支出记录，无法生成统计"
          actionLabel="添加支出"
          onAction={() => navigate(`/trip/${id}/expense/new`)}
        />
      ) : (
        <>
          {/* 分类饼图（需求 7.2） */}
          <section className={styles.section}>
            <CategoryPieChart data={categoryBreakdown} />
          </section>

          {/* 分类列表（需求 7.3） */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>分类明细</h2>
            <div className={styles.categoryList}>
              {categoryBreakdown.map((item) => (
                <div key={item.category} className={styles.categoryItem}>
                  <span className={styles.categoryName}>{item.category}</span>
                  <span className={styles.categoryAmount}>¥{item.totalAmount.toFixed(2)}</span>
                  <span className={styles.categoryPercent}>{item.percentage.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </section>

          {/* 每日花费趋势图（需求 8.2） */}
          <section className={styles.section}>
            <DailyTrendChart data={dailyTrend} />
          </section>
        </>
      )}
    </div>
  );
}
