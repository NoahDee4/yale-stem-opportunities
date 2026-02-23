export const TYPE_TAGS = [
  "Fellowship",
  "Internship (Paid)",
  "Internship (Unpaid)",
  "Job",
  "Volunteer",
  "Research",
] as const;

export const FIELD_TAGS = [
  "Pre-Med",
  "Bio-Chem",
  "Computer Science",
  "Engineering",
  "Physics",
  "Mathematics",
  "Environmental Science",
  "Neuroscience",
  "MB&B",
  "MCDB",
  "EEB",
  "Cognitive Science",
] as const;

export const YEAR_TAGS = [
  "Freshman Summer",
  "Sophomore Summer",
  "Junior Summer",
  "Post-Graduation",
  "Gap Year",
] as const;

export type TypeTag = (typeof TYPE_TAGS)[number];
export type FieldTag = (typeof FIELD_TAGS)[number];
export type YearTag = (typeof YEAR_TAGS)[number];

export const MENTOR_ROLES = ["Peer Mentor", "Alumni Mentor", "Faculty"] as const;
export type MentorRole = (typeof MENTOR_ROLES)[number];

export interface Mentor {
  id: string;
  name: string;
  email: string;
  role: MentorRole;
  fields: FieldTag[];
  bio?: string;
  postedBy: string;
  dateJoined: Date;
}

export interface AlumniEntry {
  uid: string;
  name: string;
  email: string;
  photoURL: string | null;
  joinedAt: Date;
}

export interface Opportunity {
  id: string;
  title: string;
  datePosted: Date;
  postedBy: string;
  postedByName: string;
  anonymous: boolean;
  expiresOn: Date;
  typeTags: TypeTag[];
  fieldTags: FieldTag[];
  yearTags: YearTag[];
  contact: string[];
  description: string;
  approved: boolean;
}

export const WORKSHOP_FORMATS = ["In-Person", "Virtual", "Hybrid"] as const;
export type WorkshopFormat = (typeof WORKSHOP_FORMATS)[number];

export interface Workshop {
  id: string;
  title: string;
  description: string;
  location: string;
  eventDate: Date;
  fieldTags: FieldTag[];
  format: WorkshopFormat;
  contact: string[];
  datePosted: Date;
  postedBy: string;
  postedByName: string;
  anonymous: boolean;
}
