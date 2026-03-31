# 需求文档

## 简介

个人旅游记账应用，用于记录和管理每次旅行中的各项支出。用户可以创建旅行、记录支出、查看分类统计和花费趋势。应用为单用户本地应用，使用 React + TypeScript 开发，数据持久化存储在浏览器本地，支持手机和桌面浏览器的响应式布局。

## 术语表

- **应用（App）**: 个人旅游记账应用的整体系统
- **旅行管理器（Trip_Manager）**: 负责旅行的创建、查看、编辑和删除的模块
- **支出管理器（Expense_Manager）**: 负责支出记录的添加、编辑和删除的模块
- **统计引擎（Statistics_Engine）**: 负责对支出数据进行分类汇总和趋势分析的模块
- **数据存储层（Data_Store）**: 负责将数据持久化到浏览器本地存储的模块
- **旅行（Trip）**: 一次旅行记录，包含名称、目的地、起止日期等信息
- **支出（Expense）**: 一笔支出记录，包含金额、分类、备注、日期等信息
- **支出分类（Expense_Category）**: 支出的类型，包括交通、住宿、餐饮、门票、购物、其他
- **预算管理器（Budget_Manager）**: 负责旅行预算的设置、追踪和超支提醒的模块
- **预算（Budget）**: 为某次旅行设定的计划支出上限金额

## 需求

### 需求 1：创建旅行

**用户故事：** 作为用户，我想创建一次旅行记录，以便开始记录该旅行中的各项支出。

#### 验收标准

1. WHEN 用户提交旅行创建表单，THE Trip_Manager SHALL 创建一条包含名称、目的地、起始日期和结束日期的旅行记录
2. WHEN 用户未填写旅行名称，THE Trip_Manager SHALL 显示"请输入旅行名称"的错误提示并阻止提交
3. WHEN 用户设置的结束日期早于起始日期，THE Trip_Manager SHALL 显示"结束日期不能早于起始日期"的错误提示并阻止提交
4. WHEN 旅行创建成功，THE Trip_Manager SHALL 为该旅行生成唯一标识符并将数据持久化到 Data_Store

### 需求 2：查看旅行列表

**用户故事：** 作为用户，我想查看所有旅行记录的列表，以便快速找到某次旅行。

#### 验收标准

1. THE Trip_Manager SHALL 在旅行列表中展示每条旅行的名称、目的地、起止日期和总支出金额
2. THE Trip_Manager SHALL 默认按起始日期降序排列旅行列表（最近的旅行排在最前）
3. WHEN 用户切换排序方式，THE Trip_Manager SHALL 按用户选择的排序方式重新排列旅行列表
4. WHEN 没有任何旅行记录时，THE Trip_Manager SHALL 显示空状态提示并引导用户创建第一次旅行

### 需求 3：旅行详情

**用户故事：** 作为用户，我想查看某次旅行的详细信息，以便了解该旅行的所有支出和总花费。

#### 验收标准

1. WHEN 用户点击旅行列表中的某条旅行，THE Trip_Manager SHALL 展示该旅行的详情页，包含旅行基本信息和所有支出记录
2. THE Trip_Manager SHALL 在旅行详情页顶部显示该旅行的总支出金额
3. THE Trip_Manager SHALL 在旅行详情页中按日期降序排列支出记录列表


### 需求 4：添加支出记录

**用户故事：** 作为用户，我想在某次旅行下添加一笔支出记录，以便追踪该旅行的花费明细。

#### 验收标准

1. WHEN 用户在旅行详情页提交支出表单，THE Expense_Manager SHALL 创建一条包含金额、分类、备注和日期的支出记录，并关联到当前旅行
2. WHEN 用户未填写支出金额，THE Expense_Manager SHALL 显示"请输入支出金额"的错误提示并阻止提交
3. WHEN 用户输入的金额为非正数，THE Expense_Manager SHALL 显示"金额必须大于零"的错误提示并阻止提交
4. THE Expense_Manager SHALL 提供以下支出分类供用户选择：交通、住宿、餐饮、门票、购物、其他
5. WHEN 用户未选择支出分类，THE Expense_Manager SHALL 默认将分类设置为"其他"
6. WHEN 支出记录创建成功，THE Expense_Manager SHALL 将数据持久化到 Data_Store 并更新旅行详情页的支出列表和总金额

### 需求 5：编辑支出记录

**用户故事：** 作为用户，我想编辑已有的支出记录，以便修正错误或更新信息。

#### 验收标准

1. WHEN 用户点击某条支出记录的编辑按钮，THE Expense_Manager SHALL 展示预填充了当前数据的编辑表单
2. WHEN 用户提交编辑后的支出表单，THE Expense_Manager SHALL 更新该支出记录并持久化到 Data_Store
3. WHEN 支出记录更新成功，THE Expense_Manager SHALL 同步更新旅行详情页的支出列表和总金额

### 需求 6：删除支出记录

**用户故事：** 作为用户，我想删除错误的支出记录，以便保持账目准确。

#### 验收标准

1. WHEN 用户点击某条支出记录的删除按钮，THE Expense_Manager SHALL 显示确认对话框，要求用户确认删除操作
2. WHEN 用户确认删除，THE Expense_Manager SHALL 从 Data_Store 中移除该支出记录并更新旅行详情页的支出列表和总金额
3. WHEN 用户取消删除，THE Expense_Manager SHALL 关闭确认对话框且不做任何修改

### 需求 7：按分类汇总支出

**用户故事：** 作为用户，我想查看某次旅行中各分类的支出汇总，以便了解钱花在了哪些方面。

