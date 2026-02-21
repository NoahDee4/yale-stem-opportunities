"use client";

import { Opportunity } from "@/lib/types";
import { getTagColor } from "@/lib/tagColors";
import Link from "next/link";
import { motion } from "framer-motion";
import { formatDistanceToNow, isPast } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { useAuth } from "@/context/AuthContext";
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import toast from "react-hot-toast";

const ET = "America/New_York";

interface Props {
  opportunity: Opportunity;
  index: number;
  isFavorited?: boolean;
  onToggleFavorite?: (id: string) => void;
  showActions?: boolean;
  onEdit?: (opp: Opportunity) => void;
  onDelete?: (id: string) => void;
}

export default function OpportunityCard({
  opportunity,
  index,
  isFavorited = false,
  onToggleFavorite,
  showActions = false,
  onEdit,
  onDelete,
}: Props) {
  const { user } = useAuth();
  const isExpired = isPast(new Date(opportunity.expiresOn));
  const timeLeft = formatDistanceToNow(new Date(opportunity.expiresOn), { addSuffix: true });

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error("Sign in to save opportunities");
      return;
    }
    if (onToggleFavorite) {
      onToggleFavorite(opportunity.id);
    } else {
      // Default Firestore toggle
      const favRef = doc(db, "users", user.uid, "favorites", opportunity.id);
      try {
        if (isFavorited) {
          await deleteDoc(favRef);
          toast.success("Removed from to-do list");
        } else {
          await setDoc(favRef, { addedAt: new Date() });
          toast.success("Added to to-do list");
        }
      } catch {
        toast.error("Something went wrong");
      }
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onEdit) onEdit(opportunity);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) onDelete(opportunity.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link href={`/opportunity/${opportunity.id}`}>
        <div className={`group relative rounded-2xl border border-border bg-white p-5 transition-all duration-200 hover:border-black/15 hover:shadow-[0_1px_6px_rgba(0,0,0,0.04)] dark:border-border-dark dark:bg-surface-dark-secondary dark:hover:border-white/10 ${isExpired ? "opacity-40" : ""}`}>
          {/* Title + Actions */}
          <div className="mb-3 flex items-start justify-between gap-3">
            <h3 className="text-[15px] font-semibold leading-snug text-text-primary dark:text-text-dark-primary">
              {opportunity.title}
            </h3>
            <div className="flex shrink-0 items-center gap-1">
              {/* Heart / Favorite button */}
              <button
                onClick={handleFavoriteClick}
                className={`rounded-lg p-1.5 transition-all duration-150 ${
                  isFavorited
                    ? "text-red-500 hover:text-red-600"
                    : "text-text-tertiary/40 hover:text-red-500 dark:text-text-dark-tertiary/40"
                }`}
                title={isFavorited ? "Remove from to-do list" : "Add to to-do list"}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill={isFavorited ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>
              {/* Edit/Delete for your posts */}
              {showActions && (
                <>
                  <button
                    onClick={handleEditClick}
                    className="rounded-lg p-1.5 text-text-tertiary transition-colors hover:text-blue-500 dark:text-text-dark-tertiary"
                    title="Edit"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button
                    onClick={handleDeleteClick}
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
          <p className="mb-4 line-clamp-2 text-[13px] leading-relaxed text-text-tertiary dark:text-text-dark-tertiary">
            {opportunity.description}
          </p>

          {/* Tags */}
          <div className="mb-4 flex flex-wrap gap-1.5">
            {opportunity.typeTags.map((tag) => (
              <span
                key={tag}
                className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${getTagColor(tag).pill}`}
              >
                {tag}
              </span>
            ))}
            {opportunity.fieldTags.map((tag) => (
              <span
                key={tag}
                className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${getTagColor(tag).pill}`}
              >
                {tag}
              </span>
            ))}
            {opportunity.yearTags.map((tag) => (
              <span
                key={tag}
                className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${getTagColor(tag).pill}`}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-[11px] text-text-tertiary dark:text-text-dark-tertiary">
            <span>{formatInTimeZone(new Date(opportunity.datePosted), ET, "MMM d, yyyy")}</span>
            <span className={isExpired ? "text-red-400" : ""}>
              {isExpired ? "Expired" : `Closes ${timeLeft}`}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
