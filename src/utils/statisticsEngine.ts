// ============================================================
// 统计引擎 - 分类汇总、每日趋势、总览统计
// ============================================================

import type {
  CategorySummary,
  DailyExpense,
  Expense,
  ExpenseCategory,
  OverallStats,
  Trip,
} from '../types';
import { calculateTripTotal } from './tripManager';

/**
 * 按分类汇总支出
 *
 * 规则：
 * - 按分类汇总金额
 * - 计算每个分类的占比百分比（0-100）
 * - 省略零支出的分类
 * - 所有分类的 percentage 之和等于 100%（允许浮点误差）
 *
 * 验证需求：7.1, 7.3, 7.4
 */
export function getCategoryBreakdown(expenses: Expense[]): CategorySummary[] {
  // 按分类累加金额
  const categoryMap = new Map<ExpenseCategory, number>();

  for (const expense of expenses) {
    const current = categoryMap.get(expense.category) ?? 0;
    categoryMap.set(expense.category, current + expense.amount);
  }

  // 计算总支出
  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  // 如果没有支出，返回空数组
  if (totalAmount === 0) {
    return [];
  }

  // 构建结果，省略零支出分类
  const result: CategorySummary[] = [];

  for (const [category, amount] of categoryMap.entries()) {
    if (amount > 0) {
      result.push({
        category,
        totalAmount: amount,
        percentage: (amount / totalAmount) * 100,
      });
    }
  }

  return result;
}

/**
 * 按日期汇总每日支出
 *
 * 规则：
 * - 覆盖 startDate 到 endDate 的每一天
 * - 按日期汇总每日支出总额
 * - 无支出的日期 totalAmount 为零
 * - 所有日期的 totalAmount 之和等于支出总额
 *
 * 验证需求：8.1, 8.3, 8.4
 */
export function getDailyTrend(
  expenses: Expense[],
  startDate: string,
  endDate: string,
): DailyExpense[] {
  // 按日期累加支出金额
  const dailyMap = new Map<string, number>();

  for (const expense of expenses) {
    const current = dailyMap.get(expense.date) ?? 0;
    dailyMap.set(expense.date, current + expense.amount);
  }

  // 生成从 startDate 到 endDate 的完整日期序列
  // 使用 UTC 时间避免时区偏移导致日期错位
  const result: DailyExpense[] = [];
  const start = new Date(startDate + 'T00:00:00Z');
  const end = new Date(endDate + 'T00:00:00Z');

  const current = new Date(start);
  while (current <= end) {
    const dateStr = current.toISOString().split('T')[0];
    result.push({
      date: dateStr,
      totalAmount: dailyMap.get(dateStr) ?? 0,
    });
    // 前进一天
    current.setUTCDate(current.getUTCDate() + 1);
  }

  return result;
}

/**
 * 获取所有旅行的总览统计
 *
 * 规则：
 * - totalTrips 等于旅行数组长度
 * - totalExpense 等于所有旅行总支出之和
 * - tripExpenses 按 totalExpense 降序排列
 *
 * 验证需求：9.1, 9.2, 9.3
 */
export function getOverallStats(trips: Trip[]): OverallStats {
  // 计算每个旅行的总支出
  const tripExpenses = trips.map((trip) => ({
    tripId: trip.id,
    tripName: trip.name,
    totalExpense: calculateTripTotal(trip.expenses),
  }));

  // 按总支出降序排列
  tripExpenses.sort((a, b) => b.totalExpense - a.totalExpense);

  // 计算累计总支出
  const totalExpense = tripExpenses.reduce((sum, t) => sum + t.totalExpense, 0);

  return {
    totalTrips: trips.length,
    totalExpense,
    tripExpenses,
  };
}
