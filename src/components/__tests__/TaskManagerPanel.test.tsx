import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import TaskManagerPanel from '../TaskManagerPanel';
import type { Task } from '../../types';

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: 'task-1',
  name: 'Test task',
  status: 'active',
  createdAt: new Date().toISOString(),
  totalSeconds: 0,
  totalPomodoros: 0,
  ...overrides,
});

const defaultProps = {
  tasks: [],
  activeTaskId: null,
  onBack: vi.fn(),
  onSelect: vi.fn(),
  onComplete: vi.fn().mockResolvedValue(undefined),
  onDelete: vi.fn().mockResolvedValue(undefined),
  onCreateTask: vi.fn().mockResolvedValue(undefined),
};

beforeEach(() => vi.clearAllMocks());

describe('TaskManagerPanel — row click to select', () => {
  it('clicking the task row body calls onSelect with the task id', () => {
    const task = makeTask({ id: 'abc', name: 'My task' });
    render(<TaskManagerPanel {...defaultProps} tasks={[task]} activeTaskId={null} />);
    fireEvent.click(screen.getByText('My task'));
    expect(defaultProps.onSelect).toHaveBeenCalledWith('abc');
  });

  it('clicking the complete button does not call onSelect', () => {
    const task = makeTask({ id: 'abc' });
    render(<TaskManagerPanel {...defaultProps} tasks={[task]} activeTaskId={null} />);
    fireEvent.click(screen.getByTitle('Mark complete'));
    expect(defaultProps.onComplete).toHaveBeenCalledWith('abc');
    expect(defaultProps.onSelect).not.toHaveBeenCalled();
  });

  it('clicking the delete button on an active task does not call onSelect', () => {
    const task = makeTask({ id: 'abc' });
    render(<TaskManagerPanel {...defaultProps} tasks={[task]} activeTaskId={null} />);
    fireEvent.click(screen.getByTitle('Delete'));
    expect(defaultProps.onDelete).toHaveBeenCalledWith('abc');
    expect(defaultProps.onSelect).not.toHaveBeenCalled();
  });

  it('clicking a completed task row does not call onSelect', () => {
    const task = makeTask({ id: 'abc', name: 'Done task', status: 'completed' });
    render(<TaskManagerPanel {...defaultProps} tasks={[task]} activeTaskId={null} />);
    fireEvent.click(screen.getByText('Done task'));
    expect(defaultProps.onSelect).not.toHaveBeenCalled();
  });
});
