// ============================================================
// 旅行管理器 - 单元测试
// ============================================================

import { describe, it, expect } from 'vitest';
import { createTrip, getTrips, getTripDetail, calculateTripTotal } from './tripManager';
import type { Trip, Expense, CreateTripInput } from '../types';

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

describe('createTrip', () => {
  it('应使用合法输入成功创建旅行', () => {
    const input: CreateTripInput = {
      name: '东京之旅',
      destination: '东京',
      startDate: '2024-03-01',
      endDate: '2024-03-07',
    };

    const result = createTrip(input);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.name).toBe('东京之旅');
      expect(result.value.destination).toBe('东京');
      expect(result.value.startDate).toBe('2024-03-01');
      expect(result.value.endDate).toBe('2024-03-07');
      expect(result.value.id).toBeTruthy();
      expect(result.value.expenses).toEqual([]);
      expect(result.value.createdAt).toBeTruthy();
    }
  });

  it('应保留可选的预算字段', () => {
    const input: CreateTripInput = {
      name: '东京之旅',
      destination: '东京',
      startDate: '2024-03-01',
      endDate: '2024-03-07',
      budget: 15000,
    };

    const result = createTrip(input);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.budget).toBe(15000);
    }
  });

  it('应拒绝空名称', () => {
    const input: CreateTripInput = {
      name: '',
      destination: '东京',
      startDate: '2024-03-01',
      endDate: '2024-03-07',
    };

    const result = createTrip(input);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.field).toBe('name');
      expect(result.error.message).toBe('请输入旅行名称');
    }
  });

  it('应拒绝纯空白名称', () => {
    const input: CreateTripInput = {
      name: '   \t\n  ',
      destination: '东京',
      startDate: '2024-03-01',
      endDate: '2024-03-07',
    };

    const result = createTrip(input);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toBe('请输入旅行名称');
    }
  });

  it('应拒绝结束日期早于起始日期', () => {
    const input: CreateTripInput = {
      name: '东京之旅',
      destination: '东京',
      startDate: '2024-03-07',
      endDate: '2024-03-01',
    };

    const result = createTrip(input);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.field).toBe('endDate');
      expect(result.error.message).toBe('结束日期不能早于起始日期');
    }
  });

  it('应允许起始日期和结束日期相同（一日游）', () => {
    const input: CreateTripInput = {
      name: '一日游',
      destination: '箱根',
      startDate: '2024-03-01',
      endDate: '2024-03-01',
    };

    const result = createTrip(input);
    expect(result.ok).toBe(true);
  });

  it('每次创建应生成不同的 ID', () => {
    const input: CreateTripInput = {
      name: '旅行',
      destination: '目的地',
      startDate: '2024-01-01',
      endDate: '2024-01-02',
    };

    const r1 = createTrip(input);
    const r2 = createTrip(input);

    expect(r1.ok && r2.ok).toBe(true);
    if (r1.ok && r2.ok) {
      expect(r1.value.id).not.toBe(r2.value.id);
    }
  });
});

describe('getTrips', () => {
  const trips: Trip[] = [
    makeTrip({ name: 'B旅行', startDate: '2024-02-01', expenses: [makeExpense({ amount: 200 })] }),
    makeTrip({ name: 'A旅行', startDate: '2024-03-01', expenses: [makeExpense({ amount: 100 })] }),
    makeTrip({ name: 'C旅行', startDate: '2024-01-01', expenses: [makeExpense({ amount: 300 })] }),
  ];

  it('应按起始日期升序排列', () => {
    const sorted = getTrips(trips, 'startDate', 'asc');
    expect(sorted[0].startDate).toBe('2024-01-01');
    expect(sorted[1].startDate).toBe('2024-02-01');
    expect(sorted[2].startDate).toBe('2024-03-01');
  });

  it('应按起始日期降序排列', () => {
    const sorted = getTrips(trips, 'startDate', 'desc');
    expect(sorted[0].startDate).toBe('2024-03-01');
    expect(sorted[2].startDate).toBe('2024-01-01');
  });

  it('应按名称升序排列', () => {
    const sorted = getTrips(trips, 'name', 'asc');
    expect(sorted[0].name).toBe('A旅行');
    expect(sorted[1].name).toBe('B旅行');
    expect(sorted[2].name).toBe('C旅行');
  });

  it('应按总支出降序排列', () => {
    const sorted = getTrips(trips, 'totalExpense', 'desc');
    expect(sorted[0].expenses[0].amount).toBe(300);
    expect(sorted[2].expenses[0].amount).toBe(100);
  });

  it('不应修改原数组', () => {
    const original = [...trips];
    getTrips(trips, 'name', 'asc');
    expect(trips).toEqual(original);
  });

  it('应处理空数组', () => {
    const sorted = getTrips([], 'startDate', 'asc');
    expect(sorted).toEqual([]);
  });
});

describe('getTripDetail', () => {
  const trips: Trip[] = [
    makeTrip({ id: 'trip-1', name: '旅行一' }),
    makeTrip({ id: 'trip-2', name: '旅行二' }),
  ];

  it('应根据 ID 找到旅行', () => {
    const result = getTripDetail(trips, 'trip-1');
    expect(result).not.toBeNull();
    expect(result!.name).toBe('旅行一');
  });

  it('找不到时应返回 null', () => {
    const result = getTripDetail(trips, 'nonexistent');
    expect(result).toBeNull();
  });

  it('空数组应返回 null', () => {
    const result = getTripDetail([], 'trip-1');
    expect(result).toBeNull();
  });
});

describe('calculateTripTotal', () => {
  it('应计算所有支出金额之和', () => {
    const expenses = [
      makeExpense({ amount: 100 }),
      makeExpense({ amount: 200 }),
      makeExpense({ amount: 50.5 }),
    ];

    expect(calculateTripTotal(expenses)).toBeCloseTo(350.5);
  });

  it('空支出列表应返回 0', () => {
    expect(calculateTripTotal([])).toBe(0);
  });

  it('单条支出应返回该金额', () => {
    const expenses = [makeExpense({ amount: 42 })];
    expect(calculateTripTotal(expenses)).toBe(42);
  });
});
