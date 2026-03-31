// ============================================================
// AppContext 单元测试
// ============================================================

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { appReducer, AppProvider, useAppContext } from './AppContext';
import type { AppData, Trip, Expense } from '../types';
import * as dataStore from '../utils/dataStore';

// ============================================================
// 测试辅助数据
// ============================================================

/** 创建测试用旅行记录 */
function createTestTrip(overrides: Partial<Trip> = {}): Trip {
  return {
    id: 'trip-1',
    name: '东京之旅',
    destination: '东京',
    startDate: '2024-03-01',
    endDate: '2024-03-07',
    expenses: [],
    createdAt: '2024-02-28T10:00:00Z',
    ...overrides,
  };
}

/** 创建测试用支出记录 */
function createTestExpense(overrides: Partial<Expense> = {}): Expense {
  return {
    id: 'expense-1',
    tripId: 'trip-1',
    amount: 500,
    category: '交通',
    note: '地铁',
    date: '2024-03-02',
    createdAt: '2024-03-02T10:00:00Z',
    ...overrides,
  };
}

/** 默认初始状态 */
const defaultState: AppData = { trips: [], version: 1 };

// ============================================================
// Reducer 测试
// ============================================================

describe('appReducer', () => {
  beforeEach(() => {
    // 模拟 saveData，避免实际写入 localStorage
    vi.spyOn(dataStore, 'saveData').mockImplementation(() => {});
  });

  it('ADD_TRIP：添加旅行到 trips 数组', () => {
    const trip = createTestTrip();
    const newState = appReducer(defaultState, { type: 'ADD_TRIP', payload: trip });

    expect(newState.trips).toHaveLength(1);
    expect(newState.trips[0]).toEqual(trip);
    expect(dataStore.saveData).toHaveBeenCalledWith(newState);
  });

  it('UPDATE_TRIP：更新指定旅行的信息', () => {
    const trip = createTestTrip();
    const state: AppData = { trips: [trip], version: 1 };

    const newState = appReducer(state, {
      type: 'UPDATE_TRIP',
      payload: { tripId: 'trip-1', updates: { name: '大阪之旅', destination: '大阪' } },
    });

    expect(newState.trips[0].name).toBe('大阪之旅');
    expect(newState.trips[0].destination).toBe('大阪');
    // 其他字段不变
    expect(newState.trips[0].startDate).toBe('2024-03-01');
    expect(dataStore.saveData).toHaveBeenCalledWith(newState);
  });

  it('DELETE_TRIP：删除指定旅行', () => {
    const trip1 = createTestTrip({ id: 'trip-1' });
    const trip2 = createTestTrip({ id: 'trip-2', name: '大阪之旅' });
    const state: AppData = { trips: [trip1, trip2], version: 1 };

    const newState = appReducer(state, {
      type: 'DELETE_TRIP',
      payload: { tripId: 'trip-1' },
    });

    expect(newState.trips).toHaveLength(1);
    expect(newState.trips[0].id).toBe('trip-2');
    expect(dataStore.saveData).toHaveBeenCalledWith(newState);
  });

  it('ADD_EXPENSE：向指定旅行添加支出', () => {
    const trip = createTestTrip();
    const state: AppData = { trips: [trip], version: 1 };
    const expense = createTestExpense();

    const newState = appReducer(state, {
      type: 'ADD_EXPENSE',
      payload: { tripId: 'trip-1', expense },
    });

    expect(newState.trips[0].expenses).toHaveLength(1);
    expect(newState.trips[0].expenses[0]).toEqual(expense);
    expect(dataStore.saveData).toHaveBeenCalledWith(newState);
  });

  it('ADD_EXPENSE：添加后支出按日期降序排列', () => {
    const expense1 = createTestExpense({ id: 'e1', date: '2024-03-01' });
    const trip = createTestTrip({ expenses: [expense1] });
    const state: AppData = { trips: [trip], version: 1 };

    const expense2 = createTestExpense({ id: 'e2', date: '2024-03-05' });
    const newState = appReducer(state, {
      type: 'ADD_EXPENSE',
      payload: { tripId: 'trip-1', expense: expense2 },
    });

    // 日期较新的排在前面
    expect(newState.trips[0].expenses[0].id).toBe('e2');
    expect(newState.trips[0].expenses[1].id).toBe('e1');
  });

  it('UPDATE_EXPENSE：更新指定旅行中的支出', () => {
    const expense = createTestExpense();
    const trip = createTestTrip({ expenses: [expense] });
    const state: AppData = { trips: [trip], version: 1 };

    const updatedExpense: Expense = {
      ...expense,
      amount: 1000,
      note: '出租车',
    };

    const newState = appReducer(state, {
      type: 'UPDATE_EXPENSE',
      payload: { tripId: 'trip-1', expense: updatedExpense },
    });

    expect(newState.trips[0].expenses[0].amount).toBe(1000);
    expect(newState.trips[0].expenses[0].note).toBe('出租车');
    // 保留原始 createdAt
    expect(newState.trips[0].expenses[0].createdAt).toBe('2024-03-02T10:00:00Z');
    expect(dataStore.saveData).toHaveBeenCalledWith(newState);
  });

  it('DELETE_EXPENSE：从指定旅行中删除支出', () => {
    const expense1 = createTestExpense({ id: 'e1' });
    const expense2 = createTestExpense({ id: 'e2', note: '午餐' });
    const trip = createTestTrip({ expenses: [expense1, expense2] });
    const state: AppData = { trips: [trip], version: 1 };

    const newState = appReducer(state, {
      type: 'DELETE_EXPENSE',
      payload: { tripId: 'trip-1', expenseId: 'e1' },
    });

    expect(newState.trips[0].expenses).toHaveLength(1);
    expect(newState.trips[0].expenses[0].id).toBe('e2');
    expect(dataStore.saveData).toHaveBeenCalledWith(newState);
  });

  it('SET_BUDGET：设置指定旅行的预算', () => {
    const trip = createTestTrip();
    const state: AppData = { trips: [trip], version: 1 };

    const newState = appReducer(state, {
      type: 'SET_BUDGET',
      payload: { tripId: 'trip-1', budget: 15000 },
    });

    expect(newState.trips[0].budget).toBe(15000);
    expect(dataStore.saveData).toHaveBeenCalledWith(newState);
  });

  it('LOAD_DATA：加载完整数据（不调用 saveData）', () => {
    // 清除之前测试的调用记录
    vi.mocked(dataStore.saveData).mockClear();

    const loadedData: AppData = {
      trips: [createTestTrip()],
      version: 1,
    };

    const newState = appReducer(defaultState, {
      type: 'LOAD_DATA',
      payload: loadedData,
    });

    expect(newState).toEqual(loadedData);
    // LOAD_DATA 不应触发 saveData
    expect(dataStore.saveData).not.toHaveBeenCalled();
  });

  it('未知 action 类型返回原状态', () => {
    const state: AppData = { trips: [createTestTrip()], version: 1 };
    // @ts-expect-error 测试未知 action 类型
    const newState = appReducer(state, { type: 'UNKNOWN_ACTION' });
    expect(newState).toBe(state);
  });

  it('UPDATE_TRIP：不影响其他旅行', () => {
    const trip1 = createTestTrip({ id: 'trip-1', name: '东京之旅' });
    const trip2 = createTestTrip({ id: 'trip-2', name: '大阪之旅' });
    const state: AppData = { trips: [trip1, trip2], version: 1 };

    const newState = appReducer(state, {
      type: 'UPDATE_TRIP',
      payload: { tripId: 'trip-1', updates: { name: '京都之旅' } },
    });

    expect(newState.trips[0].name).toBe('京都之旅');
    expect(newState.trips[1].name).toBe('大阪之旅');
  });

  it('ADD_EXPENSE：不影响其他旅行的支出', () => {
    const trip1 = createTestTrip({ id: 'trip-1' });
    const trip2 = createTestTrip({ id: 'trip-2' });
    const state: AppData = { trips: [trip1, trip2], version: 1 };

    const expense = createTestExpense({ tripId: 'trip-1' });
    const newState = appReducer(state, {
      type: 'ADD_EXPENSE',
      payload: { tripId: 'trip-1', expense },
    });

    expect(newState.trips[0].expenses).toHaveLength(1);
    expect(newState.trips[1].expenses).toHaveLength(0);
  });
});

