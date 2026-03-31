# 实现计划：旅游记账应用

## 概述

基于 React 18 + TypeScript + Vite 构建旅游记账单页应用。采用分层架构，先实现核心数据模型和业务逻辑层，再构建 UI 组件和页面，最后集成路由和状态管理。所有数据持久化在 localStorage 中，使用 Recharts 实现图表，CSS Modules 实现样式。

## 任务

- [x] 1. 项目初始化与基础架构搭建
  - [x] 1.1 初始化 Vite + React + TypeScript 项目，安装依赖（react-router-dom、recharts、vitest、fast-check、@testing-library/react）
    - 配置 Vite、TypeScript、Vitest
    - 创建基本目录结构：`src/types/`、`src/utils/`、`src/context/`、`src/components/`、`src/pages/`、`src/styles/`
    - _需求：全局_

  - [x] 1.2 定义核心类型和接口
    - 在 `src/types/index.ts` 中定义所有数据模型：`Trip`、`Expense`、`ExpenseCategory`、`BudgetStatus`、`CategorySummary`、`DailyExpense`、`OverallStats`、`AppData`、`CreateTripInput`、`CreateExpenseInput`、`UpdateExpenseInput`、`Result`、`ValidationError`、`DataError`、`BudgetAlert`、`TripSortField`、`SortOrder`
    - _需求：1.1, 4.1, 4.4, 12.1, 13.1_

- [x] 2. 数据存储层实现
  - [x] 2.1 实现序列化与反序列化模块
    - 在 `src/utils/dataStore.ts` 中实现 `serialize`、`deserialize`、`saveData`、`loadData` 函数
    - localStorage key 为 `travel-expense-tracker-data`
    - 处理 JSON 解析失败和数据结构不符合预期的情况，返回 `DataError`
    - _需求：10.1, 10.2, 10.3, 11.1, 11.2, 11.3_

  - [ ]* 2.2 编写属性测试：序列化往返一致性
    - **属性 15：序列化往返一致性**
    - **验证需求：10.1, 10.2, 11.1, 11.2, 11.3**

  - [ ]* 2.3 编写属性测试：损坏数据优雅处理
    - **属性 16：损坏数据优雅处理**
    - **验证需求：10.3**

- [x] 3. 旅行管理器实现
  - [x] 3.1 实现旅行管理核心逻辑
    - 在 `src/utils/tripManager.ts` 中实现 `createTrip`、`getTrips`、`getTripDetail`、`calculateTripTotal` 函数
    - 实现输入验证：空名称拒绝、非法日期范围拒绝、UUID 生成
    - _需求：1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 3.1, 3.2_

  - [ ]* 3.2 编写属性测试：创建旅行保留所有字段
    - **属性 1：创建旅行保留所有字段**
    - **验证需求：1.1**

  - [ ]* 3.3 编写属性测试：空名称旅行被拒绝
    - **属性 2：空名称旅行被拒绝**
    - **验证需求：1.2**

  - [ ]* 3.4 编写属性测试：非法日期范围被拒绝
    - **属性 3：非法日期范围被拒绝**
    - **验证需求：1.3**

  - [ ]* 3.5 编写属性测试：旅行 ID 唯一性
    - **属性 4：旅行 ID 唯一性**
    - **验证需求：1.4**

  - [ ]* 3.6 编写属性测试：旅行列表排序正确性
    - **属性 5：旅行列表排序正确性**
    - **验证需求：2.2, 2.3**

  - [ ]* 3.7 编写属性测试：旅行总支出等于支出金额之和
    - **属性 6：旅行总支出等于支出金额之和**
    - **验证需求：3.2, 5.3, 6.2**

