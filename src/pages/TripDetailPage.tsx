// ============================================================
// 旅行详情页 - 展示旅行基本信息、支出列表、预算状态
// 路由：/trip/:id
// 验证需求：3.1, 3.2, 3.3, 6.1, 6.2, 6.3, 13.1, 13.2, 13.3, 13.4, 14.1, 14.2, 14.4
// ============================================================

import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import BudgetAlert from '../components/BudgetAlert';
import BudgetBar from '../components/BudgetBar';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import { useAppContext } from '../context/AppContext';
import { getBudgetStatus, checkBudgetAlert, setBudget } from '../utils/budgetManager';
import { sortExpensesByDate } from '../utils/expenseManager';
import { calculateTripTotal } from '../utils/tripManager';
import styles from './TripDetailPage.module.css';

export default function TripDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();

  // 查找旅行
  const trip = state.trips.find((t) => t.id === id) ?? null;

  // 删除确认对话框状态
  const [deleteExpenseId, setDeleteExpenseId] = useState<string | null>(null);

  // 预算设置表单状态
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [budgetInput, setBudgetInput] = useState('');
  const [budgetError, setBudgetError] = useState('');

  // 旅行不存在时显示提示并引导返回列表
  if (!trip) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <Link to="/" className={styles.backLink}>← 返回</Link>
          <h1 className={styles.title}>旅行详情</h1>
        </div>
        <EmptyState
          message="旅行不存在或已被删除"
          actionLabel="返回旅行列表"
          onAction={() => navigate('/')}
        />
      </div>
    );
  }

  // 计算总支出（需求 3.2）
  const totalExpense = calculateTripTotal(trip.expenses);

  // 按日期降序排列支出列表（需求 3.3）
  const sortedExpenses = sortExpensesByDate(trip.expenses);

  // 预算状态计算（需求 13.1, 13.2）
  const budgetStatus = trip.budget ? getBudgetStatus(trip.budget, totalExpense) : null;

  // 预算警告检查（需求 14.1, 14.2, 14.4）
  const budgetAlertInfo = trip.budget
    ? checkBudgetAlert(trip.budget, totalExpense, 0)
    : null;

  /** 确认删除支出（需求 6.2） */
  const handleConfirmDelete = () => {
    if (deleteExpenseId && id) {
      dispatch({ type: 'DELETE_EXPENSE', payload: { tripId: id, expenseId: deleteExpenseId } });
      setDeleteExpenseId(null);
    }
  };

  /** 取消删除（需求 6.3） */
  const handleCancelDelete = () => {
    setDeleteExpenseId(null);
  };

  /** 提交预算设置 */
  const handleBudgetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(budgetInput);
    const result = setBudget(id!, amount);
    if (!result.ok) {
      setBudgetError(result.error.message);
      return;
    }
    dispatch({ type: 'SET_BUDGET', payload: { tripId: id!, budget: result.value } });
    setShowBudgetForm(false);
    setBudgetInput('');
    setBudgetError('');
  };

  return (
    <div className={styles.page}>
      {/* 页面头部 */}
      <div className={styles.header}>
        <Link to="/" className={styles.backLink}>← 返回</Link>
        <h1 className={styles.title}>{trip.name}</h1>
      </div>

      {/* 旅行基本信息（需求 3.1） */}
      <div className={styles.infoCard}>
        <span className={styles.tripMeta}>
          {trip.destination && `📍 ${trip.destination} · `}
          {trip.startDate} ~ {trip.endDate}
        </span>
        <span className={styles.totalExpense}>总支出：¥{totalExpense.toFixed(2)}</span>
      </div>

      {/* 操作按钮 */}
      <div className={styles.actions}>
        <Link to={`/trip/${id}/expense/new`} className={styles.actionBtn}>
          + 添加支出
        </Link>
        <Link to={`/trip/${id}/stats`} className={`${styles.actionBtn} ${styles.secondaryBtn}`}>
          📊 查看统计
        </Link>
      </div>

      {/* 预算区域（需求 13.1, 13.2, 13.4, 14.1, 14.2, 14.4） */}
      <div className={styles.budgetSection}>
        {budgetStatus ? (
          <>
            {/* 已设置预算：显示预算进度条 */}
            <BudgetBar status={budgetStatus} />
            {/* 预算警告提示 */}
            {budgetAlertInfo && <BudgetAlert alert={budgetAlertInfo} />}
          </>
        ) : (
          /* 未设置预算：显示提示（需求 13.4） */
          <div className={styles.noBudget}>
            <span className={styles.noBudgetText}>💰 未设置预算</span>
            {!showBudgetForm && (
              <button
                className={styles.actionBtn}
                type="button"
                onClick={() => setShowBudgetForm(true)}
              >
                设置预算
              </button>
            )}
          </div>
        )}

        {/* 预算设置表单 */}
        {showBudgetForm && (
          <form className={styles.budgetForm} onSubmit={handleBudgetSubmit}>
            <input
              className={styles.budgetInput}
              type="number"
              step="0.01"
              min="0.01"
              placeholder="输入预算金额"
              value={budgetInput}
              onChange={(e) => {
                setBudgetInput(e.target.value);
                setBudgetError('');
              }}
            />
            <button className={styles.budgetSubmitBtn} type="submit">确认</button>
            <button
              className={`${styles.budgetSubmitBtn} ${styles.secondaryBtn}`}
              type="button"
              onClick={() => {
                setShowBudgetForm(false);
                setBudgetInput('');
                setBudgetError('');
              }}
            >
              取消
            </button>
            {budgetError && <span className={styles.budgetError}>{budgetError}</span>}
          </form>
        )}

        {/* 已设置预算时也可修改 */}
        {budgetStatus && !showBudgetForm && (
          <button
            className={`${styles.actionBtn} ${styles.secondaryBtn}`}
            type="button"
            onClick={() => {
              setShowBudgetForm(true);
              setBudgetInput(trip.budget?.toString() ?? '');
            }}
          >
            修改预算
          </button>
        )}
      </div>

      {/* 支出列表（需求 3.3） */}
      <div className={styles.expenseSection}>
        <h2 className={styles.sectionTitle}>支出记录</h2>
        {sortedExpenses.length === 0 ? (
          <EmptyState
            message="暂无支出记录"
            actionLabel="添加支出"
            onAction={() => navigate(`/trip/${id}/expense/new`)}
          />
        ) : (
          <div className={styles.expenseList}>
            {sortedExpenses.map((expense) => (
              <div key={expense.id} className={styles.expenseCard}>
                <div className={styles.expenseInfo}>
                  <div className={styles.expenseTop}>
                    <span className={styles.expenseAmount}>¥{expense.amount.toFixed(2)}</span>
                    <span className={styles.expenseCategory}>{expense.category}</span>
                  </div>
                  <div className={styles.expenseBottom}>
                    <span>{expense.date}</span>
                    {expense.note && (
                      <span className={styles.expenseNote}>· {expense.note}</span>
                    )}
                  </div>
                </div>
                <div className={styles.expenseActions}>
                  {/* 编辑按钮（链接到编辑页） */}
                  <Link
                    to={`/trip/${id}/expense/${expense.id}/edit`}
                    className={styles.editBtn}
                  >
                    编辑
                  </Link>
                  {/* 删除按钮（需求 6.1） */}
                  <button
                    className={styles.deleteBtn}
                    type="button"
                    onClick={() => setDeleteExpenseId(expense.id)}
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 删除确认对话框（需求 6.1, 6.3） */}
      <ConfirmDialog
        isOpen={deleteExpenseId !== null}
        title="删除支出"
        message="确定要删除这条支出记录吗？此操作不可撤销。"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
}
