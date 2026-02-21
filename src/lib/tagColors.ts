// Each tag gets a unique highlighted color palette
// Format: { bg, text, ring } for light mode + dark mode variants as Tailwind classes

export const TAG_COLORS: Record<string, { active: string; pill: string }> = {
  // Type Tags
  Fellowship: {
    active: "bg-purple-100 text-purple-700 ring-1 ring-purple-200 dark:bg-purple-500/20 dark:text-purple-300 dark:ring-purple-500/30",
    pill: "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300",
  },
  Internship: {
    active: "bg-blue-100 text-blue-700 ring-1 ring-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:ring-blue-500/30",
    pill: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
  },
  Job: {
    active: "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:ring-emerald-500/30",
    pill: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
  },
  Workshop: {
    active: "bg-amber-100 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:ring-amber-500/30",
    pill: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  },
  Research: {
    active: "bg-rose-100 text-rose-700 ring-1 ring-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:ring-rose-500/30",
    pill: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300",
  },
  // Field Tags
  "Pre-Med": {
    active: "bg-red-100 text-red-700 ring-1 ring-red-200 dark:bg-red-500/20 dark:text-red-300 dark:ring-red-500/30",
    pill: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300",
  },
  "Bio-Chem": {
    active: "bg-teal-100 text-teal-700 ring-1 ring-teal-200 dark:bg-teal-500/20 dark:text-teal-300 dark:ring-teal-500/30",
    pill: "bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300",
  },
  "Computer Science": {
    active: "bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300 dark:ring-indigo-500/30",
    pill: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300",
  },
  Engineering: {
    active: "bg-orange-100 text-orange-700 ring-1 ring-orange-200 dark:bg-orange-500/20 dark:text-orange-300 dark:ring-orange-500/30",
    pill: "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300",
  },
  Physics: {
    active: "bg-cyan-100 text-cyan-700 ring-1 ring-cyan-200 dark:bg-cyan-500/20 dark:text-cyan-300 dark:ring-cyan-500/30",
    pill: "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300",
  },
  Mathematics: {
    active: "bg-violet-100 text-violet-700 ring-1 ring-violet-200 dark:bg-violet-500/20 dark:text-violet-300 dark:ring-violet-500/30",
    pill: "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300",
  },
  "Environmental Science": {
    active: "bg-green-100 text-green-700 ring-1 ring-green-200 dark:bg-green-500/20 dark:text-green-300 dark:ring-green-500/30",
    pill: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300",
  },
  Neuroscience: {
    active: "bg-pink-100 text-pink-700 ring-1 ring-pink-200 dark:bg-pink-500/20 dark:text-pink-300 dark:ring-pink-500/30",
    pill: "bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-300",
  },
};

export function getTagColor(tag: string) {
  return TAG_COLORS[tag] ?? {
    active: "bg-gray-100 text-gray-700 ring-1 ring-gray-200 dark:bg-gray-500/20 dark:text-gray-300 dark:ring-gray-500/30",
    pill: "bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-300",
  };
}