- [x] 4. 支出管理器实现
  - [x] 4.1 实现支出管理核心逻辑
    - 在 `src/utils/expenseManager.ts` 中实现 `addExpense`、`updateExpense`、`deleteExpense`、`validateExpenseInput` 函数
    - 实现输入验证：非正数金额拒绝、未选分类默认"其他"
    - 支出列表按日期降序排列
    - _需求：4.1, 4.2, 4.3, 4.5, 4.6, 5.1, 5.2, 5.3, 6.1, 6.2, 6.3_

  - [ ]* 4.2 编写属性测试：创建支出保留所有字段
    - **属性 8：创建支出保留所有字段**
    - **验证需求：4.1**

  - [ ]* 4.3 编写属性测试：非正数金额被拒绝
    - **属性 9：非正数金额被拒绝**
    - **验证需求：4.3**

  - [ ]* 4.4 编写属性测试：更新支出反映新值
    - **属性 10：更新支出反映新值**
    - **验证需求：5.2**

  - [ ]* 4.5 编写属性测试：删除支出后记录消失
    - **属性 11：删除支出后记录消失**
    - **验证需求：6.2**

  - [ ]* 4.6 编写属性测试：支出记录按日期降序排列
    - **属性 7：支出记录按日期降序排列**
    - **验证需求：3.3**

- [x] 5. 检查点 - 核心业务逻辑验证
  - 确保所有测试通过，如有问题请向用户确认。

- [x] 6. 统计引擎实现
  - [x] 6.1 实现统计分析核心逻辑
    - 在 `src/utils/statisticsEngine.ts` 中实现 `getCategoryBreakdown`、`getDailyTrend`、`getOverallStats` 函数
    - 分类汇总：计算各分类金额和占比，省略零支出分类
    - 每日趋势：覆盖起止日期完整范围，无支出日期金额为零
    - 总览统计：旅行总数、累计总支出、按支出降序排列
    - _需求：7.1, 7.2, 7.3, 7.4, 8.1, 8.2, 8.3, 8.4, 9.1, 9.2, 9.3_

  - [ ]* 6.2 编写属性测试：分类汇总不变量
    - **属性 12：分类汇总不变量**
    - **验证需求：7.1, 7.3, 7.4**

  - [ ]* 6.3 编写属性测试：每日汇总不变量
    - **属性 13：每日汇总不变量**
    - **验证需求：8.1, 8.3, 8.4**

  - [ ]* 6.4 编写属性测试：总览统计正确性
    - **属性 14：总览统计正确性**
    - **验证需求：9.1, 9.2, 9.3**

- [x] 7. 预算管理器实现
  - [x] 7.1 实现预算管理核心逻辑
    - 在 `src/utils/budgetManager.ts` 中实现 `setBudget`、`getBudgetStatus`、`checkBudgetAlert` 函数
    - 预算状态计算：剩余金额、使用百分比、状态级别（normal/warning/exceeded）
    - 超支预检查：新增支出后是否超预算
    - _需求：12.1, 12.2, 12.3, 12.4, 12.5, 13.1, 13.2, 13.3, 14.1, 14.2, 14.3, 14.4_

  - [ ]* 7.2 编写属性测试：非正数预算被拒绝
    - **属性 17：非正数预算被拒绝**
    - **验证需求：12.3**

  - [ ]* 7.3 编写属性测试：预算设置持久化
    - **属性 18：预算设置持久化**
    - **验证需求：12.4, 12.5**

  - [ ]* 7.4 编写属性测试：预算状态计算正确性
    - **属性 19：预算状态计算正确性**
    - **验证需求：13.1, 13.2, 14.1, 14.2**

  - [ ]* 7.5 编写属性测试：新增支出超支预检查
    - **属性 20：新增支出超支预检查**
    - **验证需求：14.3**

- [x] 8. 检查点 - 全部业务逻辑验证
  - 确保所有测试通过，如有问题请向用户确认。

- [x] 9. 全局状态管理
  - [x] 9.1 实现 AppContext 和 Reducer
    - 在 `src/context/AppContext.tsx` 中创建 Context 和 Provider
    - 实现 reducer 处理所有 Action 类型：`ADD_TRIP`、`UPDATE_TRIP`、`DELETE_TRIP`、`ADD_EXPENSE`、`UPDATE_EXPENSE`、`DELETE_EXPENSE`、`SET_BUDGET`、`LOAD_DATA`
    - 在 reducer 中每次状态变更后调用 `saveData` 持久化数据
    - Provider 初始化时调用 `loadData` 加载数据
    - _需求：10.1, 10.2, 10.3, 4.6, 5.2, 6.2, 12.4, 13.3_

