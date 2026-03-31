// ============================================================
// 旅行表单组件 - 创建旅行时使用
// 包含名称（必填）、目的地、起止日期、可选预算字段
// 集成 createTrip 的验证逻辑
// ============================================================

import { useState } from 'react';
import type { CreateTripInput } from '../types';
import { createTrip } from '../utils/tripManager';
import styles from './TripForm.module.css';

/** 组件属性 */
interface TripFormProps {
  /** 提交回调，传递验证通过的旅行输入 */
  onSubmit: (input: CreateTripInput) => void;
  /** 初始值（编辑模式时使用） */
  initialValues?: Partial<CreateTripInput>;
}

/** 获取今天的日期字符串（YYYY-MM-DD） */
function getTodayStr(): string {
  return new Date().toISOString().split('T')[0];
}

export default function TripForm({ onSubmit, initialValues }: TripFormProps) {
  // 受控表单状态
  const [name, setName] = useState(initialValues?.name ?? '');
  const [destination, setDestination] = useState(initialValues?.destination ?? '');
  const [startDate, setStartDate] = useState(initialValues?.startDate ?? getTodayStr());
  const [endDate, setEndDate] = useState(initialValues?.endDate ?? getTodayStr());
  const [budget, setBudget] = useState<string>(
    initialValues?.budget !== undefined ? String(initialValues.budget) : '',
  );

  // 各字段的验证错误信息
  const [errors, setErrors] = useState<Record<string, string>>({});

  /** 处理表单提交 */
  const handleSubmit = (e: React.FormEvent) => {
    // 阻止默认表单行为
    e.preventDefault();

    // 构建输入对象
    const input: CreateTripInput = {
      name,
      destination,
      startDate,
      endDate,
      budget: budget.trim() ? Number(budget) : undefined,
    };

    // 预算金额验证：如果填写了预算，必须大于零
    if (budget.trim() && (Number.isNaN(Number(budget)) || Number(budget) <= 0)) {
      setErrors({ budget: '预算金额必须大于零' });
      return;
    }

    // 调用 createTrip 进行业务验证
    const result = createTrip(input);

    if (!result.ok) {
      // 验证失败，显示错误信息
      setErrors({ [result.error.field]: result.error.message });
      return;
    }

    // 验证通过，清除错误并回调
    setErrors({});
    onSubmit(input);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {/* 旅行名称（必填） */}
      <div className={styles.formGroup}>
        <label className={`${styles.label} ${styles.required}`} htmlFor="trip-name">
          旅行名称
        </label>
        <input
          id="trip-name"
          className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
          type="text"
          placeholder="例如：东京之旅"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {errors.name && <span className={styles.errorText}>{errors.name}</span>}
      </div>

      {/* 目的地 */}
      <div className={styles.formGroup}>
        <label className={styles.label} htmlFor="trip-destination">
          目的地
        </label>
        <input
          id="trip-destination"
          className={styles.input}
          type="text"
          placeholder="例如：东京"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
        />
      </div>

      {/* 起止日期 */}
      <div className={styles.dateRow}>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="trip-start-date">
            起始日期
          </label>
          <input
            id="trip-start-date"
            className={styles.input}
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="trip-end-date">
            结束日期
          </label>
          <input
            id="trip-end-date"
            className={`${styles.input} ${errors.endDate ? styles.inputError : ''}`}
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          {errors.endDate && <span className={styles.errorText}>{errors.endDate}</span>}
        </div>
      </div>

      {/* 预算（可选） */}
      <div className={styles.formGroup}>
        <label className={styles.label} htmlFor="trip-budget">
          预算（可选）
        </label>
        <input
          id="trip-budget"
          className={`${styles.input} ${errors.budget ? styles.inputError : ''}`}
          type="number"
          min="0"
          step="0.01"
          placeholder="例如：10000"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
        />
        {errors.budget && <span className={styles.errorText}>{errors.budget}</span>}
      </div>

      {/* 提交按钮 */}
      <button type="submit" className={styles.submitBtn}>
        保存旅行
      </button>
    </form>
  );
}
