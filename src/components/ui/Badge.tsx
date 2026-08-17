import React from 'react';
import { getStatusBadge, getConditionBadge } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const badge = getStatusBadge(status);
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.bg}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
      {badge.label}
    </span>
  );
}

interface ConditionBadgeProps {
  condition: string;
}

export function ConditionBadge({ condition }: ConditionBadgeProps) {
  const badge = getConditionBadge(condition);
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${badge.bg}`}>
      {badge.label}
    </span>
  );
}
