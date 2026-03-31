// ============================================================
// 统计引擎 - 单元测试
// ============================================================

import { describe, it, expect } from 'vitest';
import { getCategoryBreakdown, getDailyTrend, getOverallStats } from './statisticsEngine';
import type { Expense, Trip } from '../types';

// 辅助函数：创建测试用支出记录
function makeExpense(overrides: Partial<Expense> = {}): Expense {
  return {
    id: crypto.randomUUID(),
    tripId: 'trip-1',
    amount: 100,
    category: '餐饮',
    note: '测试',
    date: '2024-03-01',
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

// 辅助函数：创建测试用旅行记录
function makeTrip(overrides: Partial<Trip> = {}): Trip {
  return {
    id: crypto.randomUUID(),
    name: '测试旅行',
    destination: '测试目的地',
    startDate: '2024-03-01',
    endDate: '2024-03-05',
    expenses: [],
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

// ============================================================
// getCategoryBreakdown 测试
// ============================================================
describe('getCategoryBreakdown', () => {
  it('空支出列表返回空数组', () => {
    const result = getCategoryBreakdown([]);
    expect(result).toEqual([]);
  });

  it('单个分类占比为 100%', () => {
    const expenses = [
      makeExpense({ amount: 200, category: '交通' }),
      makeExpense({ amount: 300, category: '交通' }),
    ];
    const result = getCategoryBreakdown(expenses);
    expect(result).toHaveLength(1);
    expect(result[0].category).toBe('交通');
    expect(result[0].totalAmount).toBe(500);
    expect(result[0].percentage).toBeCloseTo(100, 2);
  });

  it('多个分类正确汇总金额和占比', () => {
    const expenses = [
      makeExpense({ amount: 300, category: '交通' }),
      makeExpense({ amount: 200, category: '餐饮' }),
      makeExpense({ amount: 500, category: '住宿' }),
    ];
    const result = getCategoryBreakdown(expenses);
    expect(result).toHaveLength(3);

    // 所有金额之和等于总支出
    const totalAmount = result.reduce((sum, c) => sum + c.totalAmount, 0);
    expect(totalAmount).toBe(1000);

    // 所有百分比之和约等于 100
    const totalPercentage = result.reduce((sum, c) => sum + c.percentage, 0);
    expect(totalPercentage).toBeCloseTo(100, 2);
  });

  it('省略零支出的分类', () => {
    const expenses = [
      makeExpense({ amount: 100, category: '交通' }),
    ];
    const result = getCategoryBreakdown(expenses);
    // 只有交通分类，其他分类不出现
    expect(result).toHaveLength(1);
    expect(result[0].category).toBe('交通');
  });
});

// ============================================================
// getDailyTrend 测试
// ============================================================
describe('getDailyTrend', () => {
  it('覆盖起止日期的完整范围', () => {
    const result = getDailyTrend([], '2024-03-01', '2024-03-05');
    expect(result).toHaveLength(5);
    expect(result[0].date).toBe('2024-03-01');
    expect(result[4].date).toBe('2024-03-05');
  });

  it('无支出的日期金额为零', () => {
    const result = getDailyTrend([], '2024-03-01', '2024-03-03');
    for (const day of result) {
      expect(day.totalAmount).toBe(0);
    }
  });

  it('按日期正确汇总支出', () => {
    const expenses = [
      makeExpense({ amount: 100, date: '2024-03-01' }),
      makeExpense({ amount: 200, date: '2024-03-01' }),
      makeExpense({ amount: 50, date: '2024-03-03' }),
    ];
    const result = getDailyTrend(expenses, '2024-03-01', '2024-03-03');
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({ date: '2024-03-01', totalAmount: 300 });
    expect(result[1]).toEqual({ date: '2024-03-02', totalAmount: 0 });
    expect(result[2]).toEqual({ date: '2024-03-03', totalAmount: 50 });
  });

  it('所有日期金额之和等于支出总额', () => {
    const expenses = [
      makeExpense({ amount: 100, date: '2024-03-01' }),
      makeExpense({ amount: 200, date: '2024-03-02' }),
    ];
    const result = getDailyTrend(expenses, '2024-03-01', '2024-03-03');
    const totalFromTrend = result.reduce((sum, d) => sum + d.totalAmount, 0);
    const totalFromExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    expect(totalFromTrend).toBe(totalFromExpenses);
  });

  it('单天旅行返回一条记录', () => {
    const result = getDailyTrend([], '2024-03-01', '2024-03-01');
    expect(result).toHaveLength(1);
    expect(result[0].date).toBe('2024-03-01');
  });
});

// ============================================================
// getOverallStats 测试
// ============================================================
describe('getOverallStats', () => {
  it('空旅行列表返回零统计', () => {
    const result = getOverallStats([]);
    expect(result.totalTrips).toBe(0);
    expect(result.totalExpense).toBe(0);
    expect(result.tripExpenses).toEqual([]);
  });

  it('totalTrips 等于旅行数组长度', () => {
    const trips = [makeTrip(), makeTrip(), makeTrip()];
    const result = getOverallStats(trips);
    expect(result.totalTrips).toBe(3);
  });

  it('totalExpense 等于所有旅行总支出之和', () => {
    const trips = [
      makeTrip({
        expenses: [
          makeExpense({ amount: 100 }),
          makeExpense({ amount: 200 }),
        ],
      }),
      makeTrip({
        expenses: [makeExpense({ amount: 300 })],
      }),
    ];
    const result = getOverallStats(trips);
    expect(result.totalExpense).toBe(600);
  });

  it('tripExpenses 按 totalExpense 降序排列', () => {
    const trips = [
      makeTrip({ id: 'a', name: '旅行A', expenses: [makeExpense({ amount: 100 })] }),
      makeTrip({ id: 'b', name: '旅行B', expenses: [makeExpense({ amount: 500 })] }),
      makeTrip({ id: 'c', name: '旅行C', expenses: [makeExpense({ amount: 300 })] }),
    ];
    const result = getOverallStats(trips);
    expect(result.tripExpenses[0].tripId).toBe('b');
    expect(result.tripExpenses[1].tripId).toBe('c');
    expect(result.tripExpenses[2].tripId).toBe('a');
  });

  it('无支出的旅行总支出为零', () => {
    const trips = [makeTrip({ id: 'empty', name: '空旅行' })];
    const result = getOverallStats(trips);
    expect(result.totalExpense).toBe(0);
    expect(result.tripExpenses[0].totalExpense).toBe(0);
  });
});
