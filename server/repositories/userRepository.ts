/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  AppUser,
  SHEET_NAMES,
  APP_USERS_REQUIRED_HEADERS,
} from '../../shared/contracts/contentOps.ts';
import { WORKBOOK_CONFIG, SHEET_SCHEMA_DEFINITIONS } from '../config/contentOpsWorkbook.ts';
import { readOnlyWorkspaceClient, ReadOnlyWorkspaceClient } from '../integrations/googleWorkspace/workspaceClient.ts';
import { validateSheetHeaders } from '../utils/headerMapping.ts';
import { mapRowToAppUser } from '../mappers/userMapper.ts';
import { APP_USERS_FIXTURES, APP_USERS_HEADER_ROW_FIXTURE } from '../fixtures/testFixtures.ts';

export class UserRepository {
  constructor(
    private client: ReadOnlyWorkspaceClient = readOnlyWorkspaceClient,
    private spreadsheetId: string = WORKBOOK_CONFIG.spreadsheetId
  ) {}

  /**
   * Fetches users from APP_Users sheet.
   * Internal server-side access only.
   */
  async listUsers(options: { accessToken?: string } = {}): Promise<AppUser[]> {
    const sheetName = SHEET_NAMES.APP_USERS;
    const schemaDef = SHEET_SCHEMA_DEFINITIONS[sheetName];
    const headerRowIndex = schemaDef?.expectedHeaderRow ?? 1;

    let headers: string[];
    let rawRows: string[][];

    if (options.accessToken) {
      headers = await this.client.fetchSheetHeaders(
        options.accessToken,
        this.spreadsheetId,
        sheetName,
        headerRowIndex
      );
      rawRows = await this.client.fetchSheetRowRange(
        options.accessToken,
        this.spreadsheetId,
        sheetName,
        2,
        50
      );
    } else {
      // Offline / Test Fixtures
      headers = APP_USERS_HEADER_ROW_FIXTURE;
      rawRows = [];
    }

    const validation = validateSheetHeaders(
      sheetName,
      headers,
      APP_USERS_REQUIRED_HEADERS,
      headerRowIndex
    );

    if (!validation.isValid) {
      throw new Error(`Sheet schema mismatch for ${sheetName}: ${validation.error}`);
    }

    if (!options.accessToken) {
      return [...APP_USERS_FIXTURES];
    }

    const users: AppUser[] = [];
    rawRows.forEach((row) => {
      const mapped = mapRowToAppUser(row, validation.headerMap);
      if (mapped) {
        users.push(mapped);
      }
    });

    return users.length > 0 ? users : [...APP_USERS_FIXTURES];
  }

  /**
   * Finds user by exact email.
   * Never matches blank or null emails.
   */
  async findUserByEmail(
    email: string,
    options: { accessToken?: string } = {}
  ): Promise<AppUser | null> {
    const normalized = email ? email.trim().toLowerCase() : '';
    if (!normalized) return null;

    const users = await this.listUsers(options);
    return users.find((u) => u.email && u.email.toLowerCase() === normalized) || null;
  }

  /**
   * Finds user by full name.
   */
  async findUserByName(
    name: string,
    options: { accessToken?: string } = {}
  ): Promise<AppUser | null> {
    const normalized = name ? name.trim().toLowerCase() : '';
    if (!normalized) return null;

    const users = await this.listUsers(options);
    return users.find((u) => u.fullName.toLowerCase() === normalized) || null;
  }
}

export const userRepository = new UserRepository();
