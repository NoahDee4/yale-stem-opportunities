export const TYPE_TAGS = [
  "Fellowship",
  "Internship",
  "Job",
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
] as const;

export type TypeTag = (typeof TYPE_TAGS)[number];
export type FieldTag = (typeof FIELD_TAGS)[number];

export interface Opportunity {
  id: string;
  title: string;
  datePosted: Date;
  postedBy: string;
  postedByName: string;
  expiresOn: Date;
  typeTags: TypeTag[];
  fieldTags: FieldTag[];
  contact: string;
  description: string;
  approved: boolean;
}
