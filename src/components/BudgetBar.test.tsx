// ============================================================
// BudgetBar 组件测试
// 验证预算进度条的渲染、金额显示、颜色状态
// ============================================================

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { BudgetStatus } from '../types';
import BudgetBar from './BudgetBar';

/** 创建测试用的 BudgetStatus */
function makeBudgetStatus(overrides: Partial<BudgetStatus> = {}): BudgetStatus {
  return {
    budgetAmount: 10000,
    spentAmount: 3000,
    remainingAmount: 7000,
    usagePercent: 30,
    level: 'normal',
    ...overrides,
  };
}

describe('BudgetBar', () => {
  it('显示预算总额和已花费金额', () => {
    render(<BudgetBar status={makeBudgetStatus()} />);

    expect(screen.getByText('¥3000.00')).toBeInTheDocument();
    expect(screen.getByText('/ ¥10000.00')).toBeInTheDocument();
  });

  it('显示使用百分比', () => {
    render(<BudgetBar status={makeBudgetStatus({ usagePercent: 30 })} />);

    expect(screen.getByText('30.0%')).toBeInTheDocument();
  });

  it('normal 状态显示剩余金额', () => {
    render(<BudgetBar status={makeBudgetStatus({ remainingAmount: 7000 })} />);

    expect(screen.getByText('剩余 ¥7000.00')).toBeInTheDocument();
  });

  it('exceeded 状态显示超出金额', () => {
    const status = makeBudgetStatus({
      spentAmount: 12000,
      remainingAmount: -2000,
      usagePercent: 120,
      level: 'exceeded',
    });
    render(<BudgetBar status={status} />);

    expect(screen.getByText('超出 ¥2000.00')).toBeInTheDocument();
  });

  it('进度条具有正确的 progressbar 角色和 aria 属性', () => {
    render(<BudgetBar status={makeBudgetStatus({ usagePercent: 50 })} />);

    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '50');
    expect(progressbar).toHaveAttribute('aria-valuemin', '0');
    expect(progressbar).toHaveAttribute('aria-valuemax', '100');
  });

  it('进度条宽度不超过 100%', () => {
    const status = makeBudgetStatus({ usagePercent: 150, level: 'exceeded' });
    const { container } = render(<BudgetBar status={status} />);

    // 进度条内部 div 的 width 应为 100%
    const trackBar = container.querySelector('[role="progressbar"] > div');
    expect(trackBar).toHaveStyle({ width: '100%' });
  });
});
