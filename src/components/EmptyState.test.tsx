// ============================================================
// EmptyState 组件测试
// 验证空状态提示的渲染和可选操作按钮
// 验证需求：2.4（空状态提示并引导创建旅行）
// ============================================================

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import EmptyState from './EmptyState';

describe('EmptyState', () => {
  it('显示提示消息', () => {
    render(<EmptyState message="暂无旅行记录" />);

    expect(screen.getByText('暂无旅行记录')).toBeInTheDocument();
  });

  it('没有 actionLabel 时不渲染操作按钮', () => {
    render(<EmptyState message="暂无旅行记录" />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('提供 actionLabel 和 onAction 时渲染操作按钮', () => {
    render(<EmptyState message="暂无旅行记录" actionLabel="创建第一次旅行" onAction={() => {}} />);

    expect(screen.getByText('创建第一次旅行')).toBeInTheDocument();
  });

  it('点击操作按钮触发 onAction 回调', async () => {
    const onAction = vi.fn();
    render(<EmptyState message="暂无旅行记录" actionLabel="创建第一次旅行" onAction={onAction} />);

    await userEvent.click(screen.getByText('创建第一次旅行'));
    expect(onAction).toHaveBeenCalledOnce();
  });

  it('仅有 actionLabel 但无 onAction 时不渲染按钮', () => {
    render(<EmptyState message="暂无数据" actionLabel="添加" />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
