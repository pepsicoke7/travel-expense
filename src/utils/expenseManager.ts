// ============================================================
// 支出管理器 - 支出记录的添加、编辑、删除与输入验证
// ============================================================

import type {
  CreateExpenseInput,
  Expense,
  Result,
  Trip,
  UpdateExpenseInput,
  ValidationError,
} from '../types';

/**
 * 验证支出输入
 * 检查金额是否为正数，返回所有验证错误列表
 */
export function validateExpenseInput(input: CreateExpenseInput): ValidationError[] {
  const errors: ValidationError[] = [];

  // 验证金额：NaN 或未填写视为空
  if (input.amount === undefined || input.amount === null || Number.isNaN(input.amount)) {
    errors.push({ field: 'amount', message: '请输入支出金额' });
  } else if (input.amount <= 0) {
    // 金额必须大于零
    errors.push({ field: 'amount', message: '金额必须大于零' });
  }

  return errors;
}

/**
 * 添加支出记录
 * 验证输入后生成包含唯一 ID 的支出对象
 *
 * 验证规则：
 * - 金额必须为正数
 * - 未选分类时默认为"其他"
 */
export function addExpense(
  tripId: string,
  input: CreateExpenseInput,
): Result<Expense, ValidationError> {
  // 未选分类时默认为"其他"
  const normalizedInput: CreateExpenseInput = {
    ...input,
    category: input.category || '其他',
  };

  // 验证输入
  const errors = validateExpenseInput(normalizedInput);
  if (errors.length > 0) {
    return { ok: false, error: errors[0] };
  }

  // 生成支出记录
  const expense: Expense = {
    id: crypto.randomUUID(),
    tripId,
    amount: normalizedInput.amount,
    category: normalizedInput.category,
    note: normalizedInput.note,
    date: normalizedInput.date,
    createdAt: new Date().toISOString(),
  };

  return { ok: true, value: expense };
}

/**
 * 编辑支出记录
 * 验证输入后返回更新后的支出对象
 */
export function updateExpense(
  expenseId: string,
  input: UpdateExpenseInput,
): Result<Expense, ValidationError> {
  // 未选分类时默认为"其他"
  const normalizedInput: UpdateExpenseInput = {
    ...input,
    category: input.category || '其他',
  };

  // 验证输入
  const errors = validateExpenseInput(normalizedInput);
  if (errors.length > 0) {
    return { ok: false, error: errors[0] };
  }

  // 构建更新后的支出记录（保留原 ID 和创建时间）
  const expense: Expense = {
    id: expenseId,
    tripId: '', // 由调用方在 reducer 中关联
    amount: normalizedInput.amount,
    category: normalizedInput.category,
    note: normalizedInput.note,
    date: normalizedInput.date,
    createdAt: new Date().toISOString(),
  };

  return { ok: true, value: expense };
}

/**
 * 删除支出记录
 * 从指定旅行的支出列表中移除目标支出，返回更新后的旅行列表
 * 如果支出不存在则静默忽略
 */
export function deleteExpense(tripId: string, expenseId: string, trips: Trip[]): Trip[] {
  return trips.map((trip) => {
    if (trip.id !== tripId) {
      return trip;
    }
    // 过滤掉目标支出
    return {
      ...trip,
      expenses: trip.expenses.filter((e) => e.id !== expenseId),
    };
  });
}

/**
 * 按日期降序排列支出列表
 * 返回新数组，不修改原数据
 */
export function sortExpensesByDate(expenses: Expense[]): Expense[] {
  return [...expenses].sort((a, b) => b.date.localeCompare(a.date));
}
