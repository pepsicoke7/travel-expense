// ============================================================
// 预算进度条组件 - 展示预算使用情况
// 根据使用百分比显示不同颜色：
//   normal（<80%）= 绿色, warning（80%-100%）= 黄色, exceeded（>100%）= 红色
// ============================================================

import type { BudgetStatus } from '../types';
import styles from './BudgetBar.module.css';

/** 组件属性 */
interface BudgetBarProps {
  /** 预算状态数据 */
  status: BudgetStatus;
}

/**
 * 根据状态级别返回对应的进度条颜色样式类名
 */
function getTrackClass(level: BudgetStatus['level']): string {
  switch (level) {
    case 'warning':
      return styles.trackWarning;
    case 'exceeded':
      return styles.trackExceeded;
    default:
      return styles.trackNormal;
  }
}

export default function BudgetBar({ status }: BudgetBarProps) {
  const { budgetAmount, spentAmount, remainingAmount, usagePercent, level } = status;

  // 进度条宽度限制在 0-100% 之间（超支时显示满条）
  const barWidth = Math.min(Math.max(usagePercent, 0), 100);

  return (
    <div className={styles.container} role="region" aria-label="预算使用情况">
      {/* 标题行 */}
      <div className={styles.header}>
        <span>预算使用情况</span>
        <span>{usagePercent.toFixed(1)}%</span>
      </div>

      {/* 金额展示 */}
      <div className={styles.amounts}>
        <span className={styles.spent}>¥{spentAmount.toFixed(2)}</span>
        <span className={styles.budget}>/ ¥{budgetAmount.toFixed(2)}</span>
      </div>

      {/* 进度条 */}
      <div
        className={styles.trackWrapper}
        role="progressbar"
        aria-valuenow={usagePercent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`预算已使用 ${usagePercent.toFixed(1)}%`}
      >
        <div
          className={`${styles.track} ${getTrackClass(level)}`}
          style={{ width: `${barWidth}%` }}
        />
      </div>

      {/* 底部信息 */}
      <div className={styles.footer}>
        <span
          className={`${styles.remaining} ${level === 'exceeded' ? styles.remainingExceeded : ''}`}
        >
          {remainingAmount >= 0
            ? `剩余 ¥${remainingAmount.toFixed(2)}`
            : `超出 ¥${Math.abs(remainingAmount).toFixed(2)}`}
        </span>
      </div>
    </div>
  );
}
