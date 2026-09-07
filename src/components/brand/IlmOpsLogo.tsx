/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface IlmOpsLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showWordmark?: boolean;
  theme?: 'light' | 'dark';
  className?: string;
}

export function IlmOpsLogo({
  size = 'md',
  showWordmark = true,
  theme = 'light',
  className = '',
}: IlmOpsLogoProps) {
  const iconDimensions = {
    sm: { box: 'h-7 w-7', px: 28 },
    md: { box: 'h-9 w-9', px: 36 },
    lg: { box: 'h-11 w-11', px: 44 },
    xl: { box: 'h-14 w-14', px: 56 },
  }[size];

  const textSize = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  }[size];

  const subtextSize = {
    sm: 'text-[10px]',
    md: 'text-[11px]',
    lg: 'text-xs',
    xl: 'text-xs',
  }[size];

  return (
    <div className={`inline-flex items-center space-x-2.5 ${className}`}>
      {/* Scalable Geometric Mark */}
      <div
        className={`${iconDimensions.box} relative flex shrink-0 items-center justify-center rounded-xl bg-slate-950 p-1.5 shadow-sm ring-1 ring-slate-800/80`}
      >
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full"
        >
          <defs>
            <linearGradient id="ilm-emerald" x1="6" y1="6" x2="34" y2="34" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="ilm-navy-fold" x1="12" y1="8" x2="28" y2="32" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.4" />
            </linearGradient>
          </defs>

          {/* Background subtle knowledge diamond grid */}
          <rect
            x="7"
            y="7"
            width="26"
            height="26"
            rx="6"
            stroke="#334155"
            strokeWidth="1.5"
            strokeDasharray="2 3"
            opacity="0.6"
          />

          {/* Primary Knowledge Folio / Document Flow Layer */}
          <path
            d="M12 11C12 9.89543 12.8954 9 14 9H22L28 15V27C28 28.1046 27.1046 29 26 29H14C12.8954 29 12 28.1046 12 27V11Z"
            fill="#1e293b"
            stroke="#475569"
            strokeWidth="1.2"
          />

          {/* Interlocking Dynamic Operations Arrow & Node Flow */}
          <path
            d="M9 22C9 17.5817 12.5817 14 17 14H24M24 14L20.5 10.5M24 14L20.5 17.5"
            stroke="url(#ilm-emerald)"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <path
            d="M31 18C31 22.4183 27.4183 26 23 26H16M16 26L19.5 22.5M16 26L19.5 29.5"
            stroke="url(#ilm-emerald)"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Knowledge Node (Left / Research origin) */}
          <circle cx="9" cy="22" r="2.8" fill="#10b981" stroke="#064e3b" strokeWidth="1" />

          {/* Gold Spark / Insight Node (Central Synthesis) */}
          <circle cx="20" cy="20" r="2.4" fill="#f59e0b" stroke="#78350f" strokeWidth="1" />

          {/* Publishing Terminal Node (Right / Distribution) */}
          <circle cx="31" cy="18" r="2.8" fill="#34d399" stroke="#064e3b" strokeWidth="1" />
        </svg>
      </div>

      {showWordmark && (
        <div className="flex flex-col leading-tight">
          <div className="flex items-center space-x-1.5">
            <span
              className={`font-bold tracking-tight ${
                theme === 'dark' ? 'text-white' : 'text-slate-900'
              } ${textSize}`}
            >
              Ilm<span className="text-emerald-600">Ops</span>
            </span>
            <span className="rounded bg-emerald-50 px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider text-emerald-700 ring-1 ring-emerald-200">
              Internal
            </span>
          </div>
          <span
            className={`${
              theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
            } ${subtextSize} font-medium tracking-normal`}
          >
            Research-to-Publish Operations
          </span>
        </div>
      )}
    </div>
  );
}
