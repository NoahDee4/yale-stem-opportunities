"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Opportunity, TypeTag, FieldTag, YearTag, TYPE_TAGS, FIELD_TAGS, YEAR_TAGS, Mentor, MentorRole, MENTOR_ROLES } from "@/lib/types";
import { getTagColor } from "@/lib/tagColors";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import OpportunityCard from "@/components/OpportunityCard";
import MentorCard from "@/components/MentorCard";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

export default function MyPostsPage() {
  const { user, loading: authLoading, signIn } = useAuth();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit modal state
  const [editing, setEditing] = useState<Opportunity | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    contacts: [""],
    expiresOn: "",
    typeTags: [] as TypeTag[],
    fieldTags: [] as FieldTag[],
    yearTags: [] as YearTag[],
  });
  const [saving, setSaving] = useState(false);

  // Delete confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Mentor edit state
  const [editingMentor, setEditingMentor] = useState<Mentor | null>(null);
  const [editMentorForm, setEditMentorForm] = useState({
    name: "",
    email: "",
    role: "Peer Mentor" as MentorRole,
    fields: [] as FieldTag[],
    bio: "",
  });
  const [savingMentor, setSavingMentor] = useState(false);

  // Mentor delete state
  const [deletingMentorId, setDeletingMentorId] = useState<string | null>(null);

  // Fetch mentors posted by this user
  useEffect(() => {
    if (!user) return;
    getDocs(query(collection(db, "mentors"), where("postedBy", "==", user.uid)))
      .then((snap) => {
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
      })
      .catch((err) => console.error("Error fetching mentors:", err));
  }, [user]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    const q = query(
      collection(db, "opportunities"),
      where("postedBy", "==", user.uid)
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const opps: Opportunity[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            title: data.title,
            datePosted:
              data.datePosted instanceof Timestamp
                ? data.datePosted.toDate()
                : new Date(data.datePosted),
            postedBy: data.postedBy,
            postedByName: data.postedByName || "Anonymous",
            anonymous: data.anonymous ?? false,
            expiresOn:
              data.expiresOn instanceof Timestamp
                ? data.expiresOn.toDate()
                : new Date(data.expiresOn),
            typeTags: data.typeTags || [],
            fieldTags: data.fieldTags || [],
            yearTags: data.yearTags || [],
            contact: Array.isArray(data.contact) ? data.contact : (data.contact ? [data.contact] : []),
            description: data.description,
            approved: data.approved ?? true,
          };
        });
        // Sort client-side (newest first) to avoid needing a composite index
        opps.sort((a, b) => new Date(b.datePosted).getTime() - new Date(a.datePosted).getTime());
        setOpportunities(opps);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching your posts:", error);
        toast.error("Failed to load your posts");
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [user]);

  const openEdit = (opp: Opportunity) => {
    setEditing(opp);
    setEditForm({
      title: opp.title,
      description: opp.description,
      contacts: [...opp.contact],
      expiresOn: new Date(opp.expiresOn).toISOString().split("T")[0],
      typeTags: [...opp.typeTags],
      fieldTags: [...opp.fieldTags],
      yearTags: [...opp.yearTags],
    });
  };

  const handleSaveEdit = async () => {
    if (!editing) return;
    if (!editForm.title || !editForm.description || editForm.contacts.every(c => !c.trim()) || !editForm.expiresOn) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (editForm.typeTags.length === 0) {
      toast.error("Select at least one type");
      return;
    }
    setSaving(true);
    try {
      await updateDoc(doc(db, "opportunities", editing.id), {
        title: editForm.title,
        description: editForm.description,
        contact: editForm.contacts.filter(c => c.trim()),
        expiresOn: Timestamp.fromDate(new Date(editForm.expiresOn + "T23:59:59-05:00")),
        typeTags: editForm.typeTags,
        fieldTags: editForm.fieldTags,
        yearTags: editForm.yearTags,
      });
      toast.success("Updated successfully!");
      setEditing(null);
    } catch (error) {
      console.error("Error updating:", error);
      toast.error("Failed to update");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
  };

  const openMentorEdit = (mentor: Mentor) => {
    setEditingMentor(mentor);
    setEditMentorForm({
      name: mentor.name,
      email: mentor.email,
      role: mentor.role,
      fields: [...mentor.fields],
      bio: mentor.bio || "",
    });
  };

  const handleSaveMentorEdit = async () => {
    if (!editingMentor) return;
    if (!editMentorForm.name.trim() || !editMentorForm.email.trim()) {
      toast.error("Name and email are required");
      return;
    }
    setSavingMentor(true);
    try {
      await updateDoc(doc(db, "mentors", editingMentor.id), {
        name: editMentorForm.name.trim(),
        email: editMentorForm.email.trim(),
        role: editMentorForm.role,
        fields: editMentorForm.fields,
        bio: editMentorForm.bio.trim(),
      });
      setMentors((prev) =>
        prev.map((m) =>
          m.id === editingMentor.id
            ? { ...m, ...editMentorForm, bio: editMentorForm.bio.trim() }
            : m
        )
      );
      toast.success("Mentor updated!");
      setEditingMentor(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update mentor");
    } finally {
      setSavingMentor(false);
    }
  };

  const confirmDeleteMentor = async () => {
    if (!deletingMentorId) return;
    try {
      await deleteDoc(doc(db, "mentors", deletingMentorId));
      setMentors((prev) => prev.filter((m) => m.id !== deletingMentorId));
      toast.success("Mentor listing deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete mentor listing");
    } finally {
      setDeletingMentorId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteDoc(doc(db, "opportunities", deletingId));
      toast.success("Deleted successfully");
    } catch (error) {
      console.error("Error deleting:", error);
      toast.error("Failed to delete");
    } finally {
      setDeletingId(null);
    }
  };

  const toggleTag = <T extends string>(arr: T[], val: T): T[] =>
    arr.includes(val) ? arr.filter((t) => t !== val) : [...arr, val];

  const addEditContact = () => setEditForm({ ...editForm, contacts: [...editForm.contacts, ""] });
  const removeEditContact = (i: number) => setEditForm({ ...editForm, contacts: editForm.contacts.filter((_, idx) => idx !== i) });
  const updateEditContact = (i: number, val: string) => {
    const contacts = [...editForm.contacts];
    contacts[i] = val;
    setEditForm({ ...editForm, contacts });
  };

  if (!authLoading && !user) {
    return (
      <div className="flex min-h-screen flex-col bg-white dark:bg-surface-dark">
        <Navbar />
        <main className="flex flex-1 items-center justify-center px-6">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="mx-auto mb-5 text-5xl">📝</div>
            <h2 className="mb-2 text-xl font-bold text-text-primary dark:text-text-dark-primary">
              Sign in to see your posts
            </h2>
            <p className="mb-6 text-[13px] text-text-tertiary dark:text-text-dark-tertiary">
              You need to be signed in to view and manage your opportunities.
            </p>
            <button onClick={signIn} className="btn-primary">Sign in with Google</button>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-surface-dark">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 lg:px-10">
        <div className="pb-2 pt-12">
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-1 text-2xl font-bold tracking-tight text-text-primary dark:text-text-dark-primary md:text-3xl"
          >
            Your posts
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="text-[15px] text-text-tertiary dark:text-text-dark-tertiary"
          >
            Manage opportunities you&apos;ve shared with the Yale community
          </motion.p>
        </div>

        <div className="mt-6 mb-4">
          <p className="text-[13px] text-text-tertiary dark:text-text-dark-tertiary">
            {loading ? (
              "Loading..."
            ) : (
              <>
                <span className="font-semibold text-text-primary dark:text-text-dark-primary">
                  {opportunities.length}
                </span>{" "}
                {opportunities.length === 1 ? "post" : "posts"}
              </>
            )}
          </p>
        </div>

        {loading ? (
          <div className="grid gap-4 pb-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl border border-border p-5 dark:border-border-dark">
                <div className="mb-3 h-5 w-3/4 rounded-lg bg-surface-tertiary dark:bg-surface-dark-tertiary" />
                <div className="mb-2 h-4 w-full rounded bg-surface-tertiary dark:bg-surface-dark-tertiary" />
                <div className="mb-4 h-4 w-2/3 rounded bg-surface-tertiary dark:bg-surface-dark-tertiary" />
                <div className="flex gap-1.5">
                  <div className="h-5 w-16 rounded-md bg-surface-tertiary dark:bg-surface-dark-tertiary" />
                </div>
              </div>
            ))}
          </div>
        ) : opportunities.length > 0 ? (
          <div className="grid gap-4 pb-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {opportunities.map((opp, i) => (
              <OpportunityCard
                key={opp.id}
                opportunity={opp}
                index={i}
                showActions
                onEdit={openEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="mb-3 text-4xl">📭</div>
            <h3 className="mb-1 text-[15px] font-semibold text-text-primary dark:text-text-dark-primary">
              No posts yet
            </h3>
            <p className="text-[13px] text-text-tertiary dark:text-text-dark-tertiary">
              You haven&apos;t posted any opportunities yet.
            </p>
          </motion.div>
        )}

        {/* Mentor Cards Section */}
        {mentors.length > 0 && (
          <div className="mt-10 border-t border-border pt-10 dark:border-border-dark">
            <motion.h2
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-1 text-xl font-bold tracking-tight text-text-primary dark:text-text-dark-primary"
            >
              Your Mentor Listings
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="mb-4 text-[15px] text-text-tertiary dark:text-text-dark-tertiary"
            >
              Mentor profiles you&apos;ve shared with the community
            </motion.p>
            <div className="grid gap-4 pb-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {mentors.map((mentor, i) => (
                <MentorCard
                  key={mentor.id}
                  mentor={mentor}
                  index={i}
                  canEdit
                  onEdit={() => openMentorEdit(mentor)}
                  canDelete
                  onDelete={() => setDeletingMentorId(mentor.id)}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Edit Modal */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setEditing(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-white p-6 shadow-xl dark:border-border-dark dark:bg-surface-dark"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-bold text-text-primary dark:text-text-dark-primary">
                  Edit opportunity
                </h2>
                <button
                  onClick={() => setEditing(null)}
                  className="rounded-lg p-1.5 text-text-tertiary transition-colors hover:text-text-primary dark:text-text-dark-tertiary dark:hover:text-text-dark-primary"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="mb-1.5 block text-[13px] font-medium text-text-secondary dark:text-text-dark-secondary">
                    Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[13px] font-medium text-text-secondary dark:text-text-dark-secondary">
                    Description <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    rows={4}
                    className="input-field resize-none"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[13px] font-medium text-text-secondary dark:text-text-dark-secondary">
                    Type <span className="text-red-400">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {TYPE_TAGS.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() =>
                          setEditForm({
                            ...editForm,
                            typeTags: toggleTag(editForm.typeTags, tag) as TypeTag[],
                          })
                        }
                        className={`rounded-xl px-3.5 py-2 text-[13px] font-semibold transition-all duration-150 ${
                          editForm.typeTags.includes(tag)
                            ? getTagColor(tag).active
                            : "border border-border text-text-secondary hover:border-black/20 dark:border-border-dark dark:text-text-dark-secondary dark:hover:border-white/15"
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-[13px] font-medium text-text-secondary dark:text-text-dark-secondary">
                    Academic Fields
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {FIELD_TAGS.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() =>
                          setEditForm({
                            ...editForm,
                            fieldTags: toggleTag(editForm.fieldTags, tag) as FieldTag[],
                          })
                        }
                        className={`rounded-xl px-3.5 py-2 text-[13px] font-semibold transition-all duration-150 ${
                          editForm.fieldTags.includes(tag)
                            ? getTagColor(tag).active
                            : "border border-border text-text-secondary hover:border-black/20 dark:border-border-dark dark:text-text-dark-secondary dark:hover:border-white/15"
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-[13px] font-medium text-text-secondary dark:text-text-dark-secondary">
                    School Year
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {YEAR_TAGS.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() =>
                          setEditForm({
                            ...editForm,
                            yearTags: toggleTag(editForm.yearTags, tag) as YearTag[],
                          })
                        }
                        className={`rounded-xl px-3.5 py-2 text-[13px] font-semibold transition-all duration-150 ${
                          editForm.yearTags.includes(tag)
                            ? getTagColor(tag).active
                            : "border border-border text-text-secondary hover:border-black/20 dark:border-border-dark dark:text-text-dark-secondary dark:hover:border-white/15"
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-[13px] font-medium text-text-secondary dark:text-text-dark-secondary">
                      Expires On <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="date"
                      value={editForm.expiresOn}
                      onChange={(e) => setEditForm({ ...editForm, expiresOn: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[13px] font-medium text-text-secondary dark:text-text-dark-secondary">
                      Contact <span className="text-red-400">*</span>
                    </label>
                    <div className="space-y-2">
                      {editForm.contacts.map((c, i) => (
                        <div key={i} className="flex gap-2">
                          <input
                            type="text"
                            value={c}
                            onChange={(e) => updateEditContact(i, e.target.value)}
                            placeholder="Email or name"
                            className="input-field flex-1"
                          />
                          {editForm.contacts.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeEditContact(i)}
                              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border text-text-tertiary transition-colors hover:border-red-300 hover:text-red-500 dark:border-border-dark dark:text-text-dark-tertiary dark:hover:border-red-700 dark:hover:text-red-400"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addEditContact}
                        className="flex items-center gap-1.5 text-[13px] font-medium text-text-tertiary transition-colors hover:text-text-primary dark:text-text-dark-tertiary dark:hover:text-text-dark-primary"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
                        Add another contact
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 border-t border-border pt-5 dark:border-border-dark">
                <button
                  onClick={() => setEditing(null)}
                  className="rounded-xl px-4 py-2.5 text-[13px] font-medium text-text-secondary transition-colors hover:text-text-primary dark:text-text-dark-secondary dark:hover:text-text-dark-primary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={saving}
                  className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <span className="flex items-center gap-2">
                      <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                        <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" className="opacity-75" />
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setDeletingId(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-sm rounded-2xl border border-border bg-white p-6 shadow-xl dark:border-border-dark dark:bg-surface-dark"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-2 text-center text-3xl">🗑️</div>
              <h3 className="mb-2 text-center text-[15px] font-bold text-text-primary dark:text-text-dark-primary">
                Delete this opportunity?
              </h3>
              <p className="mb-6 text-center text-[13px] text-text-tertiary dark:text-text-dark-tertiary">
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeletingId(null)}
                  className="flex-1 rounded-xl border border-border px-4 py-2.5 text-[13px] font-medium text-text-secondary transition-colors hover:border-black/20 dark:border-border-dark dark:text-text-dark-secondary dark:hover:border-white/15"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 rounded-xl bg-red-500 px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mentor Edit Modal */}
      <AnimatePresence>
        {editingMentor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setEditingMentor(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-white p-6 shadow-xl dark:border-border-dark dark:bg-surface-dark"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-bold text-text-primary dark:text-text-dark-primary">Edit mentor listing</h2>
                <button
                  onClick={() => setEditingMentor(null)}
                  className="rounded-lg p-1.5 text-text-tertiary transition-colors hover:text-text-primary dark:text-text-dark-tertiary dark:hover:text-text-dark-primary"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="mb-1.5 block text-[13px] font-medium text-text-secondary dark:text-text-dark-secondary">
                    Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={editMentorForm.name}
                    onChange={(e) => setEditMentorForm({ ...editMentorForm, name: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[13px] font-medium text-text-secondary dark:text-text-dark-secondary">
                    Email <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    value={editMentorForm.email}
                    onChange={(e) => setEditMentorForm({ ...editMentorForm, email: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-[13px] font-medium text-text-secondary dark:text-text-dark-secondary">
                    Role <span className="text-red-400">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {MENTOR_ROLES.map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setEditMentorForm({ ...editMentorForm, role })}
                        className={`rounded-xl px-3.5 py-2 text-[13px] font-semibold transition-all duration-150 ${
                          editMentorForm.role === role
                            ? getTagColor(role).active
                            : "border border-border text-text-secondary hover:border-black/20 dark:border-border-dark dark:text-text-dark-secondary dark:hover:border-white/15"
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-[13px] font-medium text-text-secondary dark:text-text-dark-secondary">
                    Academic Fields
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {FIELD_TAGS.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() =>
                          setEditMentorForm({
                            ...editMentorForm,
                            fields: toggleTag(editMentorForm.fields, tag) as FieldTag[],
                          })
                        }
                        className={`rounded-xl px-3.5 py-2 text-[13px] font-semibold transition-all duration-150 ${
                          editMentorForm.fields.includes(tag)
                            ? getTagColor(tag).active
                            : "border border-border text-text-secondary hover:border-black/20 dark:border-border-dark dark:text-text-dark-secondary dark:hover:border-white/15"
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-[13px] font-medium text-text-secondary dark:text-text-dark-secondary">
                    Bio
                  </label>
                  <textarea
                    value={editMentorForm.bio}
                    onChange={(e) => setEditMentorForm({ ...editMentorForm, bio: e.target.value })}
                    rows={3}
                    className="input-field resize-none"
                    placeholder="A short bio about yourself..."
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 border-t border-border pt-5 dark:border-border-dark">
                <button
                  onClick={() => setEditingMentor(null)}
                  className="rounded-xl px-4 py-2.5 text-[13px] font-medium text-text-secondary transition-colors hover:text-text-primary dark:text-text-dark-secondary dark:hover:text-text-dark-primary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveMentorEdit}
                  disabled={savingMentor}
                  className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {savingMentor ? (
                    <span className="flex items-center gap-2">
                      <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                        <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" className="opacity-75" />
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mentor Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingMentorId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setDeletingMentorId(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-sm rounded-2xl border border-border bg-white p-6 shadow-xl dark:border-border-dark dark:bg-surface-dark"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-2 text-center text-3xl">🗑️</div>
              <h3 className="mb-2 text-center text-[15px] font-bold text-text-primary dark:text-text-dark-primary">
                Delete this mentor listing?
              </h3>
              <p className="mb-6 text-center text-[13px] text-text-tertiary dark:text-text-dark-tertiary">
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeletingMentorId(null)}
                  className="flex-1 rounded-xl border border-border px-4 py-2.5 text-[13px] font-medium text-text-secondary transition-colors hover:border-black/20 dark:border-border-dark dark:text-text-dark-secondary dark:hover:border-white/15"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteMentor}
                  className="flex-1 rounded-xl bg-red-500 px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
