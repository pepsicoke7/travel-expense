// ============================================================
// 全局状态管理 - AppContext + useReducer
// ============================================================

import React, { createContext, useContext, useEffect, useReducer } from 'react';
import type {
  AppData,
  CreateTripInput,
  Expense,
  Trip,
} from '../types';
import { loadData, saveData } from '../utils/dataStore';
import { sortExpensesByDate } from '../utils/expenseManager';

// ============================================================
// Action 类型定义
// ============================================================

/** 所有支持的 Action 类型 */
export type AppAction =
  | { type: 'ADD_TRIP'; payload: Trip }
  | { type: 'UPDATE_TRIP'; payload: { tripId: string; updates: Partial<CreateTripInput> } }
  | { type: 'DELETE_TRIP'; payload: { tripId: string } }
  | { type: 'ADD_EXPENSE'; payload: { tripId: string; expense: Expense } }
  | { type: 'UPDATE_EXPENSE'; payload: { tripId: string; expense: Expense } }
  | { type: 'DELETE_EXPENSE'; payload: { tripId: string; expenseId: string } }
  | { type: 'SET_BUDGET'; payload: { tripId: string; budget: number } }
  | { type: 'LOAD_DATA'; payload: AppData };

// ============================================================
// Context 定义
// ============================================================

/** Context 值类型：包含全局状态和 dispatch 函数 */
interface AppContextValue {
  state: AppData;
  dispatch: React.Dispatch<AppAction>;
}

/** 默认空数据 */
const defaultState: AppData = { trips: [], version: 1 };

/** 创建 Context，默认值为 undefined 用于检测是否在 Provider 内使用 */
const AppContext = createContext<AppContextValue | undefined>(undefined);

// ============================================================
// Reducer
// ============================================================

/**
 * 应用全局 Reducer
 * 处理所有 Action 类型，每次状态变更后自动持久化到 localStorage
 */
export function appReducer(state: AppData, action: AppAction): AppData {
  let newState: AppData;

  switch (action.type) {
    case 'ADD_TRIP': {
      // 添加旅行到 trips 数组
      newState = {
        ...state,
        trips: [...state.trips, action.payload],
      };
      break;
    }

    case 'UPDATE_TRIP': {
      // 更新指定旅行的信息
      const { tripId, updates } = action.payload;
      newState = {
        ...state,
        trips: state.trips.map((trip) => {
          if (trip.id !== tripId) return trip;
          return { ...trip, ...updates };
        }),
      };
      break;
    }

    case 'DELETE_TRIP': {
      // 删除指定旅行
      newState = {
        ...state,
        trips: state.trips.filter((trip) => trip.id !== action.payload.tripId),
      };
      break;
    }

    case 'ADD_EXPENSE': {
      // 向指定旅行添加支出，添加后按日期降序排列
      const { tripId, expense } = action.payload;
      newState = {
        ...state,
        trips: state.trips.map((trip) => {
          if (trip.id !== tripId) return trip;
          const updatedExpenses = sortExpensesByDate([...trip.expenses, expense]);
          return { ...trip, expenses: updatedExpenses };
        }),
      };
      break;
    }

    case 'UPDATE_EXPENSE': {
      // 更新指定旅行中的支出，更新后按日期降序排列
      const { tripId, expense: updatedExpense } = action.payload;
      newState = {
        ...state,
        trips: state.trips.map((trip) => {
          if (trip.id !== tripId) return trip;
          const updatedExpenses = sortExpensesByDate(
            trip.expenses.map((e) => {
              if (e.id !== updatedExpense.id) return e;
              // 保留原始 tripId 和 createdAt
              return { ...updatedExpense, tripId: trip.id, createdAt: e.createdAt };
            }),
          );
          return { ...trip, expenses: updatedExpenses };
        }),
      };
      break;
    }

    case 'DELETE_EXPENSE': {
      // 从指定旅行中删除支出
      const { tripId, expenseId } = action.payload;
      newState = {
        ...state,
        trips: state.trips.map((trip) => {
          if (trip.id !== tripId) return trip;
          return {
            ...trip,
            expenses: trip.expenses.filter((e) => e.id !== expenseId),
          };
        }),
      };
      break;
    }

    case 'SET_BUDGET': {
      // 设置指定旅行的预算
      const { tripId, budget } = action.payload;
      newState = {
        ...state,
        trips: state.trips.map((trip) => {
          if (trip.id !== tripId) return trip;
          return { ...trip, budget };
        }),
      };
      break;
    }

    case 'LOAD_DATA': {
      // 加载完整数据（初始化时使用，不需要持久化）
      return action.payload;
    }

    default:
      return state;
  }

  // 每次状态变更后持久化到 localStorage（LOAD_DATA 除外）
  saveData(newState);
  return newState;
}

// ============================================================
// Provider 组件
// ============================================================

/**
 * AppProvider 组件
 * 包裹应用根组件，提供全局状态和 dispatch
 * 初始化时从 localStorage 加载数据
 */
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, defaultState);

  // 初始化时从 localStorage 加载数据
  useEffect(() => {
    const result = loadData();
    if (result.ok) {
      dispatch({ type: 'LOAD_DATA', payload: result.value });
    } else {
      // 数据损坏或解析失败，使用默认空数据
      console.warn('数据加载失败，使用默认空数据：', result.error.message);
    }
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// ============================================================
// 自定义 Hook
// ============================================================

/**
 * 获取全局状态和 dispatch 的 Hook
 * 必须在 AppProvider 内部使用
 */
export function useAppContext(): AppContextValue {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext 必须在 AppProvider 内部使用');
  }
  return context;
}
