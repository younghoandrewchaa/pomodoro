export type ManualCheckResult = 'available' | 'not-available' | 'error';

export interface UpdateCheckStatus {
  type: 'info' | 'error';
  message: string;
  detail?: string;
}

/**
 * Build the status shown for a user-initiated "Check for Updates".
 * Returns null when nothing should be shown (e.g. the download-complete case,
 * which is surfaced by the in-app update banner instead).
 */
export function manualCheckStatus(
  result: ManualCheckResult,
  errorMessage?: string,
): UpdateCheckStatus | null {
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
