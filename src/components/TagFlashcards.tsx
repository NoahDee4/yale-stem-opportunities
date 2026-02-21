"use client";

import { TYPE_TAGS, FIELD_TAGS, TypeTag, FieldTag } from "@/lib/types";
import { getTagColor } from "@/lib/tagColors";
import { motion } from "framer-motion";

interface Props {
  selectedTypes: TypeTag[];
  selectedFields: FieldTag[];
  onTypeChange: (tags: TypeTag[]) => void;
  onFieldChange: (tags: FieldTag[]) => void;
}

export default function TagFlashcards({
  selectedTypes,
  selectedFields,
  onTypeChange,
  onFieldChange,
}: Props) {
  const toggleType = (tag: TypeTag) => {
    if (selectedTypes.includes(tag)) {
      onTypeChange(selectedTypes.filter((t) => t !== tag));
    } else {
      onTypeChange([...selectedTypes, tag]);
    }
  };

  const toggleField = (tag: FieldTag) => {
    if (selectedFields.includes(tag)) {
      onFieldChange(selectedFields.filter((t) => t !== tag));
    } else {
      onFieldChange([...selectedFields, tag]);
    }
  };

  const typeIcons: Record<string, string> = {
    Fellowship: "🎓",
    Internship: "💼",
    Job: "🏢",
    Workshop: "🔧",
    Research: "🔬",
  };

  const fieldIcons: Record<string, string> = {
    "Pre-Med": "🩺",
    "Bio-Chem": "🧬",
    "Computer Science": "💻",
    Engineering: "⚙️",
    Physics: "⚛️",
    Mathematics: "📐",
    "Environmental Science": "🌿",
    Neuroscience: "🧠",
  };

  return (
    <div className="space-y-5">
      {/* Type flashcards */}
      <div>
        <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary dark:text-text-dark-tertiary">
          Type
        </p>
        <div className="flex flex-wrap gap-2">
          {TYPE_TAGS.map((tag, i) => {
            const active = selectedTypes.includes(tag);
            return (
              <motion.button
                key={tag}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => toggleType(tag)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold transition-all duration-150 ${
                  active
                    ? `${getTagColor(tag).active} shadow-sm`
                    : "border border-border bg-white text-text-secondary hover:border-black/20 hover:text-text-primary dark:border-border-dark dark:bg-surface-dark-secondary dark:text-text-dark-secondary dark:hover:border-white/15 dark:hover:text-text-dark-primary"
                }`}
              >
                <span className="text-base">{typeIcons[tag]}</span>
                {tag}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Field flashcards */}
      <div>
        <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary dark:text-text-dark-tertiary">
          Field
        </p>
        <div className="flex flex-wrap gap-2">
          {FIELD_TAGS.map((tag, i) => {
            const active = selectedFields.includes(tag);
            return (
              <motion.button
                key={tag}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 + 0.15 }}
                onClick={() => toggleField(tag)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold transition-all duration-150 ${
                  active
                    ? `${getTagColor(tag).active} shadow-sm`
                    : "border border-border bg-white text-text-secondary hover:border-black/20 hover:text-text-primary dark:border-border-dark dark:bg-surface-dark-secondary dark:text-text-dark-secondary dark:hover:border-white/15 dark:hover:text-text-dark-primary"
                }`}
              >
                <span className="text-base">{fieldIcons[tag]}</span>
                {tag}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
