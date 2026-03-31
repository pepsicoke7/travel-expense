// ============================================================
// 支出管理器 - 单元测试
// ============================================================

import { describe, it, expect } from 'vitest';
import {
  addExpense,
  updateExpense,
  deleteExpense,
  validateExpenseInput,
  sortExpensesByDate,
} from './expenseManager';
import type { Expense, Trip, CreateExpenseInput } from '../types';

// 辅助函数：创建测试用的支出记录
function makeExpense(overrides: Partial<Expense> = {}): Expense {
  return {
    id: crypto.randomUUID(),
    tripId: 'trip-1',
    amount: 100,
    category: '餐饮',
    note: '测试支出',
    date: '2024-03-01',
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

// 辅助函数：创建测试用的旅行记录
function makeTrip(overrides: Partial<Trip> = {}): Trip {
  return {
    id: crypto.randomUUID(),
    name: '测试旅行',
    destination: '东京',
    startDate: '2024-03-01',
    endDate: '2024-03-07',
    expenses: [],
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('validateExpenseInput', () => {
  it('合法输入应返回空错误列表', () => {
    const input: CreateExpenseInput = {
      amount: 100,
      category: '餐饮',
      note: '午餐',
      date: '2024-03-01',
    };
    expect(validateExpenseInput(input)).toEqual([]);
  });

  it('金额为零应返回错误', () => {
    const input: CreateExpenseInput = {
      amount: 0,
      category: '餐饮',
      note: '',
      date: '2024-03-01',
    };
    const errors = validateExpenseInput(input);
    expect(errors).toHaveLength(1);
    expect(errors[0].field).toBe('amount');
    expect(errors[0].message).toBe('金额必须大于零');
  });

  it('金额为负数应返回错误', () => {
    const input: CreateExpenseInput = {
      amount: -50,
      category: '交通',
      note: '',
      date: '2024-03-01',
    };
    const errors = validateExpenseInput(input);
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toBe('金额必须大于零');
  });

  it('金额为 NaN 应返回"请输入支出金额"', () => {
    const input: CreateExpenseInput = {
      amount: NaN,
      category: '餐饮',
      note: '',
      date: '2024-03-01',
    };
    const errors = validateExpenseInput(input);
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toBe('请输入支出金额');
  });
});

describe('addExpense', () => {
  it('应使用合法输入成功创建支出', () => {
    const input: CreateExpenseInput = {
      amount: 350,
      category: '交通',
      note: '机票',
      date: '2024-03-01',
    };

    const result = addExpense('trip-1', input);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.tripId).toBe('trip-1');
      expect(result.value.amount).toBe(350);
      expect(result.value.category).toBe('交通');
      expect(result.value.note).toBe('机票');
      expect(result.value.date).toBe('2024-03-01');
      expect(result.value.id).toBeTruthy();
      expect(result.value.createdAt).toBeTruthy();
    }
  });

  it('未选分类时应默认为"其他"', () => {
    const input = {
      amount: 50,
      category: '' as any,
      note: '杂项',
      date: '2024-03-02',
    };

    const result = addExpense('trip-1', input);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.category).toBe('其他');
    }
  });

  it('金额为零应返回验证错误', () => {
    const input: CreateExpenseInput = {
      amount: 0,
      category: '餐饮',
      note: '',
      date: '2024-03-01',
    };

    const result = addExpense('trip-1', input);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.field).toBe('amount');
      expect(result.error.message).toBe('金额必须大于零');
    }
  });

  it('金额为负数应返回验证错误', () => {
    const input: CreateExpenseInput = {
      amount: -100,
      category: '住宿',
      note: '',
      date: '2024-03-01',
    };

    const result = addExpense('trip-1', input);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toBe('金额必须大于零');
    }
  });

  it('每次创建应生成不同的 ID', () => {
    const input: CreateExpenseInput = {
      amount: 100,
      category: '餐饮',
      note: '',
      date: '2024-03-01',
    };

    const r1 = addExpense('trip-1', input);
    const r2 = addExpense('trip-1', input);

    expect(r1.ok && r2.ok).toBe(true);
    if (r1.ok && r2.ok) {
      expect(r1.value.id).not.toBe(r2.value.id);
    }
  });
});

