export type ManualCheckResult = 'available' | 'not-available' | 'error';

export interface UpdateDialogSpec {
  type: 'info' | 'error';
  message: string;
  detail?: string;
}

/**
 * Decide the dialog to show for a user-initiated "Check for Updates".
 * Returns null when no dialog is warranted (e.g. the download-complete case,
 * which is surfaced by the in-app update banner instead).
 */
export function manualCheckDialog(
  result: ManualCheckResult,
  errorMessage?: string,
): UpdateDialogSpec | null {
  switch (result) {
    case 'available':
      return {
        type: 'info',
        message: 'An update is available',
        detail: 'Sprout is downloading it now. You’ll be prompted to restart once it’s ready.',
      };
    case 'not-available':
      return {
        type: 'info',
        message: 'You’re up to date',
        detail: 'Sprout is running the latest version.',
      };
    case 'error':
      return {
        type: 'error',
        message: 'Update check failed',
        detail: errorMessage || 'Could not check for updates. Please try again later.',
      };
    default:
      return null;
  }
}
