export type UserRole = 'user' | 'admin';

export type LanguageCode = 'en' | 'ta' | 'hi';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  age?: number;
  gender?: 'Male' | 'Female' | 'Non-Binary' | 'Prefer not to say' | string;
  city?: string;
  healthConditions?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  allergies?: string[];
  currentMedications?: string[];
  bloodGroup?: string;
  height?: string;
  weight?: string;
  photoUrl?: string;
  preferredLanguage: LanguageCode;
  theme?: 'light' | 'dark';
  easyModeEnabled: boolean;
  isAdmin: boolean;
  createdAt: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  highContrast: boolean;
  reducedMotion: boolean;
  fontSize: 'small' | 'default' | 'large' | 'xlarge';
  locationEnabled: boolean;
  lastKnownLatitude?: number;
  lastKnownLongitude?: number;
  shareAnonymousAnalytics: boolean;
}

export type UrgencyLevel = 'routine' | 'urgent' | 'emergency';

export interface HealthcareCategory {
  id: string;
  nameEn: string;
  nameTa: string;
  nameHi: string;
  descriptionEn: string;
  descriptionTa: string;
  descriptionHi: string;
  iconName: string;
  urgencyLevel: UrgencyLevel;
  displayOrder: number;
}

export interface HealthcareService {
  id: string;
  categoryId: string;
  nameEn: string;
  nameTa?: string;
  nameHi?: string;
  descriptionEn: string;
  keywords: string[];
}

export type FacilityType =
  | 'Hospital'
  | 'Clinic'
  | 'Urgent Care'
  | 'Diagnostic Center'
  | 'Pharmacy'
  | 'Mental Health Clinic'
  | 'Dental Practice'
  | 'Rehab Center';

export interface FacilityLocation {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  latitude: number;
  longitude: number;
  parkingInfo?: string;
}

export interface Facility {
  id: string;
  name: string;
  facilityType: FacilityType;
  description: string;
  rating: number;
  verified: boolean;
  phone: string;
  email: string;
  website: string;
  emergencyAvailable: boolean;
  wheelchairAccessible: boolean;
  languagesSupported: string[];
  location: FacilityLocation;
  openNow?: boolean;
  hours?: {
    dayOfWeek: number;
    openTime: string;
    closeTime: string;
    is24Hours: boolean;
  }[];
  services?: string[];
  distanceKm?: number;
  reviewCount?: number;
}

export interface AIStructuredResponse {
  understanding: string;
  possibleServiceCategory: string;
  categoryId?: string;
  why: string;
  nextSteps: string[];
  importantSafetyMessage: string;
  isEmergency: boolean;
  emergencyHotline?: string;
  suggestedQuestions?: string[];
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  structuredResponse?: AIStructuredResponse;
  timestamp: string;
}

export interface AIConversation {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: AIMessage[];
}

export interface NavigationStep {
  id: string;
  stepKey: 'goal' | 'service' | 'facility' | 'preparation' | 'visit' | 'follow_up';
  title: string;
  description: string;
  isCompleted: boolean;
  completedAt?: string;
  stepOrder: number;
  actionUrl?: string;
}

export interface HealthcareJourney {
  id: string;
  userId: string;
  title: string;
  status: 'active' | 'completed' | 'paused';
  categoryId?: string;
  categoryName?: string;
  selectedFacility?: Facility;
  steps: NavigationStep[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentItem {
  id: string;
  userId: string;
  categoryId: string;
  categoryName: string;
  title: string;
  filePath: string;
  fileSizeBytes: number;
  mimeType: string;
  createdAt: string;
  aiExplanation?: {
    summary: string;
    terminology: { term: string; explanation: string }[];
    suggestedQuestions: string[];
  };
}

export interface FamilyProfile {
  id: string;
  primaryUserId: string;
  fullName: string;
  relationship: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  location?: string;
  emergencyContact?: string;
  healthcareNotes?: string;
  canManageDocuments: boolean;
  canManageNavigation: boolean;
  vaultIsolated?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface AuditLogEntry {
  id: string;
  userId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: Record<string, any>;
  ipAddressHash?: string;
  createdAt: string;
}
