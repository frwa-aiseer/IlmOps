/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface FriendlyWorkspaceError {
  code: string;
  statusCode: number;
  message: string;
  userActionableMessage: string;
}

/**
 * Sanitizes and translates Google API error responses into friendly,
 * user-actionable messages. Never leaks OAuth tokens, internal stacks, or secrets.
 */
export function translateWorkspaceError(status: number, rawMessage?: string): FriendlyWorkspaceError {
  switch (status) {
    case 401:
      return {
        code: 'UNAUTHORIZED',
        statusCode: 401,
        message: 'Google authorization is required.',
        userActionableMessage: 'Please sign in with your authorized Google account to inspect the Operations Hub.',
      };
    case 403:
      return {
        code: 'FORBIDDEN',
        statusCode: 403,
        message: 'Your Google account cannot access the ALLIN Content Operations Hub.',
        userActionableMessage: 'Ensure your signed-in Google account has been granted view access to the Google Sheet.',
      };
    case 404:
      return {
        code: 'NOT_FOUND',
        statusCode: 404,
        message: 'The configured workbook was not found.',
        userActionableMessage: 'Verify the Spreadsheet ID in the server configuration.',
      };
    case 429:
      return {
        code: 'RATE_LIMITED',
        statusCode: 429,
        message: 'Google API rate limit reached. Please wait a moment.',
        userActionableMessage: 'Please retry diagnostics in a few moments.',
      };
    case 500:
    case 502:
    case 503:
    case 504:
      return {
        code: 'GOOGLE_SERVER_ERROR',
        statusCode: status,
        message: 'Google Workspace service temporarily unavailable.',
        userActionableMessage: 'Google servers returned a temporary error. Please try again shortly.',
      };
    default:
      return {
        code: 'WORKSPACE_ERROR',
        statusCode: status,
        message: 'Unable to connect to Google Workspace.',
        userActionableMessage: 'An unexpected issue occurred while checking the workbook. Please try again.',
      };
  }
}
