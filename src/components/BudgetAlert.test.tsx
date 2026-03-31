// ============================================================
// BudgetAlert 组件测试
// 验证不同预算提醒类型的渲染和样式
// ============================================================

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { BudgetAlert as BudgetAlertType } from '../types';
import BudgetAlert from './BudgetAlert';

describe('BudgetAlert', () => {
  it('warning_80 类型显示警告消息', () => {
    const alert: BudgetAlertType = {
      type: 'warning_80',
      message: '已使用 80% 预算，请注意控制支出',
    };
    render(<BudgetAlert alert={alert} />);

    expect(screen.getByText('已使用 80% 预算，请注意控制支出')).toBeInTheDocument();
  });

  it('exceeded 类型显示超支消息和超出金额', () => {
    const alert: BudgetAlertType = {
      type: 'exceeded',
      message: '已超出预算',
      overAmount: 1500,
    };
    render(<BudgetAlert alert={alert} />);

    expect(screen.getByText('已超出预算')).toBeInTheDocument();
    expect(screen.getByText('超出金额：¥1500.00')).toBeInTheDocument();
  });

  it('will_exceed 类型显示超支预警消息', () => {
    const alert: BudgetAlertType = {
      type: 'will_exceed',
      message: '添加此笔支出后将超出预算 ¥500.00',
      overAmount: 500,
    };
    render(<BudgetAlert alert={alert} />);

    expect(screen.getByText('添加此笔支出后将超出预算 ¥500.00')).toBeInTheDocument();
    expect(screen.getByText('超出金额：¥500.00')).toBeInTheDocument();
  });

  it('没有 overAmount 时不显示超出金额', () => {
    const alert: BudgetAlertType = {
      type: 'warning_80',
      message: '已使用 80% 预算，请注意控制支出',
    };
    render(<BudgetAlert alert={alert} />);

    expect(screen.queryByText(/超出金额/)).not.toBeInTheDocument();
  });

  it('具有 alert 角色以支持无障碍访问', () => {
    const alert: BudgetAlertType = {
      type: 'exceeded',
      message: '已超出预算',
    };
    render(<BudgetAlert alert={alert} />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
