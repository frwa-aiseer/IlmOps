/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Plus } from 'lucide-react';

interface AddSourceButtonProps {
  id?: string;
  onClick: () => void;
  variant?: 'default' | 'header' | 'hero';
  className?: string;
}

/**
 * Reusable Add Source button component.
 * Renders exactly ONE Plus icon and the label "Add Source" (no duplicate pluses).
 */
export function AddSourceButton({
  id = 'btn-add-source',
  onClick,
  variant = 'default',
  className = '',
}: AddSourceButtonProps) {
  let baseStyle = 'inline-flex items-center space-x-1.5 font-semibold transition-colors shadow-xs';
  if (variant === 'header') {
    baseStyle += ' rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs text-white hover:bg-emerald-700';
  } else if (variant === 'hero') {
    baseStyle += ' rounded-xl bg-emerald-600 px-4 py-2 text-xs text-white hover:bg-emerald-500';
  } else {
    baseStyle += ' rounded-xl bg-emerald-600 px-4 py-2.5 text-xs text-white hover:bg-emerald-700';
  }

  return (
    <button
      id={id}
      onClick={onClick}
      className={`${baseStyle} ${className}`}
    >
      <Plus className="h-3.5 w-3.5 shrink-0" />
      <span>Add Source</span>
    </button>
  );
}
