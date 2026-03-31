// ============================================================
// 每日花费趋势图组件 - 展示每日支出变化趋势
// 使用 Recharts BarChart 实现，支持响应式布局
// ============================================================

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import type { DailyExpense } from '../types';
import styles from './DailyTrendChart.module.css';

/** 组件属性 */
interface DailyTrendChartProps {
  /** 每日支出数据 */
  data: DailyExpense[];
}

/**
 * 格式化日期标签：将 YYYY-MM-DD 转为 MM/DD 短格式
 */
function formatDate(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[1]}/${parts[2]}`;
  }
  return dateStr;
}

export default function DailyTrendChart({ data }: DailyTrendChartProps) {
  // 无数据时显示提示
  if (data.length === 0) {
    return (
      <div className={styles.empty} role="status">
        暂无每日支出数据
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>每日花费趋势</h3>
      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              fontSize={12}
            />
            <YAxis
              fontSize={12}
              tickFormatter={(v: number) => `¥${v}`}
            />
            <Tooltip
              formatter={(value: unknown) => [`¥${Number(value).toFixed(2)}`, '支出']}
              labelFormatter={(label: unknown) => `日期: ${String(label)}`}
            />
            <Bar
              dataKey="totalAmount"
              fill="#4e79a7"
              radius={[4, 4, 0, 0]}
              name="支出金额"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