// ============================================================
// Provider 和 useAppContext 测试
// ============================================================

describe('AppProvider 和 useAppContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('useAppContext 在 Provider 外部使用时抛出错误', () => {
    // 抑制 React 错误边界的 console.error
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    function TestComponent() {
      useAppContext();
      return null;
    }

    expect(() => render(<TestComponent />)).toThrow('useAppContext 必须在 AppProvider 内部使用');
    consoleSpy.mockRestore();
  });

  it('Provider 提供 state 和 dispatch', () => {
    let contextValue: { state: AppData; dispatch: unknown } | null = null;

    function TestComponent() {
      contextValue = useAppContext();
      return <div data-testid="test">已加载</div>;
    }

    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>,
    );

    expect(screen.getByTestId('test')).toHaveTextContent('已加载');
    expect(contextValue).not.toBeNull();
    expect(contextValue!.state).toBeDefined();
    expect(contextValue!.dispatch).toBeDefined();
    expect(Array.isArray(contextValue!.state.trips)).toBe(true);
  });

  it('Provider 初始化时从 localStorage 加载数据', async () => {
    // 预先存入数据
    const savedData: AppData = {
      trips: [createTestTrip()],
      version: 1,
    };
    localStorage.setItem('travel-expense-tracker-data', JSON.stringify(savedData));

    let contextState: AppData | null = null;

    function TestComponent() {
      const { state } = useAppContext();
      contextState = state;
      return <div data-testid="count">{state.trips.length}</div>;
    }

    await act(async () => {
      render(
        <AppProvider>
          <TestComponent />
        </AppProvider>,
      );
    });

    // useEffect 加载数据后，state 应包含已保存的旅行
    expect(contextState!.trips).toHaveLength(1);
    expect(contextState!.trips[0].name).toBe('东京之旅');
  });

  it('Provider 在数据损坏时使用默认空数据', async () => {
    // 存入损坏的数据
    localStorage.setItem('travel-expense-tracker-data', '{ invalid json }');
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    let contextState: AppData | null = null;

    function TestComponent() {
      const { state } = useAppContext();
      contextState = state;
      return <div data-testid="count">{state.trips.length}</div>;
    }

    await act(async () => {
      render(
        <AppProvider>
          <TestComponent />
        </AppProvider>,
      );
    });

    // 数据损坏时应使用默认空数据
    expect(contextState!.trips).toHaveLength(0);
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});
