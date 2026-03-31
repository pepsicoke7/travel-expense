// ============================================================
// 添加支出页 - 添加支出表单，集成超支预警提示
// 路由：/trip/:id/expense/new
// 验证需求：4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 14.3
// ============================================================

import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import BudgetAlert from '../components/BudgetAlert';
import ExpenseForm from '../components/ExpenseForm';
import { useAppContext } from '../context/AppContext';
import type { BudgetAlert as BudgetAlertType, CreateExpenseInput } from '../types';
import { checkBudgetAlert } from '../utils/budgetManager';
import { addExpense } from '../utils/expenseManager';
import { calculateTripTotal } from '../utils/tripManager';
import styles from './AddExpensePage.module.css';

export default function AddExpensePage() {
  const { id } = useParams<{ id: string }>();
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();

  // 查找旅行
  const trip = state.trips.find((t) => t.id === id) ?? null;

  // 超支预警状态：等待用户确认
  const [pendingAlert, setPendingAlert] = useState<BudgetAlertType | null>(null);
  // 暂存待提交的输入（用户确认超支后提交）
  const [pendingInput, setPendingInput] = useState<CreateExpenseInput | null>(null);

  // 旅行不存在时显示提示
  if (!trip) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <Link to="/" className={styles.backLink}>← 返回</Link>
          <h1 className={styles.title}>添加支出</h1>
        </div>
        <p className={styles.notFound}>旅行不存在或已被删除</p>
      </div>
    );
  }

  /** 实际执行添加支出的逻辑 */
  const doAddExpense = (input: CreateExpenseInput) => {
    const result = addExpense(id!, input);
    if (!result.ok) {
      // 验证失败不应到达此处（ExpenseForm 已做前端验证），但做防御处理
      return;
    }
    // 派发 ADD_EXPENSE action（需求 4.6）
    dispatch({ type: 'ADD_EXPENSE', payload: { tripId: id!, expense: result.value } });
    // 跳转回旅行详情页
    navigate(`/trip/${id}`);
  };

  /** 处理表单提交 */
  const handleSubmit = (input: CreateExpenseInput) => {
    // 如果旅行有预算，提交前检查超支预警（需求 14.3）
    if (trip.budget) {
      const currentTotal = calculateTripTotal(trip.expenses);
      const alert = checkBudgetAlert(trip.budget, currentTotal, input.amount);

      if (alert) {
        // 显示超支预警，暂存输入等待用户确认
        setPendingAlert(alert);
        setPendingInput(input);
        return;
      }
    }

    // 无预算或未触发预警，直接添加
    doAddExpense(input);
  };

  /** 用户确认超支后继续提交 */
  const handleConfirmOverBudget = () => {
    if (pendingInput) {
      doAddExpense(pendingInput);
    }
    setPendingAlert(null);
    setPendingInput(null);
  };

  /** 用户取消超支提交 */
  const handleCancelOverBudget = () => {
    setPendingAlert(null);
    setPendingInput(null);
  };

  return (
    <div className={styles.page}>
      {/* 页面头部 */}
      <div className={styles.header}>
        <Link to={`/trip/${id}`} className={styles.backLink}>
          ← 返回
        </Link>
        <h1 className={styles.title}>添加支出</h1>
      </div>

      {/* 超支预警提示（需求 14.3） */}
      {pendingAlert && (
        <div className={styles.alertSection}>
          <BudgetAlert alert={pendingAlert} />
          <div className={styles.alertActions}>
            <button
              type="button"
              className={styles.confirmBtn}
              onClick={handleConfirmOverBudget}
            >
              确认添加
            </button>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={handleCancelOverBudget}
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* 支出表单 */}
      <div className={styles.formCard}>
        <ExpenseForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
