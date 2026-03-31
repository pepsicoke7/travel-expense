// ============================================================
// 预算管理器 - 预算设置、状态计算与超支提醒
// ============================================================

import type {
  BudgetAlert,
  BudgetStatus,
  Result,
  ValidationError,
} from '../types';

/**
 * 设置/更新旅行预算
 * 验证预算金额必须为正数
 *
 * @param tripId - 旅行 ID
 * @param amount - 预算金额
 * @returns 成功时返回预算金额，失败时返回验证错误
 */
export function setBudget(_tripId: string, amount: number): Result<number, ValidationError> {
  // 验证预算金额为正数
  if (amount <= 0 || !isFinite(amount)) {
    return {
      ok: false,
      error: { field: 'budget', message: '预算金额必须大于零' },
    };
  }

  return { ok: true, value: amount };
}

/**
 * 获取预算使用情况
 * 根据预算总额和已花费金额计算剩余金额、使用百分比和状态级别
 *
 * @param budget - 预算总额（正数）
 * @param totalExpense - 已花费金额（非负数）
 * @returns 预算状态对象
 */
export function getBudgetStatus(budget: number, totalExpense: number): BudgetStatus {
  // 计算剩余金额
  const remainingAmount = budget - totalExpense;

  // 计算使用百分比
  const usagePercent = (totalExpense / budget) * 100;

  // 根据使用百分比确定状态级别
  let level: BudgetStatus['level'];
  if (usagePercent > 100) {
    level = 'exceeded';
  } else if (usagePercent >= 80) {
    level = 'warning';
  } else {
    level = 'normal';
  }

  return {
    budgetAmount: budget,
    spentAmount: totalExpense,
    remainingAmount,
    usagePercent,
    level,
  };
}

/**
 * 检查是否需要超支提醒
 * 根据当前支出总额和新增支出金额判断是否触发预算提醒
 *
 * 优先级：
 * 1. 新增支出后将超预算 → will_exceed
 * 2. 当前已超预算 → exceeded
 * 3. 当前已达 80% 预算 → warning_80
 * 4. 其他情况 → null
 *
 * @param budget - 预算总额
 * @param currentTotal - 当前支出总额
 * @param newExpenseAmount - 新增支出金额
 * @returns 预算提醒对象，无需提醒时返回 null
 */
export function checkBudgetAlert(
  budget: number,
  currentTotal: number,
  newExpenseAmount: number,
): BudgetAlert | null {
  const projectedTotal = currentTotal + newExpenseAmount;

  // 新增支出后将超预算
  if (projectedTotal > budget) {
    const overAmount = projectedTotal - budget;
    return {
      type: 'will_exceed',
      message: `添加此笔支出后将超出预算 ¥${overAmount.toFixed(2)}`,
      overAmount,
    };
  }

  // 当前已超预算
  if (currentTotal > budget) {
    const overAmount = currentTotal - budget;
    return {
      type: 'exceeded',
      message: `已超出预算 ¥${overAmount.toFixed(2)}`,
      overAmount,
    };
  }

  // 当前已达 80% 预算警戒线
  if (currentTotal >= budget * 0.8 && currentTotal <= budget) {
    return {
      type: 'warning_80',
      message: '已使用 80% 预算，请注意控制支出',
    };
  }

  return null;
}
