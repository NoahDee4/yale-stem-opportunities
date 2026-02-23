"use client";

import { useState } from "react";
import { Workshop } from "@/lib/types";
import { getTagColor } from "@/lib/tagColors";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import toast from "react-hot-toast";

interface Props {
  workshop: Workshop;
  index?: number;
  isFavorited?: boolean;
  onToggleFavorite?: (id: string) => void;
  showActions?: boolean;
  onEdit?: (w: Workshop) => void;
  onDelete?: (id: string) => void;
}

export default function WorkshopCard({
  workshop,
  index = 0,
  isFavorited = false,
  onToggleFavorite,
  showActions = false,
  onEdit,
  onDelete,
}: Props) {
  const { user } = useAuth();
  const isPast = new Date(workshop.eventDate) < new Date();

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error("Sign in to save workshops");
      return;
    }
    if (onToggleFavorite) {
      onToggleFavorite(workshop.id);
    } else {
      const ref = doc(db, "users", user.uid, "savedWorkshops", workshop.id);
      try {
        if (isFavorited) {
          await deleteDoc(ref);
          toast.success("Removed from saved workshops");
        } else {
          await setDoc(ref, { addedAt: new Date() });
          toast.success("Workshop saved ❤️");
        }
      } catch {
        toast.error("Something went wrong");
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
    >
      <div
        className={`group relative flex flex-col rounded-2xl border border-border bg-white p-5 transition-all duration-200 hover:border-black/15 hover:shadow-[0_1px_6px_rgba(0,0,0,0.04)] dark:border-border-dark dark:bg-surface-dark-secondary dark:hover:border-white/10 ${isPast ? "opacity-50" : ""}`}
      >
        {/* Title + Actions */}
        <div className="mb-2 flex items-start justify-between gap-3">
          <h3 className="text-[15px] font-semibold leading-snug text-text-primary dark:text-text-dark-primary">
            {workshop.title}
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
              title={isFavorited ? "Remove from saved workshops" : "Save workshop"}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill={isFavorited ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>

            {showActions && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); onEdit?.(workshop); }}
                  className="rounded-lg p-1.5 text-text-tertiary transition-colors hover:text-blue-500 dark:text-text-dark-tertiary"
                  title="Edit"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete?.(workshop.id); }}
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
          {workshop.description}
        </p>

        {/* Location + Date */}
        <div className="mb-3 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-[12px] text-text-secondary dark:text-text-dark-secondary">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span className="truncate">{workshop.location}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[12px] text-text-secondary dark:text-text-dark-secondary">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span className={isPast ? "text-red-400" : ""}>
              {isPast ? "Past — " : ""}{format(new Date(workshop.eventDate), "MMM d, yyyy 'at' h:mm a")}
              {workshop.eventEndTime && (
                <> – {format(new Date(workshop.eventEndTime), "h:mm a")}</>
              )}
            </span>
          </div>
        </div>

        {/* Tags */}
        <div className="mb-4 flex flex-wrap gap-1.5">
          <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${getTagColor(workshop.format).pill}`}>
            {workshop.format}
          </span>
          {workshop.fieldTags.map((tag) => (
            <span key={tag} className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${getTagColor(tag).pill}`}>
              {tag}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between text-[11px] text-text-tertiary dark:text-text-dark-tertiary">
          <span>{workshop.anonymous ? "Anonymous" : workshop.postedByName}</span>
          <span>
            {workshop.contact[0] && (
              <a
                href={workshop.contact[0].includes("@") ? `mailto:${workshop.contact[0]}` : undefined}
                className="hover:text-text-primary dark:hover:text-text-dark-primary"
                onClick={(e) => e.stopPropagation()}
              >
                {workshop.contact[0]}
              </a>
            )}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
