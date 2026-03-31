// ============================================================
// TripForm 组件测试
// 验证表单渲染、输入验证、提交行为
// ============================================================

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import TripForm from './TripForm';

describe('TripForm', () => {
  it('渲染所有表单字段', () => {
    render(<TripForm onSubmit={vi.fn()} />);

    expect(screen.getByLabelText(/旅行名称/)).toBeInTheDocument();
    expect(screen.getByLabelText(/目的地/)).toBeInTheDocument();
    expect(screen.getByLabelText(/起始日期/)).toBeInTheDocument();
    expect(screen.getByLabelText(/结束日期/)).toBeInTheDocument();
    expect(screen.getByLabelText(/预算/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '保存旅行' })).toBeInTheDocument();
  });

  it('名称为空时显示验证错误', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<TripForm onSubmit={onSubmit} />);

    // 名称留空，直接提交
    await user.click(screen.getByRole('button', { name: '保存旅行' }));

    expect(screen.getByText('请输入旅行名称')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('结束日期早于起始日期时显示验证错误', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <TripForm
        onSubmit={onSubmit}
        initialValues={{
          name: '测试旅行',
          startDate: '2024-06-10',
          endDate: '2024-06-05',
        }}
      />,
    );

    await user.click(screen.getByRole('button', { name: '保存旅行' }));

    expect(screen.getByText('结束日期不能早于起始日期')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('预算为非正数时显示验证错误', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <TripForm
        onSubmit={onSubmit}
        initialValues={{ name: '测试旅行' }}
      />,
    );

    // 输入负数预算
    const budgetInput = screen.getByLabelText(/预算/);
    await user.clear(budgetInput);
    await user.type(budgetInput, '-100');
    await user.click(screen.getByRole('button', { name: '保存旅行' }));

    expect(screen.getByText('预算金额必须大于零')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('验证通过时调用 onSubmit 回调', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <TripForm
        onSubmit={onSubmit}
        initialValues={{
          name: '东京之旅',
          destination: '东京',
          startDate: '2024-06-01',
          endDate: '2024-06-07',
        }}
      />,
    );

    await user.click(screen.getByRole('button', { name: '保存旅行' }));

    expect(onSubmit).toHaveBeenCalledWith({
      name: '东京之旅',
      destination: '东京',
      startDate: '2024-06-01',
      endDate: '2024-06-07',
      budget: undefined,
    });
  });

  it('预算字段可选，不填时传递 undefined', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <TripForm
        onSubmit={onSubmit}
        initialValues={{ name: '测试', startDate: '2024-01-01', endDate: '2024-01-02' }}
      />,
    );

    await user.click(screen.getByRole('button', { name: '保存旅行' }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0].budget).toBeUndefined();
  });

  it('填写预算时传递数字值', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <TripForm
        onSubmit={onSubmit}
        initialValues={{ name: '测试', startDate: '2024-01-01', endDate: '2024-01-02' }}
      />,
    );

    const budgetInput = screen.getByLabelText(/预算/);
    await user.type(budgetInput, '5000');
    await user.click(screen.getByRole('button', { name: '保存旅行' }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0].budget).toBe(5000);
  });
});