- [x] 10. 通用 UI 组件实现
  - [x] 10.1 实现表单组件
    - 创建 `src/components/TripForm.tsx`：旅行创建/编辑表单，包含名称、目的地、起止日期、可选预算字段，集成输入验证
    - 创建 `src/components/ExpenseForm.tsx`：支出添加/编辑表单，包含金额、分类选择、备注、日期字段，集成输入验证
    - _需求：1.1, 1.2, 1.3, 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 12.1, 12.3_

  - [x] 10.2 实现预算相关组件
    - 创建 `src/components/BudgetBar.tsx`：预算进度条，根据使用百分比显示不同颜色
    - 创建 `src/components/BudgetAlert.tsx`：预算警告提示组件，支持 warning/exceeded 状态
    - _需求：13.1, 13.2, 14.1, 14.2, 14.4_

  - [x] 10.3 实现辅助组件
    - 创建 `src/components/ConfirmDialog.tsx`：确认对话框，用于删除确认
    - 创建 `src/components/EmptyState.tsx`：空状态提示组件
    - _需求：6.1, 6.3, 2.4_

- [x] 11. 图表组件实现
  - [x] 11.1 实现统计图表组件
    - 创建 `src/components/CategoryPieChart.tsx`：使用 Recharts PieChart 展示分类支出饼图
    - 创建 `src/components/DailyTrendChart.tsx`：使用 Recharts LineChart/BarChart 展示每日花费趋势
    - _需求：7.2, 8.2_

- [x] 12. 页面组件实现
  - [x] 12.1 实现旅行列表页和创建旅行页
    - 创建 `src/pages/TripListPage.tsx`：展示旅行列表、总览统计、排序切换、空状态处理
    - 创建 `src/pages/CreateTripPage.tsx`：旅行创建表单页，提交后跳转到旅行详情
    - _需求：2.1, 2.2, 2.3, 2.4, 1.1, 1.2, 1.3, 1.4, 9.1, 9.2, 9.3_

  - [x] 12.2 实现旅行详情页
    - 创建 `src/pages/TripDetailPage.tsx`：展示旅行基本信息、支出列表（按日期降序）、总支出、预算状态、添加/编辑/删除支出入口
    - 处理旅行不存在的情况，显示提示并引导返回列表
    - _需求：3.1, 3.2, 3.3, 6.1, 6.2, 6.3, 13.1, 13.2, 13.3, 13.4, 14.1, 14.2, 14.4_

  - [x] 12.3 实现支出添加和编辑页
    - 创建 `src/pages/AddExpensePage.tsx`：添加支出表单页，集成超支预警提示
    - 创建 `src/pages/EditExpensePage.tsx`：编辑支出表单页，预填充当前数据
    - _需求：4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 5.1, 5.2, 5.3, 14.3_

  - [x] 12.4 实现旅行统计页
    - 创建 `src/pages/TripStatsPage.tsx`：展示分类饼图、分类列表、每日趋势图
    - _需求：7.1, 7.2, 7.3, 7.4, 8.1, 8.2, 8.3, 8.4_

- [x] 13. 路由与应用入口集成
  - [x] 13.1 配置路由和应用入口
    - 在 `src/App.tsx` 中配置 React Router v6 路由：`/`、`/trip/new`、`/trip/:id`、`/trip/:id/stats`、`/trip/:id/expense/new`、`/trip/:id/expense/:eid/edit`
    - 用 AppProvider 包裹路由
    - 在 `src/main.tsx` 中渲染 App 组件
    - _需求：全局路由_

- [x] 14. 响应式样式实现
  - [x] 14.1 实现响应式布局和全局样式
    - 使用 CSS Modules 为各组件编写样式
    - 实现媒体查询断点：768px 区分移动端和桌面端布局
    - 确保所有交互元素最小触控区域 44x44 像素
    - _需求：15.1, 15.2, 15.3_

- [x] 15. 最终检查点 - 全部功能集成验证
  - 确保所有测试通过，如有问题请向用户确认。

## 备注

- 标记 `*` 的任务为可选任务，可跳过以加快 MVP 开发速度
- 每个任务都引用了具体的需求编号，确保需求可追溯
- 检查点任务用于阶段性验证，确保增量开发的正确性
- 属性测试验证通用正确性属性，单元测试验证具体示例和边界情况
