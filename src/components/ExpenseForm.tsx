// ============================================================
// 支出表单组件 - 添加/编辑支出时使用
// 包含金额（必填）、分类选择（下拉框）、备注、日期字段
// 集成 validateExpenseInput 的验证逻辑
// ============================================================

import { useState } from 'react';
import type { CreateExpenseInput, ExpenseCategory } from '../types';
import { validateExpenseInput } from '../utils/expenseManager';
import styles from './ExpenseForm.module.css';

/** 支出分类选项列表 */
const CATEGORY_OPTIONS: ExpenseCategory[] = [
  '交通',
  '住宿',
  '餐饮',
  '门票',
  '购物',
  '其他',
];

/** 组件属性 */
interface ExpenseFormProps {
  /** 提交回调，传递验证通过的支出输入 */
  onSubmit: (input: CreateExpenseInput) => void;
  /** 初始值（编辑模式时预填充数据） */
  initialValues?: Partial<CreateExpenseInput>;
}

/** 获取今天的日期字符串（YYYY-MM-DD） */
function getTodayStr(): string {
  return new Date().toISOString().split('T')[0];
}

export default function ExpenseForm({ onSubmit, initialValues }: ExpenseFormProps) {
  // 受控表单状态
  // 金额使用字符串以便处理用户输入（空值、小数等）
  const [amountStr, setAmountStr] = useState<string>(
    initialValues?.amount !== undefined ? String(initialValues.amount) : '',
  );
  const [category, setCategory] = useState<ExpenseCategory>(
    initialValues?.category ?? '其他',
  );
  const [note, setNote] = useState(initialValues?.note ?? '');
  const [date, setDate] = useState(initialValues?.date ?? getTodayStr());

  // 各字段的验证错误信息
  const [errors, setErrors] = useState<Record<string, string>>({});

  /** 处理表单提交 */
  const handleSubmit = (e: React.FormEvent) => {
    // 阻止默认表单行为
    e.preventDefault();

    // 将字符串金额转为数字（空字符串转为 NaN，触发验证）
    const amount = amountStr.trim() ? Number(amountStr) : NaN;

    // 构建输入对象
    const input: CreateExpenseInput = {
      amount,
      category,
      note,
      date,
    };

    // 调用 validateExpenseInput 进行业务验证
    const validationErrors = validateExpenseInput(input);

    if (validationErrors.length > 0) {
      // 将验证错误转为 Record 格式以便按字段显示
      const errorMap: Record<string, string> = {};
      for (const err of validationErrors) {
        errorMap[err.field] = err.message;
      }
      setErrors(errorMap);
      return;
    }

    // 验证通过，清除错误并回调
    setErrors({});
    onSubmit(input);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {/* 金额（必填） */}
      <div className={styles.formGroup}>
        <label className={`${styles.label} ${styles.required}`} htmlFor="expense-amount">
          金额
        </label>
        <input
          id="expense-amount"
          className={`${styles.input} ${errors.amount ? styles.inputError : ''}`}
          type="number"
          min="0.01"
          step="0.01"
          placeholder="请输入金额"
          value={amountStr}
          onChange={(e) => setAmountStr(e.target.value)}
        />
        {errors.amount && <span className={styles.errorText}>{errors.amount}</span>}
      </div>

      {/* 分类选择（下拉框，6 种分类） */}
      <div className={styles.formGroup}>
        <label className={styles.label} htmlFor="expense-category">
          分类
        </label>
        <select
          id="expense-category"
          className={styles.select}
          value={category}
          onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
        >
          {CATEGORY_OPTIONS.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* 备注 */}
      <div className={styles.formGroup}>
        <label className={styles.label} htmlFor="expense-note">
          备注
        </label>
        <textarea
          id="expense-note"
          className={styles.textarea}
          placeholder="例如：机票、酒店住宿"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>

      {/* 日期 */}
      <div className={styles.formGroup}>
        <label className={styles.label} htmlFor="expense-date">
          日期
        </label>
        <input
          id="expense-date"
          className={styles.input}
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      {/* 提交按钮 */}
      <button type="submit" className={styles.submitBtn}>
        {initialValues ? '保存修改' : '添加支出'}
      </button>
    </form>
  );
}
