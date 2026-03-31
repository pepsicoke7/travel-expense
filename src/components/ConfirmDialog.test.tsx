// ============================================================
// ConfirmDialog 组件测试
// 验证对话框的显示/隐藏、按钮回调和无障碍属性
// 验证需求：6.1（显示确认对话框）、6.3（取消删除不做修改）
// ============================================================

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import ConfirmDialog from './ConfirmDialog';

describe('ConfirmDialog', () => {
  const defaultProps = {
    isOpen: true,
    title: '确认删除',
    message: '确定要删除这条支出记录吗？',
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  };

  it('isOpen 为 true 时渲染对话框内容', () => {
    render(<ConfirmDialog {...defaultProps} />);

    expect(screen.getByText('确认删除')).toBeInTheDocument();
    expect(screen.getByText('确定要删除这条支出记录吗？')).toBeInTheDocument();
    expect(screen.getByText('确认')).toBeInTheDocument();
    expect(screen.getByText('取消')).toBeInTheDocument();
  });

  it('isOpen 为 false 时不渲染任何内容', () => {
    const { container } = render(<ConfirmDialog {...defaultProps} isOpen={false} />);

    expect(container.innerHTML).toBe('');
  });

  it('点击确认按钮触发 onConfirm 回调', async () => {
    const onConfirm = vi.fn();
    render(<ConfirmDialog {...defaultProps} onConfirm={onConfirm} />);

    await userEvent.click(screen.getByText('确认'));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('点击取消按钮触发 onCancel 回调（需求 6.3）', async () => {
    const onCancel = vi.fn();
    render(<ConfirmDialog {...defaultProps} onCancel={onCancel} />);

    await userEvent.click(screen.getByText('取消'));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('具有 dialog 角色以支持无障碍访问', () => {
    render(<ConfirmDialog {...defaultProps} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
