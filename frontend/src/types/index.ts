export interface WasteReport {
  id?: string;
  title: string;
  description: string;
  category: WasteCategory;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  images: string[];
  status: ReportStatus;
  priority: Priority;
  reportedBy: string;
  assignedTo?: string; // Cleaner assigned to this report
  reportedAt: Date;
  updatedAt: Date;
}

export enum WasteCategory {
  GARBAGE_OVERFLOW = 'Garbage Overflow',
  ILLEGAL_DUMPING = 'Illegal Dumping',
  RECYCLING_ISSUE = 'Recycling Issue',
  HAZARDOUS_WASTE = 'Hazardous Waste',
  DEAD_ANIMAL = 'Dead Animal',
  OTHER = 'Other'
}

export enum ReportStatus {
  PENDING = 'Pending',
  IN_PROGRESS = 'In Progress',
  RESOLVED = 'Resolved',
  CLOSED = 'Closed'
}

export enum Priority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  URGENT = 'Urgent'
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  assignedArea?: string; // For cleaners - their assigned cleanup area
  permissions?: string[]; // For fine-grained permissions
}

export enum UserRole {
  USER = 'user',        // Citizens who report waste issues
  CLEANER = 'cleaner',  // Waste management staff who handle cleanup
  ADMIN = 'admin'       // System administrators
}