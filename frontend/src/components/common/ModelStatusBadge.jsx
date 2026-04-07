import { cn } from '../../utils/cn';

const statusClassMap = {
  loaded: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  error: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  not_loaded: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
};

export default function ModelStatusBadge({ status = 'not_loaded', label, title }) {
  return (
    <span
      title={title || ''}
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
        statusClassMap[status] || statusClassMap.not_loaded,
      )}
    >
      {label}
    </span>
  );
}
