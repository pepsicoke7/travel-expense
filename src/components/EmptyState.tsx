// ============================================================
// 空状态提示组件 - 当列表为空时显示提示信息
// 支持可选的操作按钮（如"创建第一次旅行"）
// ============================================================

import styles from './EmptyState.module.css';

/** 组件属性 */
interface EmptyStateProps {
  /** 提示消息 */
  message: string;
  /** 可选的操作按钮文本 */
  actionLabel?: string;
  /** 可选的操作按钮回调 */
  onAction?: () => void;
}

export default function EmptyState({ message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className={styles.container}>
      {/* 空状态图标 */}
      <span className={styles.icon} aria-hidden="true">📭</span>
      {/* 提示消息 */}
      <p className={styles.message}>{message}</p>
      {/* 可选操作按钮 */}
      {actionLabel && onAction && (
        <button className={styles.actionBtn} onClick={onAction} type="button">
          {actionLabel}
        </button>
      )}
    </div>
  );
}
