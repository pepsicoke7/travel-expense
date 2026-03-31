// ============================================================
// 编辑支出页 - 编辑支出表单，预填充当前数据
// 路由：/trip/:id/expense/:eid/edit
// 验证需求：5.1, 5.2, 5.3
// ============================================================

import { Link, useNavigate, useParams } from 'react-router-dom';
import ExpenseForm from '../components/ExpenseForm';
import { useAppContext } from '../context/AppContext';
import type { CreateExpenseInput } from '../types';
import { updateExpense } from '../utils/expenseManager';
import styles from './EditExpensePage.module.css';

export default function EditExpensePage() {
  const { id, eid } = useParams<{ id: string; eid: string }>();
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();

  // 查找旅行
  const trip = state.trips.find((t) => t.id === id) ?? null;

  // 查找支出记录
  const expense = trip?.expenses.find((e) => e.id === eid) ?? null;

  // 旅行或支出不存在时显示提示
  if (!trip || !expense) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <Link to={trip ? `/trip/${id}` : '/'} className={styles.backLink}>
            ← 返回
          </Link>
          <h1 className={styles.title}>编辑支出</h1>
        </div>
        <p className={styles.notFound}>
          {!trip ? '旅行不存在或已被删除' : '支出记录不存在或已被删除'}
        </p>
      </div>
    );
  }

  // 预填充数据（需求 5.1）
  const initialValues: CreateExpenseInput = {
    amount: expense.amount,
    category: expense.category,
    note: expense.note,
    date: expense.date,
  };

  /** 处理表单提交（需求 5.2） */
  const handleSubmit = (input: CreateExpenseInput) => {
    const result = updateExpense(eid!, input);
    if (!result.ok) {
      // 验证失败不应到达此处（ExpenseForm 已做前端验证），但做防御处理
      return;
    }
    // 派发 UPDATE_EXPENSE action（需求 5.2, 5.3）
    dispatch({ type: 'UPDATE_EXPENSE', payload: { tripId: id!, expense: result.value } });
    // 跳转回旅行详情页
    navigate(`/trip/${id}`);
  };

  return (
    <div className={styles.page}>
      {/* 页面头部 */}
      <div className={styles.header}>
        <Link to={`/trip/${id}`} className={styles.backLink}>
          ← 返回
        </Link>
        <h1 className={styles.title}>编辑支出</h1>
      </div>

      {/* 支出编辑表单（预填充当前数据） */}
      <div className={styles.formCard}>
        <ExpenseForm onSubmit={handleSubmit} initialValues={initialValues} />
      </div>
    </div>
  );
}
