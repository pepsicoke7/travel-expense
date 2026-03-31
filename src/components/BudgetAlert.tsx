// ============================================================
// 预算警告提示组件 - 根据预算提醒类型显示不同样式的警告
// warning_80：黄色背景，提示已使用 80% 预算
// will_exceed：橙色背景，提示新增支出后将超支
// exceeded：红色背景，提示已超出预算并展示超出金额
// ============================================================

import type { BudgetAlert as BudgetAlertType } from '../types';
import styles from './BudgetAlert.module.css';

/** 组件属性 */
interface BudgetAlertProps {
  /** 预算提醒数据 */
  alert: BudgetAlertType;
}

/** 各提醒类型对应的图标 */
const ALERT_ICONS: Record<BudgetAlertType['type'], string> = {
  warning_80: '⚠️',
  will_exceed: '🔶',
  exceeded: '🚫',
};

/**
 * 根据提醒类型返回对应的样式类名
 */
function getAlertClass(type: BudgetAlertType['type']): string {
  switch (type) {
    case 'warning_80':
      return styles.warning;
    case 'will_exceed':
      return styles.willExceed;
    case 'exceeded':
      return styles.exceeded;
  }
}

export default function BudgetAlert({ alert }: BudgetAlertProps) {
  const { type, message, overAmount } = alert;

  return (
    <div className={`${styles.alert} ${getAlertClass(type)}`} role="alert">
      {/* 图标 */}
      <span className={styles.icon} aria-hidden="true">
        {ALERT_ICONS[type]}
      </span>

      {/* 内容 */}
      <div className={styles.content}>
        <span className={styles.message}>{message}</span>
        {/* 超出金额（仅在有 overAmount 时显示） */}
        {overAmount !== undefined && (
          <span className={styles.overAmount}>超出金额：¥{overAmount.toFixed(2)}</span>
        )}
      </div>
    </div>
  );
}
