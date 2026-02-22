"use client";

import { useState, useEffect, useMemo } from "react";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Mentor,
  MentorRole,
  MENTOR_ROLES,
  FIELD_TAGS,
  FieldTag,
} from "@/lib/types";
import { getTagColor } from "@/lib/tagColors";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MentorCard from "@/components/MentorCard";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

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

export default function MentorshipPage() {
  const { user, signIn } = useAuth();
  const [tab, setTab] = useState<"browse" | "signup">("browse");
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loadingMentors, setLoadingMentors] = useState(true);

  // Filters
  const [selectedRoles, setSelectedRoles] = useState<MentorRole[]>([]);
  const [selectedFields, setSelectedFields] = useState<FieldTag[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Sign-up form
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "" as MentorRole | "",
    fields: [] as FieldTag[],
    bio: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Pre-fill form from user
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: prev.name || user.displayName || "",
        email: prev.email || user.email || "",
      }));
    }
  }, [user]);

  // Realtime mentor list
  useEffect(() => {
    const q = query(collection(db, "mentors"), orderBy("dateJoined", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const m: Mentor[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          name: data.name,
          email: data.email,
          role: data.role as MentorRole,
          fields: data.fields || [],
          bio: data.bio || "",
          postedBy: data.postedBy,
          dateJoined:
            data.dateJoined instanceof Timestamp
              ? data.dateJoined.toDate()
              : new Date(data.dateJoined),
        };
      });
      setMentors(m);
      setLoadingMentors(false);
    });
    return () => unsub();
  }, []);

  const toggleRole = (role: MentorRole) =>
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );

  const toggleField = (field: FieldTag) =>
    setSelectedFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]
    );

  const toggleFormField = (field: FieldTag) =>
    setForm((prev) => ({
      ...prev,
      fields: prev.fields.includes(field)
        ? prev.fields.filter((f) => f !== field)
        : [...prev.fields, field],
    }));

  const filtered = useMemo(() => {
    return mentors.filter((m) => {
      if (selectedRoles.length > 0 && !selectedRoles.includes(m.role)) return false;
      if (selectedFields.length > 0 && !m.fields.some((f) => selectedFields.includes(f))) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          m.name.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          m.bio?.toLowerCase().includes(q) ||
          m.fields.some((f) => f.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [mentors, selectedRoles, selectedFields, searchQuery]);

  const handleDelete = async (mentorId: string) => {
    try {
      await deleteDoc(doc(db, "mentors", mentorId));
      toast.success("You've been removed as a mentor.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove. Try again.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error("Please sign in first"); return; }
    if (!form.name.trim() || !form.email.trim() || !form.role) {
      toast.error("Please fill in name, email, and role");
      return;
    }
    if (form.fields.length === 0) {
      toast.error("Select at least one academic field");
      return;
    }
    setSubmitting(true);
    try {
      await addDoc(collection(db, "mentors"), {
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role,
        fields: form.fields,
        bio: form.bio.trim(),
        postedBy: user.uid,
        dateJoined: Timestamp.now(),
      });
      toast.success("You're now listed as a mentor! 🎉");
      setTab("browse");
      setForm({ name: "", email: "", role: "", fields: [], bio: "" });
    } catch (err) {
      console.error(err);
      toast.error("Failed to sign up. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-surface-dark">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 lg:px-10">
        {/* Header */}
        <div className="pb-2 pt-12">
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-1 text-2xl font-bold tracking-tight text-text-primary dark:text-text-dark-primary md:text-3xl"
          >
            Mentorship
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="text-[15px] text-text-tertiary dark:text-text-dark-tertiary"
          >
            Connect with peers, alumni, and faculty across STEM fields
          </motion.p>
        </div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mt-6 flex gap-1 rounded-xl border border-border bg-surface-secondary p-1 dark:border-border-dark dark:bg-surface-dark-secondary sm:w-fit"
        >
          {(["browse", "signup"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-lg px-5 py-2 text-[13px] font-medium transition-colors duration-150 ${
                tab === t
                  ? "bg-white text-text-primary shadow-sm dark:bg-surface-dark dark:text-text-dark-primary"
                  : "text-text-tertiary hover:text-text-primary dark:text-text-dark-tertiary dark:hover:text-text-dark-primary"
              }`}
            >
              {t === "browse" ? "Browse Mentors" : "Become a Mentor"}
            </button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          {tab === "browse" ? (
            <motion.div
              key="browse"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25 }}
              className="mt-6"
            >
              {/* Search */}
              <div className="relative mb-4 max-w-md">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary dark:text-text-dark-tertiary" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  placeholder="Search mentors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field pl-9"
                />
              </div>

              {/* Role filter */}
              <div className="mb-3">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary dark:text-text-dark-tertiary">
                  Role
                </p>
                <div className="flex flex-wrap gap-2">
                  {MENTOR_ROLES.map((role) => (
                    <button
                      key={role}
                      onClick={() => toggleRole(role)}
                      className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-[13px] font-semibold transition-all duration-150 ${
                        selectedRoles.includes(role)
                          ? `${getTagColor(role).active} shadow-sm`
                          : "border border-border bg-white text-text-secondary hover:border-black/20 hover:text-text-primary dark:border-border-dark dark:bg-surface-dark-secondary dark:text-text-dark-secondary dark:hover:border-white/15 dark:hover:text-text-dark-primary"
                      }`}
                    >
                      <span>{roleIcons[role]}</span>
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              {/* Field filter */}
              <div className="mb-6">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-text-tertiary dark:text-text-dark-tertiary">
                  Field
                </p>
                <div className="flex flex-wrap gap-2">
                  {FIELD_TAGS.map((field) => (
                    <button
                      key={field}
                      onClick={() => toggleField(field)}
                      className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[13px] font-semibold transition-all duration-150 ${
                        selectedFields.includes(field)
                          ? `${getTagColor(field).active} shadow-sm`
                          : "border border-border bg-white text-text-secondary hover:border-black/20 hover:text-text-primary dark:border-border-dark dark:bg-surface-dark-secondary dark:text-text-dark-secondary dark:hover:border-white/15 dark:hover:text-text-dark-primary"
                      }`}
                    >
                      <span>{fieldIcons[field]}</span>
                      {field}
                    </button>
                  ))}
                </div>
              </div>

              {/* Results */}
              {loadingMentors ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="animate-pulse rounded-2xl border border-border bg-white p-5 dark:border-border-dark dark:bg-surface-dark-secondary">
                      <div className="mb-3 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-surface-tertiary dark:bg-surface-dark-tertiary" />
                        <div className="flex-1 space-y-1.5">
                          <div className="h-3.5 w-3/4 rounded bg-surface-tertiary dark:bg-surface-dark-tertiary" />
                          <div className="h-3 w-1/2 rounded bg-surface-tertiary dark:bg-surface-dark-tertiary" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <div className="h-3 w-full rounded bg-surface-tertiary dark:bg-surface-dark-tertiary" />
                        <div className="h-3 w-5/6 rounded bg-surface-tertiary dark:bg-surface-dark-tertiary" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="mb-3 text-4xl">🔍</div>
                  <p className="text-[14px] font-medium text-text-primary dark:text-text-dark-primary">No mentors found</p>
                  <p className="mt-1 text-[13px] text-text-tertiary dark:text-text-dark-tertiary">
                    Try adjusting your filters or{" "}
                    <button onClick={() => setTab("signup")} className="font-medium underline underline-offset-2 hover:no-underline">
                      be the first to sign up
                    </button>
                    .
                  </p>
                </div>
              ) : (
                <>
                  <p className="mb-4 text-[13px] text-text-tertiary dark:text-text-dark-tertiary">
                    {filtered.length} mentor{filtered.length !== 1 ? "s" : ""}
                    {selectedRoles.length + selectedFields.length > 0 ? " matching filters" : ""}
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filtered.map((mentor, i) => (
                      <MentorCard
                        key={mentor.id}
                        mentor={mentor}
                        index={i}
                        canDelete={user?.uid === mentor.postedBy}
                        onDelete={() => handleDelete(mentor.id)}
                      />
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="signup"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25 }}
              className="mt-6 pb-16"
            >
              {!user ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="mb-4 text-5xl">🤝</div>
                  <h2 className="mb-2 text-xl font-bold text-text-primary dark:text-text-dark-primary">Sign in to become a mentor</h2>
                  <p className="mb-6 text-[13px] text-text-tertiary dark:text-text-dark-tertiary">
                    You need to be signed in to register as a mentor.
                  </p>
                  <button onClick={signIn} className="btn-primary">Sign in with Google</button>
                </div>
              ) : (
                <div className="mx-auto max-w-2xl">
                  <div className="mb-8 rounded-2xl border border-border bg-surface-secondary p-5 dark:border-border-dark dark:bg-surface-dark-secondary">
                    <p className="text-[13px] font-medium text-text-secondary dark:text-text-dark-secondary">
                      💡 By signing up, your name, email, role, and fields will be visible to all Yale STEM Opportunities users so students can reach out to you directly.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name */}
                    <div>
                      <label className="mb-1.5 block text-[13px] font-medium text-text-secondary dark:text-text-dark-secondary">
                        Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Your full name"
                        className="input-field"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="mb-1.5 block text-[13px] font-medium text-text-secondary dark:text-text-dark-secondary">
                        Email <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="your@email.com"
                        className="input-field"
                      />
                    </div>

                    {/* Role */}
                    <div>
                      <label className="mb-2 block text-[13px] font-medium text-text-secondary dark:text-text-dark-secondary">
                        Role <span className="text-red-400">*</span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {MENTOR_ROLES.map((role) => (
                          <button
                            key={role}
                            type="button"
                            onClick={() => setForm({ ...form, role })}
                            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold transition-all duration-150 ${
                              form.role === role
                                ? `${getTagColor(role).active} shadow-sm`
                                : "border border-border text-text-secondary hover:border-black/20 dark:border-border-dark dark:text-text-dark-secondary dark:hover:border-white/15"
                            }`}
                          >
                            <span>{roleIcons[role]}</span>
                            {role}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Academic Fields */}
                    <div>
                      <label className="mb-2 block text-[13px] font-medium text-text-secondary dark:text-text-dark-secondary">
                        Academic Fields <span className="text-red-400">*</span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {FIELD_TAGS.map((field) => (
                          <button
                            key={field}
                            type="button"
                            onClick={() => toggleFormField(field)}
                            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[13px] font-semibold transition-all duration-150 ${
                              form.fields.includes(field)
                                ? `${getTagColor(field).active} shadow-sm`
                                : "border border-border text-text-secondary hover:border-black/20 dark:border-border-dark dark:text-text-dark-secondary dark:hover:border-white/15"
                            }`}
                          >
                            <span>{fieldIcons[field]}</span>
                            {field}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Bio */}
                    <div>
                      <label className="mb-1.5 block text-[13px] font-medium text-text-secondary dark:text-text-dark-secondary">
                        Bio{" "}
                        <span className="font-normal text-text-tertiary dark:text-text-dark-tertiary">(optional)</span>
                      </label>
                      <textarea
                        value={form.bio}
                        onChange={(e) => setForm({ ...form, bio: e.target.value })}
                        placeholder="Tell students a bit about yourself, your research, or how you can help..."
                        rows={4}
                        className="input-field resize-none"
                      />
                    </div>

                    <div className="flex items-center justify-between border-t border-border pt-6 dark:border-border-dark">
                      <p className="text-[12px] text-text-tertiary dark:text-text-dark-tertiary">
                        Signing up as{" "}
                        <span className="font-medium text-text-secondary dark:text-text-dark-secondary">
                          {user.displayName || user.email}
                        </span>
                      </p>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="btn-primary disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {submitting ? (
                          <span className="flex items-center gap-2">
                            <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                              <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" className="opacity-75" />
                            </svg>
                            Signing up...
                          </span>
                        ) : (
                          "Sign Up as Mentor"
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
