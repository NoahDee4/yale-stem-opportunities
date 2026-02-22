"use client";

import { useState } from "react";
import { Mentor } from "@/lib/types";
import { getTagColor } from "@/lib/tagColors";
import { motion, AnimatePresence } from "framer-motion";

const fieldIcons: Record<string, string> = {
  "Pre-Med": "🩺",
  "Bio-Chem": "🧬",
  "Computer Science": "💻",
  Engineering: "⚙️",
  Physics: "⚛️",
  Mathematics: "📐",
  "Environmental Science": "🌿",
  Neuroscience: "🧠",
  "MB&B": "🧪",
  MCDB: "🦠",
  EEB: "🌎",
  "Cognitive Science": "🧩",
};

const roleIcons: Record<string, string> = {
  "Peer Mentor": "🤝",
  "Alumni Mentor": "🎓",
  Faculty: "🏛️",
};

interface Props {
  mentor: Mentor;
  index?: number;
  canDelete?: boolean;
  onDelete?: () => void;
  canEdit?: boolean;
  onEdit?: () => void;
  isFavorited?: boolean;
  onToggleFavorite?: () => void;
}

export default function MentorCard({
  mentor,
  index = 0,
  canDelete,
  onDelete,
  canEdit,
  onEdit,
  isFavorited = false,
  onToggleFavorite,
}: Props) {
  const [confirming, setConfirming] = useState(false);
  const initials = mentor.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const roleColor = getTagColor(mentor.role);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className="flex flex-col rounded-2xl border border-border bg-white p-5 transition-shadow duration-200 hover:shadow-md dark:border-border-dark dark:bg-surface-dark-secondary dark:hover:shadow-black/20"
    >
      {/* Header row */}
      <div className="mb-3 flex items-start gap-3">
        {/* Avatar */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-tertiary text-[13px] font-bold text-text-secondary dark:bg-surface-dark-tertiary dark:text-text-dark-secondary">
          {initials}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-semibold text-text-primary dark:text-text-dark-primary">
            {mentor.name}
          </p>
          {/* Role badge */}
          <span className={`mt-1 inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold ${roleColor.pill}`}>
            <span>{roleIcons[mentor.role]}</span>
            {mentor.role}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex shrink-0 items-center gap-0.5">
          {/* Heart / Favorite */}
          {onToggleFavorite && (
            <button
              onClick={onToggleFavorite}
              className={`rounded-lg p-1.5 transition-all duration-150 ${
                isFavorited
                  ? "text-red-500 hover:text-red-600"
                  : "text-text-tertiary/40 hover:text-red-500 dark:text-text-dark-tertiary/40"
              }`}
              title={isFavorited ? "Remove from saved mentors" : "Save mentor"}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill={isFavorited ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          )}

          {/* Edit button */}
          {canEdit && (
            <button
              onClick={onEdit}
              className="rounded-lg p-1.5 text-text-tertiary transition-colors hover:text-blue-500 dark:text-text-dark-tertiary"
              title="Edit your mentor profile"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
          )}

          {/* Delete button */}
          {canDelete && (
          <AnimatePresence mode="wait">
            {confirming ? (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex shrink-0 items-center gap-1.5"
              >
                <button
                  onClick={() => { onDelete?.(); setConfirming(false); }}
                  className="rounded-lg bg-red-500 px-2.5 py-1 text-[11px] font-semibold text-white transition-colors hover:bg-red-600"
                >
                  Remove
                </button>
                <button
                  onClick={() => setConfirming(false)}
                  className="rounded-lg px-2 py-1 text-[11px] font-medium text-text-tertiary transition-colors hover:text-text-primary dark:text-text-dark-tertiary dark:hover:text-text-dark-primary"
                >
                  Cancel
                </button>
              </motion.div>
            ) : (
              <motion.button
                key="trash"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setConfirming(true)}
                className="shrink-0 rounded-lg p-1.5 text-text-tertiary transition-colors hover:bg-red-50 hover:text-red-500 dark:text-text-dark-tertiary dark:hover:bg-red-950/30 dark:hover:text-red-400"
                title="Remove me as mentor"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                  <path d="M10 11v6M14 11v6" />
                  <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                </svg>
              </motion.button>
            )}
          </AnimatePresence>
          )}
        </div>
      </div>

      {/* Bio */}
      {mentor.bio && (
        <p className="mb-3 line-clamp-2 text-[13px] leading-relaxed text-text-secondary dark:text-text-dark-secondary">
          {mentor.bio}
        </p>
      )}

      {/* Field tags */}
      {mentor.fields.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {mentor.fields.map((field) => (
            <span
              key={field}
              className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium ${getTagColor(field).pill}`}
            >
              <span>{fieldIcons[field]}</span>
              {field}
            </span>
          ))}
        </div>
      )}

      {/* Email CTA */}
      <div className="mt-auto pt-1">
        <a
          href={`mailto:${mentor.email}`}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-border py-2 text-[13px] font-medium text-text-secondary transition-colors hover:border-black/20 hover:text-text-primary dark:border-border-dark dark:text-text-dark-secondary dark:hover:border-white/15 dark:hover:text-text-dark-primary"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="20" height="16" x="2" y="4" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 01-2.06 0L2 7" />
          </svg>
          {mentor.email}
        </a>
      </div>
    </motion.div>
  );
}
