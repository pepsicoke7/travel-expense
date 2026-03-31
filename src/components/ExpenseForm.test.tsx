// ============================================================
// ExpenseForm 组件测试
// 验证表单渲染、输入验证、添加/编辑模式、提交行为
// ============================================================

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import ExpenseForm from './ExpenseForm';

describe('ExpenseForm', () => {
  it('渲染所有表单字段', () => {
    render(<ExpenseForm onSubmit={vi.fn()} />);

    expect(screen.getByLabelText(/金额/)).toBeInTheDocument();
    expect(screen.getByLabelText(/分类/)).toBeInTheDocument();
    expect(screen.getByLabelText(/备注/)).toBeInTheDocument();
    expect(screen.getByLabelText(/日期/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '添加支出' })).toBeInTheDocument();
  });

  it('分类下拉框包含 6 种分类选项', () => {
    render(<ExpenseForm onSubmit={vi.fn()} />);

    const select = screen.getByLabelText(/分类/) as HTMLSelectElement;
    const options = Array.from(select.options).map((o) => o.value);

    expect(options).toEqual(['交通', '住宿', '餐饮', '门票', '购物', '其他']);
  });

  it('金额为空时显示验证错误', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ExpenseForm onSubmit={onSubmit} />);

    // 金额留空，直接提交
    await user.click(screen.getByRole('button', { name: '添加支出' }));

    expect(screen.getByText('请输入支出金额')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('金额为非正数时显示验证错误', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ExpenseForm onSubmit={onSubmit} />);

    const amountInput = screen.getByLabelText(/金额/);
    await user.type(amountInput, '0');
    await user.click(screen.getByRole('button', { name: '添加支出' }));

    expect(screen.getByText('金额必须大于零')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('验证通过时调用 onSubmit 回调', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ExpenseForm onSubmit={onSubmit} />);

    const amountInput = screen.getByLabelText(/金额/);
    await user.type(amountInput, '150');

    // 选择分类
    const select = screen.getByLabelText(/分类/);
    await user.selectOptions(select, '餐饮');

    await user.click(screen.getByRole('button', { name: '添加支出' }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const input = onSubmit.mock.calls[0][0];
    expect(input.amount).toBe(150);
    expect(input.category).toBe('餐饮');
  });

  it('编辑模式下预填充数据并显示"保存修改"按钮', () => {
    render(
      <ExpenseForm
        onSubmit={vi.fn()}
        initialValues={{
          amount: 200,
          category: '住宿',
          note: '酒店',
          date: '2024-06-01',
        }}
      />,
    );

    expect(screen.getByLabelText(/金额/)).toHaveValue(200);
    expect(screen.getByLabelText(/分类/)).toHaveValue('住宿');
    expect(screen.getByLabelText(/备注/)).toHaveValue('酒店');
    expect(screen.getByLabelText(/日期/)).toHaveValue('2024-06-01');
    expect(screen.getByRole('button', { name: '保存修改' })).toBeInTheDocument();
  });

  it('未选分类时默认为"其他"', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ExpenseForm onSubmit={onSubmit} />);

    // 只填金额，不改分类
    const amountInput = screen.getByLabelText(/金额/);
    await user.type(amountInput, '50');
    await user.click(screen.getByRole('button', { name: '添加支出' }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0].category).toBe('其他');
  });
});