#### 验收标准

1. WHEN 用户查看旅行统计页面，THE Statistics_Engine SHALL 按支出分类汇总该旅行的支出金额
2. THE Statistics_Engine SHALL 以饼图形式展示各分类的支出占比
3. THE Statistics_Engine SHALL 同时以列表形式展示各分类的支出金额和占比百分比
4. WHEN 某个分类没有支出记录，THE Statistics_Engine SHALL 在汇总中省略该分类

### 需求 8：每日花费趋势

**用户故事：** 作为用户，我想查看某次旅行中每天的花费趋势，以便了解消费节奏。

#### 验收标准

1. WHEN 用户查看旅行统计页面，THE Statistics_Engine SHALL 按日期汇总该旅行的每日支出总额
2. THE Statistics_Engine SHALL 以折线图或柱状图形式展示每日花费趋势
3. THE Statistics_Engine SHALL 在趋势图中覆盖旅行起始日期到结束日期的完整时间范围
4. WHEN 某天没有支出记录，THE Statistics_Engine SHALL 将该天的支出金额显示为零

### 需求 9：所有旅行总支出统计

**用户故事：** 作为用户，我想查看所有旅行的总支出统计，以便了解整体旅行花费情况。

#### 验收标准

1. THE Statistics_Engine SHALL 在总览页面显示所有旅行的累计总支出金额
2. THE Statistics_Engine SHALL 在总览页面显示旅行总数
3. THE Statistics_Engine SHALL 在总览页面按旅行列出每次旅行的总支出金额，并按支出金额降序排列

### 需求 10：数据持久化

**用户故事：** 作为用户，我想让数据在关闭浏览器后仍然保留，以便下次打开时继续使用。

#### 验收标准

1. WHEN 旅行或支出数据发生变更，THE Data_Store SHALL 将变更后的数据持久化到浏览器的 localStorage 或 IndexedDB
2. WHEN 应用启动时，THE Data_Store SHALL 从本地存储中加载所有旅行和支出数据
3. IF 本地存储中的数据格式损坏或无法解析，THEN THE Data_Store SHALL 显示数据恢复失败的提示并初始化为空数据状态

### 需求 11：数据序列化与反序列化

**用户故事：** 作为用户，我想让数据能够正确地保存和读取，以便数据不会在存取过程中丢失或损坏。

#### 验收标准

1. THE Data_Store SHALL 将旅行和支出数据序列化为 JSON 格式后存储到本地
2. THE Data_Store SHALL 从本地存储中读取 JSON 数据并反序列化为应用内部数据结构
3. 对于所有合法的旅行和支出数据，序列化后再反序列化 SHALL 产生与原始数据等价的对象（往返一致性）

### 需求 12：设置旅行预算

**用户故事：** 作为用户，我想为每次旅行设置一个预算金额，以便控制旅行花费在合理范围内。

#### 验收标准

1. WHEN 用户创建旅行时，THE Budget_Manager SHALL 提供可选的预算金额输入字段
2. WHEN 用户在旅行详情页点击设置预算，THE Budget_Manager SHALL 展示预算设置表单，允许用户输入预算金额
3. WHEN 用户输入的预算金额为非正数，THE Budget_Manager SHALL 显示"预算金额必须大于零"的错误提示并阻止提交
4. WHEN 预算设置成功，THE Budget_Manager SHALL 将预算数据持久化到 Data_Store 并关联到当前旅行
5. WHEN 用户修改已有预算金额，THE Budget_Manager SHALL 更新预算数据并持久化到 Data_Store

### 需求 13：预算使用情况追踪

**用户故事：** 作为用户，我想实时查看旅行预算的使用情况，以便了解剩余可用预算。

#### 验收标准

1. WHILE 旅行已设置预算，THE Budget_Manager SHALL 在旅行详情页显示预算总额、已花费金额和剩余预算金额
2. WHILE 旅行已设置预算，THE Budget_Manager SHALL 以进度条形式展示预算使用百分比
3. WHEN 支出记录发生增加、编辑或删除，THE Budget_Manager SHALL 同步更新预算使用情况的显示
4. WHEN 旅行未设置预算，THE Budget_Manager SHALL 在旅行详情页显示"未设置预算"的提示并引导用户设置预算

### 需求 14：预算超支提醒

**用户故事：** 作为用户，我想在支出接近或超过预算时收到提醒，以便及时调整消费计划。

#### 验收标准

1. WHEN 旅行累计支出达到预算金额的 80%，THE Budget_Manager SHALL 显示黄色警告提示"已使用 80% 预算，请注意控制支出"
2. WHEN 旅行累计支出超过预算金额，THE Budget_Manager SHALL 显示红色警告提示"已超出预算"并展示超出金额
3. WHEN 用户添加一笔支出后累计金额将超过预算，THE Budget_Manager SHALL 在支出提交前显示超支预警，但允许用户确认后继续提交
4. WHILE 旅行累计支出已超过预算，THE Budget_Manager SHALL 在旅行详情页持续显示超支状态标识

### 需求 15：响应式设计

**用户故事：** 作为用户，我想在手机和桌面浏览器上都能舒适地使用应用，以便随时随地记录支出。

#### 验收标准

1. THE App SHALL 在视口宽度小于 768px 时采用移动端布局
2. THE App SHALL 在视口宽度大于等于 768px 时采用桌面端布局
3. THE App SHALL 确保所有交互元素（按钮、输入框、链接）在移动端的最小触控区域为 44x44 像素
