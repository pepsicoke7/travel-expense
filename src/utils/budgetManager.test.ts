// ============================================================
// 预算管理器 - 单元测试
// ============================================================

import { describe, it, expect } from 'vitest';
import { setBudget, getBudgetStatus, checkBudgetAlert } from './budgetManager';

describe('setBudget', () => {
  it('应使用正数金额成功设置预算', () => {
    const result = setBudget('trip-1', 10000);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe(10000);
    }
  });

  it('应接受小数金额', () => {
    const result = setBudget('trip-1', 99.99);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe(99.99);
    }
  });

  it('应拒绝零金额', () => {
    const result = setBudget('trip-1', 0);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.field).toBe('budget');
      expect(result.error.message).toBe('预算金额必须大于零');
    }
  });

  it('应拒绝负数金额', () => {
    const result = setBudget('trip-1', -500);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toBe('预算金额必须大于零');
    }
  });

  it('应拒绝 Infinity', () => {
    const result = setBudget('trip-1', Infinity);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toBe('预算金额必须大于零');
    }
  });

  it('应拒绝 NaN', () => {
    const result = setBudget('trip-1', NaN);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toBe('预算金额必须大于零');
    }
  });
});

describe('getBudgetStatus', () => {
  it('低于 80% 使用率应返回 normal 状态', () => {
    const status = getBudgetStatus(10000, 5000);
    expect(status.budgetAmount).toBe(10000);
    expect(status.spentAmount).toBe(5000);
    expect(status.remainingAmount).toBe(5000);
    expect(status.usagePercent).toBe(50);
    expect(status.level).toBe('normal');
  });

  it('恰好 80% 使用率应返回 warning 状态', () => {
    const status = getBudgetStatus(10000, 8000);
    expect(status.remainingAmount).toBe(2000);
    expect(status.usagePercent).toBe(80);
    expect(status.level).toBe('warning');
  });

  it('90% 使用率应返回 warning 状态', () => {
    const status = getBudgetStatus(10000, 9000);
    expect(status.usagePercent).toBe(90);
    expect(status.level).toBe('warning');
  });

  it('恰好 100% 使用率应返回 warning 状态', () => {
    const status = getBudgetStatus(10000, 10000);
    expect(status.remainingAmount).toBe(0);
    expect(status.usagePercent).toBe(100);
    expect(status.level).toBe('warning');
  });

  it('超过 100% 使用率应返回 exceeded 状态', () => {
    const status = getBudgetStatus(10000, 12000);
    expect(status.remainingAmount).toBe(-2000);
    expect(status.usagePercent).toBe(120);
    expect(status.level).toBe('exceeded');
  });

  it('零支出应返回 normal 状态', () => {
    const status = getBudgetStatus(5000, 0);
    expect(status.remainingAmount).toBe(5000);
    expect(status.usagePercent).toBe(0);
    expect(status.level).toBe('normal');
  });

  it('应正确处理小数金额', () => {
    const status = getBudgetStatus(100, 79.99);
    expect(status.level).toBe('normal');
    expect(status.remainingAmount).toBeCloseTo(20.01);
  });
});

describe('checkBudgetAlert', () => {
  it('新增支出后将超预算应返回 will_exceed', () => {
    const alert = checkBudgetAlert(10000, 9000, 2000);
    expect(alert).not.toBeNull();
    expect(alert!.type).toBe('will_exceed');
    expect(alert!.overAmount).toBe(1000);
  });

  it('新增支出后恰好等于预算应返回 warning_80（不超预算）', () => {
    // currentTotal=9000, newAmount=1000, projected=10000, 不超预算
    // 但 currentTotal >= 80% budget，所以返回 warning_80
    const alert = checkBudgetAlert(10000, 9000, 1000);
    expect(alert).not.toBeNull();
    expect(alert!.type).toBe('warning_80');
  });

  it('当前已达 80% 且未超预算应返回 warning_80', () => {
    const alert = checkBudgetAlert(10000, 8000, 500);
    expect(alert).not.toBeNull();
    expect(alert!.type).toBe('warning_80');
  });

  it('当前支出低于 80% 且新增后不超预算应返回 null', () => {
    const alert = checkBudgetAlert(10000, 5000, 1000);
    expect(alert).toBeNull();
  });

  it('零支出加零新增应返回 null', () => {
    const alert = checkBudgetAlert(10000, 0, 0);
    expect(alert).toBeNull();
  });

  it('新增支出后刚好超预算一点应返回 will_exceed', () => {
    const alert = checkBudgetAlert(10000, 9999, 2);
    expect(alert).not.toBeNull();
    expect(alert!.type).toBe('will_exceed');
    expect(alert!.overAmount).toBe(1);
  });

  it('当前支出恰好等于 80% 预算且新增后不超应返回 warning_80', () => {
    const alert = checkBudgetAlert(1000, 800, 100);
    expect(alert).not.toBeNull();
    expect(alert!.type).toBe('warning_80');
  });

  it('当前已超预算且新增金额为零应返回 will_exceed（因为总额仍超预算）', () => {
    const alert = checkBudgetAlert(10000, 12000, 0);
    expect(alert).not.toBeNull();
    expect(alert!.type).toBe('will_exceed');
  });

  it('当前已超预算但新增为负使总额不超时应返回 exceeded', () => {
    // 这是一个边界情况：currentTotal > budget 但 projectedTotal <= budget
    // 实际业务中不太可能出现负数新增金额，但逻辑上应覆盖
    const alert = checkBudgetAlert(10000, 11000, -2000);
    expect(alert).not.toBeNull();
    expect(alert!.type).toBe('exceeded');
  });
});
