export const TYPE_TAGS = [
  "Fellowship",
  "Internship (Paid)",
  "Internship (Unpaid)",
  "Job",
  "Volunteer",
  "Workshop",
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
  contact: string;
  description: string;
  approved: boolean;
}
