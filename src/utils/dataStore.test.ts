// ============================================================
// 数据存储层 - 单元测试
// ============================================================

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { serialize, deserialize, saveData, loadData } from './dataStore';
import type { AppData } from '../types';

/** 构造一个合法的 AppData 测试数据 */
function createTestAppData(): AppData {
  return {
    version: 1,
    trips: [
      {
        id: 'trip-1',
        name: '东京之旅',
        destination: '东京',
        startDate: '2024-03-01',
        endDate: '2024-03-07',
        budget: 15000,
        expenses: [
          {
            id: 'exp-1',
            tripId: 'trip-1',
            amount: 3500,
            category: '交通',
            note: '机票',
            date: '2024-03-01',
            createdAt: '2024-03-01T10:00:00Z',
          },
        ],
        createdAt: '2024-02-28T10:00:00Z',
      },
    ],
  };
}

describe('serialize', () => {
  it('应将 AppData 序列化为 JSON 字符串', () => {
    const data = createTestAppData();
    const json = serialize(data);
    expect(typeof json).toBe('string');
    expect(JSON.parse(json)).toEqual(data);
  });

  it('应正确处理空旅行列表', () => {
    const data: AppData = { trips: [], version: 1 };
    const json = serialize(data);
    expect(JSON.parse(json)).toEqual(data);
  });
});

describe('deserialize', () => {
  it('应将合法 JSON 字符串反序列化为 AppData', () => {
    const data = createTestAppData();
    const json = JSON.stringify(data);
    const result = deserialize(json);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual(data);
    }
  });

  it('应对非法 JSON 字符串返回 parse_error', () => {
    const result = deserialize('这不是JSON{{{');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.type).toBe('parse_error');
    }
  });

  it('应对空字符串返回 parse_error', () => {
    const result = deserialize('');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.type).toBe('parse_error');
    }
  });

  it('应对结构不符合 AppData 的 JSON 返回 corrupted_data', () => {
    const result = deserialize('{"foo": "bar"}');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.type).toBe('corrupted_data');
    }
  });

  it('应对缺少 version 字段的数据返回 corrupted_data', () => {
    const result = deserialize('{"trips": []}');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.type).toBe('corrupted_data');
    }
  });

  it('应对包含非法支出分类的数据返回 corrupted_data', () => {
    const data = createTestAppData();
    (data.trips[0].expenses[0] as unknown as Record<string, unknown>).category = '非法分类';
    const result = deserialize(JSON.stringify(data));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.type).toBe('corrupted_data');
    }
  });

  it('应对包含非正数金额的支出返回 corrupted_data', () => {
    const data = createTestAppData();
    data.trips[0].expenses[0].amount = -100;
    const result = deserialize(JSON.stringify(data));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.type).toBe('corrupted_data');
    }
  });

  it('应对 trips 不是数组的数据返回 corrupted_data', () => {
    const result = deserialize('{"version": 1, "trips": "not-array"}');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.type).toBe('corrupted_data');
    }
  });
});

describe('saveData / loadData', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('saveData 应将数据保存到 localStorage', () => {
    const data = createTestAppData();
    saveData(data);
    const stored = localStorage.getItem('travel-expense-tracker-data');
    expect(stored).not.toBeNull();
    expect(JSON.parse(stored!)).toEqual(data);
  });

  it('loadData 应从 localStorage 加载数据', () => {
    const data = createTestAppData();
    localStorage.setItem('travel-expense-tracker-data', JSON.stringify(data));
    const result = loadData();
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual(data);
    }
  });

  it('loadData 在没有存储数据时应返回默认空数据', () => {
    const result = loadData();
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({ trips: [], version: 1 });
    }
  });

  it('loadData 在数据损坏时应返回 DataError', () => {
    localStorage.setItem('travel-expense-tracker-data', '损坏的数据!!!');
    const result = loadData();
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.type).toBe('parse_error');
    }
  });

  it('saveData 在 localStorage 不可用时不应抛出异常', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    expect(() => saveData(createTestAppData())).not.toThrow();
    spy.mockRestore();
  });
});
