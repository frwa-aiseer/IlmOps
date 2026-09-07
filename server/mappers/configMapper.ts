/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type {
  BrandProfile,
  ContentTypeConfig,
  TeamMember,
  ListsConfig,
} from '../../shared/contracts/contentOps.ts';
import { getRowValueByHeader } from '../utils/headerMapping.ts';
import {
  parseSafeText,
  parseSafeOptionalText,
  parseSafeBoolean,
} from '../utils/dataParsing.ts';

/**
 * Maps a raw row from Brand_Profiles (Row 1 header row) into BrandProfile.
 */
export function mapRowToBrandProfile(
  row: unknown[],
  headerMap: Map<string, number>
): BrandProfile | null {
  const id = parseSafeText(getRowValueByHeader(row, headerMap, 'Account ID'));
  const displayName = parseSafeText(getRowValueByHeader(row, headerMap, 'Display Name'));

  if (!id && !displayName) {
    return null;
  }

  const primaryColors = parseSafeOptionalText(getRowValueByHeader(row, headerMap, 'Primary Colors'));
  const secondaryColors = parseSafeOptionalText(getRowValueByHeader(row, headerMap, 'Secondary Colors'));
  const brandColors = [primaryColors, secondaryColors].filter(Boolean) as string[];

  return {
    id: id || displayName,
    displayName: displayName || id,
    brandPersona: parseSafeText(getRowValueByHeader(row, headerMap, 'Brand / Persona')) || displayName,
    platform: parseSafeText(getRowValueByHeader(row, headerMap, 'Platform')) || 'LinkedIn',
    niche: parseSafeText(getRowValueByHeader(row, headerMap, 'Niche')) || 'Technical',
    primaryColors,
    secondaryColors,
    typographyFonts: parseSafeOptionalText(getRowValueByHeader(row, headerMap, 'Typography / Fonts')),
    visualStyle: parseSafeOptionalText(getRowValueByHeader(row, headerMap, 'Visual Style')),
    voiceTone: parseSafeOptionalText(getRowValueByHeader(row, headerMap, 'Voice / Tone')),
    audience: parseSafeOptionalText(getRowValueByHeader(row, headerMap, 'Audience')),
    brandingSignature: parseSafeOptionalText(getRowValueByHeader(row, headerMap, 'Branding Signature')),
    brandAssetLink: parseSafeOptionalText(getRowValueByHeader(row, headerMap, 'Brand Asset Link')),
    platformRules: parseSafeOptionalText(getRowValueByHeader(row, headerMap, 'Platform Rules')),
    seoGeoHashtags: parseSafeOptionalText(getRowValueByHeader(row, headerMap, 'SEO / GEO / Hashtag Guidance')),
    finalizationRules: parseSafeOptionalText(getRowValueByHeader(row, headerMap, 'Finalization / Editing Rules')),
    active: parseSafeBoolean(getRowValueByHeader(row, headerMap, 'Active'), true),
    // Backward-compatible aliases
    accountName: displayName,
    primaryOwner: parseSafeOptionalText(getRowValueByHeader(row, headerMap, 'Brand / Persona')),
    brandColors,
    notes: parseSafeOptionalText(getRowValueByHeader(row, headerMap, 'Voice / Tone')),
  };
}

/**
 * Maps a raw row from Content_Types (Row 1 header row) into ContentTypeConfig.
 */
export function mapRowToContentTypeConfig(
  row: unknown[],
  headerMap: Map<string, number>
): ContentTypeConfig | null {
  const contentType = parseSafeText(getRowValueByHeader(row, headerMap, 'Content Type'));

  if (!contentType) {
    return null;
  }

  return {
    contentType,
    googleLlmInstructions: parseSafeOptionalText(getRowValueByHeader(row, headerMap, 'Google LLM / NotebookLM Production Instructions')),
    chatGptFinalizationFocus: parseSafeOptionalText(getRowValueByHeader(row, headerMap, 'ChatGPT Finalization Focus')),
    preferredStructure: parseSafeOptionalText(getRowValueByHeader(row, headerMap, 'Preferred Structure')),
    typicalLength: parseSafeOptionalText(getRowValueByHeader(row, headerMap, 'Typical Length')),
    active: parseSafeBoolean(getRowValueByHeader(row, headerMap, 'Active'), true),
    // Backward-compatible aliases
    id: contentType,
    name: contentType,
    notes: parseSafeOptionalText(getRowValueByHeader(row, headerMap, 'Preferred Structure')),
  };
}

/**
 * Maps a raw row from Team_Members (Row 1 header row) into TeamMember.
 * Strictly avoids inventing emails!
 */
export function mapRowToTeamMember(
  row: unknown[],
  headerMap: Map<string, number>
): TeamMember | null {
  const fullName = parseSafeText(getRowValueByHeader(row, headerMap, 'Full Name'));

  if (!fullName) {
    return null;
  }

  const roles = parseSafeText(getRowValueByHeader(row, headerMap, 'Role(s)'));

  return {
    fullName,
    roles: roles || 'Team Member',
    active: parseSafeBoolean(getRowValueByHeader(row, headerMap, 'Active'), true),
    notes: parseSafeOptionalText(getRowValueByHeader(row, headerMap, 'Notes')),
    // Backward-compatible aliases
    name: fullName,
    role: roles,
    email: undefined, // Strictly no invented emails
    focusArea: roles,
  };
}

/**
 * Maps columns from Lists_Config (Row 1 header row) into ListsConfig.
 * In Lists_Config, each column represents a list category (e.g. Review Decision, Technical Depth, etc.)
 * and rows beneath contain the available choices.
 */
export function mapRowsToListsConfig(
  rows: unknown[][],
  headerMap: Map<string, number>
): ListsConfig {
  const result: ListsConfig = {
    reviewDecision: [],
    technicalDepth: [],
    productionPotential: [],
    productionStatus: [],
    technicalQcStatus: [],
    publishingStatus: [],
    priorityOverride: [],
    yesNo: [],
  };

  const columnsMap: Array<{ key: keyof ListsConfig; header: string }> = [
    { key: 'reviewDecision', header: 'Review Decision' },
    { key: 'technicalDepth', header: 'Technical Depth' },
    { key: 'productionPotential', header: 'Production Potential' },
    { key: 'productionStatus', header: 'Production Status' },
    { key: 'technicalQcStatus', header: 'Technical QC Status' },
    { key: 'publishingStatus', header: 'Publishing Status' },
    { key: 'priorityOverride', header: 'Priority Override' },
    { key: 'yesNo', header: 'Yes / No' },
  ];

  for (const { key, header } of columnsMap) {
    const colIndex = headerMap.get(header);
    if (colIndex !== undefined) {
      const items: string[] = [];
      for (const row of rows) {
        if (colIndex < row.length) {
          const val = parseSafeText(row[colIndex]);
          if (val && !items.includes(val)) {
            items.push(val);
          }
        }
      }
      result[key] = items;
    }
  }

  return result;
}
