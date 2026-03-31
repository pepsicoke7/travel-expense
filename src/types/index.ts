// ============================================================
// 旅游记账应用 - 核心类型定义
// ============================================================

/**
 * 支出分类枚举
 * 包含六种预定义的支出类型
 */
export type ExpenseCategory = '交通' | '住宿' | '餐饮' | '门票' | '购物' | '其他';

/**
 * 旅行记录
 * 代表一次完整的旅行，包含基本信息和关联的支出列表
 */
export interface Trip {
  /** 唯一标识符（UUID） */
  id: string;
  /** 旅行名称 */
  name: string;
  /** 目的地 */
  destination: string;
  /** 起始日期（ISO 格式 YYYY-MM-DD） */
  startDate: string;
  /** 结束日期（ISO 格式 YYYY-MM-DD） */
  endDate: string;
  /** 可选预算金额 */
  budget?: number;
  /** 该旅行下的所有支出记录 */
  expenses: Expense[];
  /** 创建时间（ISO 格式） */
  createdAt: string;
}

/**
 * 支出记录
 * 代表一笔具体的支出，关联到某次旅行
 */
export interface Expense {
  /** 唯一标识符（UUID） */
  id: string;
  /** 关联的旅行 ID */
  tripId: string;
  /** 金额（正数） */
  amount: number;
  /** 支出分类 */
  category: ExpenseCategory;
  /** 备注 */
  note: string;
  /** 支出日期（ISO 格式 YYYY-MM-DD） */
  date: string;
  /** 创建时间（ISO 格式） */
  createdAt: string;
}


/**
 * 预算状态
 * 描述旅行预算的当前使用情况
 */
export interface BudgetStatus {
  /** 预算总额 */
  budgetAmount: number;
  /** 已花费金额 */
  spentAmount: number;
  /** 剩余金额 */
  remainingAmount: number;
  /** 使用百分比（0-100+） */
  usagePercent: number;
  /** 状态级别：正常 / 警告 / 已超支 */
  level: 'normal' | 'warning' | 'exceeded';
}

/**
 * 分类汇总
 * 某个支出分类的统计信息
 */
export interface CategorySummary {
  /** 支出分类 */
  category: ExpenseCategory;
  /** 该分类的总金额 */
  totalAmount: number;
  /** 占比百分比（0-100） */
  percentage: number;
}

/**
 * 每日支出
 * 某一天的支出汇总
 */
export interface DailyExpense {
  /** 日期（YYYY-MM-DD） */
  date: string;
  /** 当日总支出 */
  totalAmount: number;
}

/**
 * 总览统计
 * 所有旅行的汇总统计信息
 */
export interface OverallStats {
  /** 旅行总数 */
  totalTrips: number;
  /** 累计总支出 */
  totalExpense: number;
  /** 各旅行支出列表（按支出降序排列） */
  tripExpenses: Array<{ tripId: string; tripName: string; totalExpense: number }>;
}

/**
 * 应用全局数据
 * 存储在 localStorage 中的顶层数据结构
 */
export interface AppData {
  /** 所有旅行记录 */
  trips: Trip[];
  /** 数据版本号，用于未来数据迁移 */
  version: number;
}

// ============================================================
// 表单输入类型
// ============================================================

/**
 * 创建旅行的输入参数
 */
export interface CreateTripInput {
  /** 旅行名称 */
  name: string;
  /** 目的地 */
  destination: string;
  /** 起始日期 */
  startDate: string;
  /** 结束日期 */
  endDate: string;
  /** 可选预算金额 */
  budget?: number;
}

/**
 * 创建支出的输入参数
 */
export interface CreateExpenseInput {
  /** 金额（正数） */
  amount: number;
  /** 支出分类 */
  category: ExpenseCategory;
  /** 备注 */
  note: string;
  /** 支出日期 */
  date: string;
}

/**
 * 更新支出的输入参数（与创建支出相同）
 */
export interface UpdateExpenseInput extends CreateExpenseInput {}

// ============================================================
// 排序相关类型
// ============================================================

/** 旅行列表排序字段 */
export type TripSortField = 'startDate' | 'name' | 'totalExpense';

/** 排序方向 */
export type SortOrder = 'asc' | 'desc';

// ============================================================
// 结果与错误类型
// ============================================================

/**
 * 通用结果类型（联合类型）
 * 用于表示操作成功或失败的结果
 */
export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

/**
 * 验证错误
 * 表示表单输入验证失败时的错误信息
 */
export interface ValidationError {
  /** 出错的字段名 */
  field: string;
  /** 错误提示信息 */
  message: string;
}

/**
 * 数据错误
 * 表示数据存储层的错误
 */
export interface DataError {
  /** 错误类型：JSON 解析失败 / 数据结构损坏 */
  type: 'parse_error' | 'corrupted_data';
  /** 错误描述信息 */
  message: string;
}

/**
 * 预算提醒
 * 表示预算使用达到阈值时的提醒信息
 */
export interface BudgetAlert {
  /** 提醒类型：80% 警告 / 即将超支 / 已超支 */
  type: 'warning_80' | 'will_exceed' | 'exceeded';
  /** 提醒消息 */
  message: string;
  /** 超出金额（仅在超支时有值） */
  overAmount?: number;
}
