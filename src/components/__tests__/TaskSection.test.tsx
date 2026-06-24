import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import TaskSection from '../TaskSection';
import type { Task } from '../../types';

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: 'task-1',
  name: 'My task',
  status: 'active',
  createdAt: new Date().toISOString(),
  totalSeconds: 0,
  totalPomodoros: 0,
  ...overrides,
});

const defaultProps = {
  tasks: [],
  activeTaskId: null,
  onOpenManager: vi.fn(),
  onSelectTask: vi.fn(),
  onCreateTask: vi.fn().mockResolvedValue(undefined),
};

beforeEach(() => vi.clearAllMocks());

describe('TaskSection — task card switcher dropdown', () => {
  it('clicking the task card reveals the switcher dropdown with other active tasks', () => {
    const task1 = makeTask({ id: 'task-1', name: 'My task' });
    const task2 = makeTask({ id: 'task-2', name: 'Other task' });
    render(<TaskSection {...defaultProps} tasks={[task1, task2]} activeTaskId="task-1" />);
    fireEvent.click(screen.getByText('My task'));
    expect(screen.getByText('Other task')).toBeInTheDocument();
  });

  it('clicking a task in the dropdown calls onSelectTask and closes the dropdown', () => {
    const task1 = makeTask({ id: 'task-1', name: 'My task' });
    const task2 = makeTask({ id: 'task-2', name: 'Other task' });
    render(<TaskSection {...defaultProps} tasks={[task1, task2]} activeTaskId="task-1" />);
    fireEvent.click(screen.getByText('My task'));
    fireEvent.click(screen.getByText('Other task'));
    expect(defaultProps.onSelectTask).toHaveBeenCalledWith('task-2');
    expect(screen.queryByText('Other task')).not.toBeInTheDocument();
  });

  it('clicking Manage in the dropdown calls onOpenManager', () => {
    const task = makeTask();
    render(<TaskSection {...defaultProps} tasks={[task]} activeTaskId="task-1" />);
    fireEvent.click(screen.getByText('My task'));
    const switcher = document.querySelector('.task-switcher')!;
    fireEvent.click(within(switcher as HTMLElement).getByText('Manage'));
    expect(defaultProps.onOpenManager).toHaveBeenCalled();
  });

  it('shows an empty state when no other active tasks exist', () => {
    const task = makeTask({ id: 'task-1', name: 'My task' });
    render(<TaskSection {...defaultProps} tasks={[task]} activeTaskId="task-1" />);
    fireEvent.click(screen.getByText('My task'));
    expect(screen.getByText('No other tasks')).toBeInTheDocument();
  });
});
