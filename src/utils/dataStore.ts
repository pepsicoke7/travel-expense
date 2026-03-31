// ============================================================
// 数据存储层 - 序列化、反序列化与本地存储
// ============================================================

import type { AppData, DataError, Expense, Result, Trip } from '../types';

/** localStorage 存储键名 */
const STORAGE_KEY = 'travel-expense-tracker-data';

/** 合法的支出分类列表 */
const VALID_CATEGORIES = ['交通', '住宿', '餐饮', '门票', '购物', '其他'] as const;

/**
 * 验证字符串是否为合法的 ISO 日期格式（YYYY-MM-DD 或完整 ISO 时间戳）
 */
function isValidDateString(value: unknown): value is string {
  if (typeof value !== 'string' || value.length === 0) return false;
  return !isNaN(Date.parse(value));
}

/**
 * 验证单条支出记录的数据结构是否合法
 */
function isValidExpense(value: unknown): value is Expense {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.id === 'string' &&
    typeof obj.tripId === 'string' &&
    typeof obj.amount === 'number' &&
    isFinite(obj.amount) &&
    obj.amount > 0 &&
    typeof obj.category === 'string' &&
    (VALID_CATEGORIES as readonly string[]).includes(obj.category) &&
    typeof obj.note === 'string' &&
    isValidDateString(obj.date) &&
    isValidDateString(obj.createdAt)
  );
}

/**
 * 验证单条旅行记录的数据结构是否合法
 */
function isValidTrip(value: unknown): value is Trip {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.destination === 'string' &&
    isValidDateString(obj.startDate) &&
    isValidDateString(obj.endDate) &&
    (obj.budget === undefined || (typeof obj.budget === 'number' && isFinite(obj.budget) && obj.budget > 0)) &&
    Array.isArray(obj.expenses) &&
    (obj.expenses as unknown[]).every(isValidExpense) &&
    isValidDateString(obj.createdAt)
  );
}

/**
 * 验证 AppData 数据结构是否合法
 */
function isValidAppData(value: unknown): value is AppData {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.version === 'number' &&
    isFinite(obj.version) &&
    Array.isArray(obj.trips) &&
    (obj.trips as unknown[]).every(isValidTrip)
  );
}

/**
 * 将 AppData 序列化为 JSON 字符串
 */
export function serialize(data: AppData): string {
  return JSON.stringify(data);
}

/**
 * 将 JSON 字符串反序列化为 AppData
 * 处理 JSON 解析失败（parse_error）和数据结构不符合预期（corrupted_data）的情况
 */
export function deserialize(json: string): Result<AppData, DataError> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return {
      ok: false,
      error: { type: 'parse_error', message: 'JSON 解析失败：数据格式不正确' },
    };
  }

  if (!isValidAppData(parsed)) {
    return {
      ok: false,
      error: { type: 'corrupted_data', message: '数据结构损坏：不符合预期的 AppData 格式' },
    };
  }

  return { ok: true, value: parsed };
}

/**
 * 将数据保存到 localStorage
 */
export function saveData(data: AppData): void {
  try {
    const json = serialize(data);
    localStorage.setItem(STORAGE_KEY, json);
  } catch {
    // localStorage 不可用时（如隐私模式），静默处理
    console.warn('数据保存失败：localStorage 不可用');
  }
}

/**
 * 从 localStorage 加载数据
 * 如果没有存储数据，返回默认的空数据
 * 如果数据损坏或解析失败，返回 DataError
 */
export function loadData(): Result<AppData, DataError> {
  try {
    const json = localStorage.getItem(STORAGE_KEY);
    if (json === null) {
      // 没有存储数据，返回默认空数据
      return { ok: true, value: { trips: [], version: 1 } };
    }
    return deserialize(json);
  } catch {
    // localStorage 不可用时
    return {
      ok: false,
      error: { type: 'parse_error', message: '无法访问本地存储' },
    };
  }
}
