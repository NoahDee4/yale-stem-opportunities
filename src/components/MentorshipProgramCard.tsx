"use client";

import { MentorshipProgram } from "@/lib/types";
import { getTagColor } from "@/lib/tagColors";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import toast from "react-hot-toast";
import Link from "next/link";

interface Props {
  program: MentorshipProgram;
  index?: number;
  isFavorited?: boolean;
  onToggleFavorite?: (id: string) => void;
  showActions?: boolean;
  onEdit?: (p: MentorshipProgram) => void;
  onDelete?: (id: string) => void;
}

export default function MentorshipProgramCard({
  program,
  index = 0,
  isFavorited = false,
  onToggleFavorite,
  showActions = false,
  onEdit,
  onDelete,
}: Props) {
  const { user } = useAuth();

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error("Sign in to save programs");
      return;
    }
    if (onToggleFavorite) {
      onToggleFavorite(program.id);
    } else {
      const ref = doc(db, "users", user.uid, "savedMentorshipPrograms", program.id);
      try {
        if (isFavorited) {
          await deleteDoc(ref);
          toast.success("Removed from saved programs");
        } else {
          await setDoc(ref, { addedAt: new Date() });
          toast.success("Program saved ❤️");
        }
      } catch {
        toast.error("Something went wrong");
      }
    }
  };

  const domain = (() => {
    try {
      return new URL(program.link).hostname.replace("www.", "");
    } catch {
      return program.link;
    }
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
      className="h-full"
    >
      <Link href={`/mentorship-program/${program.id}`} className="flex h-full flex-col">
      <div className="group relative flex h-full flex-col rounded-2xl border border-border bg-white p-5 transition-all duration-200 hover:border-black/15 hover:shadow-[0_1px_6px_rgba(0,0,0,0.04)] dark:border-border-dark dark:bg-surface-dark-secondary dark:hover:border-white/10">
        {/* Title + Actions */}
        <div className="mb-2 flex items-start justify-between gap-3">
          <h3 className="text-[15px] font-semibold leading-snug text-text-primary dark:text-text-dark-primary">
            {program.title}
          </h3>
          <div className="flex shrink-0 items-center gap-1">
            {/* Heart */}
            <button
              onClick={handleFavoriteClick}
              className={`rounded-lg p-1.5 transition-all duration-150 ${
                isFavorited
                  ? "text-red-500 hover:text-red-600"
                  : "text-text-tertiary/40 hover:text-red-500 dark:text-text-dark-tertiary/40"
              }`}
              title={isFavorited ? "Remove from saved" : "Save program"}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill={isFavorited ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>

            {showActions && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); onEdit?.(program); }}
                  className="rounded-lg p-1.5 text-text-tertiary transition-colors hover:text-blue-500 dark:text-text-dark-tertiary"
                  title="Edit"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete?.(program.id); }}
                  className="rounded-lg p-1.5 text-text-tertiary transition-colors hover:text-red-500 dark:text-text-dark-tertiary"
                  title="Delete"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    <line x1="10" y1="11" x2="10" y2="17" />
                    <line x1="14" y1="11" x2="14" y2="17" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="mb-3 line-clamp-2 text-[13px] leading-relaxed text-text-tertiary dark:text-text-dark-tertiary">
          {program.description}
        </p>

        {/* Link */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            window.open(program.link, "_blank", "noopener,noreferrer");
          }}
          className="mb-3 flex items-center gap-1.5 text-[12px] font-medium text-blue-500 transition-colors hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
          <span className="truncate">{domain}</span>
        </button>

        {/* Field tags */}
        {program.fieldTags.length > 0 && (() => {
          const maxVisible = 5;
          const visible = program.fieldTags.slice(0, maxVisible);
          const overflow = program.fieldTags.length - maxVisible;
          return (
            <div className="mb-4 flex flex-wrap gap-1.5">
              {visible.map((tag) => (
                <span key={tag} className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${getTagColor(tag).pill}`}>
                  {tag}
                </span>
              ))}
              {overflow > 0 && (
                <span className="rounded-md bg-surface-secondary px-2 py-0.5 text-[11px] font-medium text-text-tertiary dark:bg-surface-dark-tertiary dark:text-text-dark-tertiary">
                  +{overflow} more
                </span>
              )}
            </div>
          );
        })()}

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between text-[11px] text-text-tertiary dark:text-text-dark-tertiary">
          <span>{program.anonymous ? "Anonymous" : program.postedByName}</span>
          <div className="flex items-center gap-2">
            {program.contact && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (program.contact.includes("@")) window.location.href = `mailto:${program.contact}`;
                }}
                className="hover:text-text-primary dark:hover:text-text-dark-primary"
              >
                {program.contact}
              </button>
            )}
            <span className="text-text-tertiary/50 dark:text-text-dark-tertiary/50">·</span>
            <span>{formatDistanceToNow(new Date(program.datePosted), { addSuffix: true })}</span>
          </div>
        </div>
      </div>
      </Link>
    </motion.div>
  );
}
