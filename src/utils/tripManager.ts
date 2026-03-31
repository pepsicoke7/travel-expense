// ============================================================
// 旅行管理器 - 旅行的创建、查询、排序与总支出计算
// ============================================================

import type {
  CreateTripInput,
  Expense,
  Result,
  SortOrder,
  Trip,
  TripSortField,
  ValidationError,
} from '../types';

/**
 * 创建旅行记录
 * 验证输入后生成包含唯一 ID 的旅行对象
 *
 * 验证规则：
 * - 名称不能为空或纯空白字符
 * - 结束日期不能早于起始日期
 */
export function createTrip(input: CreateTripInput): Result<Trip, ValidationError> {
  // 验证名称非空（纯空白也拒绝）
  if (!input.name || input.name.trim().length === 0) {
    return {
      ok: false,
      error: { field: 'name', message: '请输入旅行名称' },
    };
  }

  // 验证日期范围：结束日期不能早于起始日期
  if (input.endDate < input.startDate) {
    return {
      ok: false,
      error: { field: 'endDate', message: '结束日期不能早于起始日期' },
    };
  }

  // 生成旅行记录
  const trip: Trip = {
    id: crypto.randomUUID(),
    name: input.name,
    destination: input.destination,
    startDate: input.startDate,
    endDate: input.endDate,
    budget: input.budget,
    expenses: [],
    createdAt: new Date().toISOString(),
  };

  return { ok: true, value: trip };
}

/**
 * 获取排序后的旅行列表
 * 支持按起始日期、名称、总支出排序，支持升序和降序
 */
export function getTrips(trips: Trip[], sortBy: TripSortField, order: SortOrder): Trip[] {
  // 复制数组，避免修改原数据
  const sorted = [...trips];

  sorted.sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'startDate':
        // 按日期字符串比较（ISO 格式天然支持字典序比较）
        comparison = a.startDate.localeCompare(b.startDate);
        break;
      case 'name':
        // 按名称字典序比较
        comparison = a.name.localeCompare(b.name);
        break;
      case 'totalExpense':
        // 按总支出金额比较
        comparison = calculateTripTotal(a.expenses) - calculateTripTotal(b.expenses);
        break;
    }

    // 降序时反转比较结果
    return order === 'desc' ? -comparison : comparison;
  });

  return sorted;
}

/**
 * 根据旅行 ID 获取旅行详情
 * 找不到时返回 null
 */
export function getTripDetail(trips: Trip[], tripId: string): Trip | null {
  return trips.find((trip) => trip.id === tripId) ?? null;
}

/**
 * 计算旅行总支出
 * 返回所有支出金额的算术和
 */
export function calculateTripTotal(expenses: Expense[]): number {
  return expenses.reduce((sum, expense) => sum + expense.amount, 0);
}
