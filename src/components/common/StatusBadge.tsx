import { Badge } from '../ui/badge';

interface StatusBadgeProps {
  status: 'processing' | 'completed' | 'failed' | 'pending' | 'active' | 'inactive';
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const variants: Record<string, { variant: any; label: string }> = {
    processing: { variant: 'default', label: 'Processing' },
    completed: { variant: 'default', label: 'Completed' },
    failed: { variant: 'destructive', label: 'Failed' },
    pending: { variant: 'secondary', label: 'Pending' },
    active: { variant: 'default', label: 'Active' },
    inactive: { variant: 'secondary', label: 'Inactive' },
  };

  const config = variants[status] || variants.pending;

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