describe('updateExpense', () => {
  it('应使用合法输入成功更新支出', () => {
    const input: CreateExpenseInput = {
      amount: 200,
      category: '住宿',
      note: '酒店',
      date: '2024-03-02',
    };

    const result = updateExpense('expense-1', input);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.id).toBe('expense-1');
      expect(result.value.amount).toBe(200);
      expect(result.value.category).toBe('住宿');
      expect(result.value.note).toBe('酒店');
      expect(result.value.date).toBe('2024-03-02');
    }
  });

  it('金额为非正数应返回验证错误', () => {
    const input: CreateExpenseInput = {
      amount: -10,
      category: '餐饮',
      note: '',
      date: '2024-03-01',
    };

    const result = updateExpense('expense-1', input);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toBe('金额必须大于零');
    }
  });

  it('未选分类时应默认为"其他"', () => {
    const input = {
      amount: 50,
      category: '' as any,
      note: '',
      date: '2024-03-01',
    };

    const result = updateExpense('expense-1', input);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.category).toBe('其他');
    }
  });
});

describe('deleteExpense', () => {
  it('应从旅行中删除指定支出', () => {
    const expense1 = makeExpense({ id: 'e-1' });
    const expense2 = makeExpense({ id: 'e-2' });
    const trips: Trip[] = [
      makeTrip({ id: 'trip-1', expenses: [expense1, expense2] }),
    ];

    const result = deleteExpense('trip-1', 'e-1', trips);

    expect(result[0].expenses).toHaveLength(1);
    expect(result[0].expenses[0].id).toBe('e-2');
  });

  it('删除不存在的支出应静默忽略', () => {
    const expense = makeExpense({ id: 'e-1' });
    const trips: Trip[] = [
      makeTrip({ id: 'trip-1', expenses: [expense] }),
    ];

    const result = deleteExpense('trip-1', 'nonexistent', trips);

    expect(result[0].expenses).toHaveLength(1);
    expect(result[0].expenses[0].id).toBe('e-1');
  });

  it('不应影响其他旅行的支出', () => {
    const trips: Trip[] = [
      makeTrip({ id: 'trip-1', expenses: [makeExpense({ id: 'e-1' })] }),
      makeTrip({ id: 'trip-2', expenses: [makeExpense({ id: 'e-2' })] }),
    ];

    const result = deleteExpense('trip-1', 'e-1', trips);

    expect(result[0].expenses).toHaveLength(0);
    expect(result[1].expenses).toHaveLength(1);
  });

  it('不应修改原数组', () => {
    const expense = makeExpense({ id: 'e-1' });
    const trips: Trip[] = [
      makeTrip({ id: 'trip-1', expenses: [expense] }),
    ];
    const originalLength = trips[0].expenses.length;

    deleteExpense('trip-1', 'e-1', trips);

    expect(trips[0].expenses).toHaveLength(originalLength);
  });
});

describe('sortExpensesByDate', () => {
  it('应按日期降序排列', () => {
    const expenses = [
      makeExpense({ date: '2024-03-01' }),
      makeExpense({ date: '2024-03-05' }),
      makeExpense({ date: '2024-03-03' }),
    ];

    const sorted = sortExpensesByDate(expenses);

    expect(sorted[0].date).toBe('2024-03-05');
    expect(sorted[1].date).toBe('2024-03-03');
    expect(sorted[2].date).toBe('2024-03-01');
  });

  it('空数组应返回空数组', () => {
    expect(sortExpensesByDate([])).toEqual([]);
  });

  it('不应修改原数组', () => {
    const expenses = [
      makeExpense({ date: '2024-03-01' }),
      makeExpense({ date: '2024-03-05' }),
    ];
    const original = [...expenses];

    sortExpensesByDate(expenses);

    expect(expenses[0].date).toBe(original[0].date);
    expect(expenses[1].date).toBe(original[1].date);
  });

  it('相同日期的支出应保持稳定', () => {
    const e1 = makeExpense({ id: 'a', date: '2024-03-01' });
    const e2 = makeExpense({ id: 'b', date: '2024-03-01' });

    const sorted = sortExpensesByDate([e1, e2]);

    expect(sorted).toHaveLength(2);
    expect(sorted[0].date).toBe('2024-03-01');
    expect(sorted[1].date).toBe('2024-03-01');
  });
});
