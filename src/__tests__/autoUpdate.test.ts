import { describe, expect, it } from 'vitest';
import { manualCheckDialog } from '../autoUpdate';

describe('manualCheckDialog', () => {
  it('tells the user they are up to date when no update is available', () => {
    const dialog = manualCheckDialog('not-available');
    expect(dialog?.type).toBe('info');
    expect(dialog?.message).toMatch(/up to date/i);
  });

  it('reports a downloading update when one is available', () => {
    const dialog = manualCheckDialog('available');
    expect(dialog?.type).toBe('info');
    expect(dialog?.detail).toMatch(/download/i);
  });

  it('surfaces the underlying error message on failure', () => {
    const dialog = manualCheckDialog('error', 'network unreachable');
    expect(dialog?.type).toBe('error');
    expect(dialog?.detail).toContain('network unreachable');
  });

  it('falls back to a generic detail when no error message is provided', () => {
    const dialog = manualCheckDialog('error');
    expect(dialog?.type).toBe('error');
    expect(dialog?.detail).toBeTruthy();
  });
});
