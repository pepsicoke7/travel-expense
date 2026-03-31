// ============================================================
// 确认对话框组件 - 用于删除等危险操作的二次确认
// 当 isOpen 为 true 时渲染遮罩层和对话框
// 确认按钮为红色（危险操作），取消按钮为灰色
// ============================================================

import styles from './ConfirmDialog.module.css';

/** 组件属性 */
interface ConfirmDialogProps {
  /** 是否显示对话框 */
  isOpen: boolean;
  /** 对话框标题 */
  title: string;
  /** 对话框消息内容 */
  message: string;
  /** 确认回调 */
  onConfirm: () => void;
  /** 取消回调 */
  onCancel: () => void;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  // 未打开时不渲染任何内容
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title">
      <div className={styles.dialog}>
        {/* 标题 */}
        <h2 id="confirm-dialog-title" className={styles.title}>{title}</h2>
        {/* 消息 */}
        <p className={styles.message}>{message}</p>
        {/* 操作按钮 */}
        <div className={styles.actions}>
          <button className={`${styles.btn} ${styles.cancelBtn}`} onClick={onCancel} type="button">
            取消
          </button>
          <button className={`${styles.btn} ${styles.confirmBtn}`} onClick={onConfirm} type="button">
            确认
          </button>
        </div>
      </div>
    </div>
  );
}
