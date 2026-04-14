export default function DueDateBadge({ date }) {
  if (!date) return null;

  const dueDate = new Date(date);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dueDateNormalized = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());

  const diffMs = dueDateNormalized.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  let colorClasses;

  if (diffDays < 0) {
    colorClasses = 'bg-red-100 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30 dark:shadow-[0_0_8px_rgba(239,68,68,0.15)]';
  } else if (diffDays === 0) {
    colorClasses = 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30 dark:shadow-[0_0_8px_rgba(245,158,11,0.15)]';
  } else if (diffDays <= 2) {
    colorClasses = 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/15 dark:text-yellow-400 dark:border-yellow-500/20';
  } else {
    colorClasses = 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-white/[0.04] dark:text-gray-400 dark:border-white/[0.08]';
  }

  const formatted = dueDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[11px] font-medium ${colorClasses}`}>
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      {formatted}
    </span>
  );
}
