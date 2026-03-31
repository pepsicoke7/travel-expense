// ============================================================
// 分类支出饼图组件 - 展示各分类支出占比
// 使用 Recharts PieChart 实现，支持响应式布局
// ============================================================

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { PieLabelRenderProps } from 'recharts';
import type { CategorySummary } from '../types';
import styles from './CategoryPieChart.module.css';

/** 各分类对应的颜色 */
const CATEGORY_COLORS: Record<string, string> = {
  交通: '#4e79a7',
  住宿: '#f28e2b',
  餐饮: '#e15759',
  门票: '#76b7b2',
  购物: '#59a14f',
  其他: '#af7aa1',
};

/** 默认颜色（未匹配到分类时使用） */
const DEFAULT_COLOR = '#bab0ac';

/** 组件属性 */
interface CategoryPieChartProps {
  /** 分类汇总数据 */
  data: CategorySummary[];
}

/**
 * 自定义标签渲染：显示分类名称和占比百分比
 */
function renderLabel(props: PieLabelRenderProps) {
  const entry = props as PieLabelRenderProps & { category?: string; percentage?: number };
  const category = entry.category ?? String(entry.name ?? '');
  const percentage = entry.percentage ?? (typeof entry.percent === 'number' ? entry.percent * 100 : 0);
  return `${category} ${percentage.toFixed(1)}%`;
}

export default function CategoryPieChart({ data }: CategoryPieChartProps) {
  // 无数据时显示提示
  if (data.length === 0) {
    return (
      <div className={styles.empty} role="status">
        暂无分类支出数据
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>分类支出占比</h3>
      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              dataKey="totalAmount"
              nameKey="category"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={renderLabel}
            >
              {data.map((entry) => (
                <Cell
                  key={entry.category}
                  fill={CATEGORY_COLORS[entry.category] ?? DEFAULT_COLOR}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: unknown) => [`¥${Number(value).toFixed(2)}`, '金额']}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
