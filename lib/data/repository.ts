import {
  UserProfile,
  Facility,
  HealthcareCategory,
  HealthcareJourney,
  NavigationStep,
  DocumentItem,
  FamilyProfile,
  LanguageCode,
  AuditLogEntry,
} from '@/types';
import { INITIAL_CATEGORIES, VERIFIED_FACILITIES } from './mock-data';
import { calculateHaversineDistance } from '../utils';
import { logAuditEvent } from '../security';

// Browser-safe local storage keys
const STORAGE_KEYS = {
  USER_PROFILE: 'carepath_user_profile',
  REMEMBERED_PROFILES: 'carepath_remembered_profiles',
  SAVED_FACILITIES: 'carepath_saved_facilities',
  JOURNEYS: 'carepath_journeys',
  DOCUMENTS: 'carepath_documents',
  FAMILY_PROFILES: 'carepath_family_profiles',
  NOTIFICATIONS: 'carepath_notifications',
  EASY_MODE: 'carepath_easy_mode',
  LANGUAGE: 'carepath_language',
  THEME: 'carepath_theme',
};

export class CarePathRepository {
  private getStorage<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private setStorage<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Safe fallback when storage quota is restricted
    }
  }

  // --- 1. USER & AUTH ---
  getCurrentUser(): UserProfile | null {
    return this.getStorage<UserProfile | null>(STORAGE_KEYS.USER_PROFILE, null);
  }

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  saveCurrentUser(user: UserProfile): void {
    this.setStorage(STORAGE_KEYS.USER_PROFILE, user);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('carepath_auth_change'));
    }
    // Also store in remembered profiles registry so returning user is remembered on logout
    const remembered = this.getRememberedProfiles();
    const existingIdx = remembered.findIndex((p) => p.email.toLowerCase() === user.email.toLowerCase());
    if (existingIdx >= 0) {
      remembered[existingIdx] = user;
    } else {
      remembered.unshift(user);
    }
    this.setStorage(STORAGE_KEYS.REMEMBERED_PROFILES, remembered);

    logAuditEvent({
      userId: user.id,
      action: 'UPDATE_PROFILE',
      entityType: 'profile',
      entityId: user.id,
      details: { email: user.email, language: user.preferredLanguage, city: user.city },
    });
  }

  getRememberedProfiles(): UserProfile[] {
    return this.getStorage<UserProfile[]>(STORAGE_KEYS.REMEMBERED_PROFILES, []);
  }

  getRememberedUser(email?: string): UserProfile | null {
    const list = this.getRememberedProfiles();
    if (email) {
      return list.find((p) => p.email.toLowerCase() === email.toLowerCase()) || null;
    }
    return list.length > 0 ? list[0] : null;
  }

  updateProfilePhoto(photoDataUrl: string | null): UserProfile | null {
    const user = this.getCurrentUser();
    if (user) {
      user.photoUrl = photoDataUrl || undefined;
      this.saveCurrentUser(user);
      return user;
    }
    return null;
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
      window.dispatchEvent(new Event('carepath_auth_change'));
    }
  }

  // --- 2. CATEGORIES & FACILITIES ---
  getCategories(): HealthcareCategory[] {
    return INITIAL_CATEGORIES;
  }

  getFacilities(filter?: {
    search?: string;
    category?: string;
    openNowOnly?: boolean;
    emergencyOnly?: boolean;
    wheelchairOnly?: boolean;
    userLat?: number;
    userLon?: number;
  }): Facility[] {
    let facilities = [...VERIFIED_FACILITIES];

    if (filter?.userLat !== undefined && filter?.userLon !== undefined) {
      facilities = facilities.map((f) => ({
        ...f,
        distanceKm: calculateHaversineDistance(
          filter.userLat!,
          filter.userLon!,
          f.location.latitude,
          f.location.longitude
        ),
      }));
    }

    if (filter?.search) {
      const q = filter.search.toLowerCase();
      facilities = facilities.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.description.toLowerCase().includes(q) ||
          f.facilityType.toLowerCase().includes(q) ||
          f.location.city.toLowerCase().includes(q) ||
          f.location.state.toLowerCase().includes(q) ||
          f.services?.some((s) => s.toLowerCase().includes(q))
      );
    }

    if (filter?.emergencyOnly) {
      facilities = facilities.filter((f) => f.emergencyAvailable);
    }

    if (filter?.wheelchairOnly) {
      facilities = facilities.filter((f) => f.wheelchairAccessible);
    }

    if (filter?.userLat !== undefined && filter?.userLon !== undefined) {
      facilities.sort((a, b) => (a.distanceKm || 999) - (b.distanceKm || 999));
    }

    return facilities;
  }

  getFacilityById(id: string): Facility | undefined {
    return VERIFIED_FACILITIES.find((f) => f.id === id);
  }

  // --- 3. SAVED FACILITIES ---
  getSavedFacilityIds(): string[] {
    return this.getStorage<string[]>(STORAGE_KEYS.SAVED_FACILITIES, ['fac-001', 'fac-003']);
  }

  toggleSaveFacility(facilityId: string): boolean {
    const saved = this.getSavedFacilityIds();
    const index = saved.indexOf(facilityId);
    let isSavedNow = false;
    if (index > -1) {
      saved.splice(index, 1);
    } else {
      saved.push(facilityId);
      isSavedNow = true;
    }
    this.setStorage(STORAGE_KEYS.SAVED_FACILITIES, saved);
    return isSavedNow;
  }

  // --- 4. HEALTHCARE JOURNEYS ---
  getJourneys(): HealthcareJourney[] {
    const defaultJourney: HealthcareJourney = {
      id: 'jrn-101',
      userId: 'usr-default-001',
      title: 'Consultation for Persistent Shoulder Strain',
      status: 'active',
      categoryId: 'specialists',
      categoryName: 'Orthopedic & Physical Therapy',
      selectedFacility: VERIFIED_FACILITIES[0],
      createdAt: '2026-09-10T14:30:00Z',
      updatedAt: '2026-09-15T11:00:00Z',
      steps: [
        {
          id: 'step-1',
          stepKey: 'goal',
          title: 'Define Healthcare Concern',
          description: 'Identified joint discomfort and non-acute mobility limitation.',
          isCompleted: true,
          completedAt: '2026-09-10T14:32:00Z',
          stepOrder: 1,
        },
        {
          id: 'step-2',
          stepKey: 'service',
          title: 'Review Appropriate Service Category',
          description: 'Matched to Orthopedics and Physical Therapy setting.',
          isCompleted: true,
          completedAt: '2026-09-11T09:15:00Z',
          stepOrder: 2,
        },
        {
          id: 'step-3',
          stepKey: 'facility',
          title: 'Select Verified Healthcare Facility',
          description: 'Selected MetroHealth Central Medical Center.',
          isCompleted: true,
          completedAt: '2026-09-12T16:00:00Z',
          stepOrder: 3,
        },
        {
          id: 'step-4',
          stepKey: 'preparation',
          title: 'Prepare Questions & Previous Records',
          description: 'Gathered questions and checked previous radiology scans.',
          isCompleted: false,
          stepOrder: 4,
        },
        {
          id: 'step-5',
          stepKey: 'visit',
          title: 'Attend Healthcare Appointment',
          description: 'Consult with physician and note practical instructions.',
          isCompleted: false,
          stepOrder: 5,
        },
        {
          id: 'step-6',
          stepKey: 'follow_up',
          title: 'Post-Visit Follow-Up Action',
          description: 'Coordinate prescribed rehabilitation exercises.',
          isCompleted: false,
          stepOrder: 6,
        },
      ],
    };

    return this.getStorage<HealthcareJourney[]>(STORAGE_KEYS.JOURNEYS, [defaultJourney]);
  }

  saveJourney(journey: HealthcareJourney): void {
    const list = this.getJourneys();
    const idx = list.findIndex((j) => j.id === journey.id);
    if (idx >= 0) {
      list[idx] = journey;
    } else {
      list.unshift(journey);
    }
    this.setStorage(STORAGE_KEYS.JOURNEYS, list);
  }

  updateJourneyStep(journeyId: string, stepId: string, isCompleted: boolean): HealthcareJourney | null {
    const list = this.getJourneys();
    const journey = list.find((j) => j.id === journeyId);
    if (!journey) return null;

    const step = journey.steps.find((s) => s.id === stepId);
    if (step) {
      step.isCompleted = isCompleted;
      step.completedAt = isCompleted ? new Date().toISOString() : undefined;
      journey.updatedAt = new Date().toISOString();
      this.setStorage(STORAGE_KEYS.JOURNEYS, list);
    }
    return journey;
  }

  // --- 5. DOCUMENT VAULT ---
  getDocuments(userId?: string): DocumentItem[] {
    const currentUserId = userId || this.getCurrentUser()?.id || 'usr-default-001';
    const initialDocs: DocumentItem[] = [
      {
        id: 'doc-001',
        userId: 'usr-default-001',
        categoryId: 'lab_reports',
        categoryName: 'Laboratory & Blood Tests (NABL)',
        title: 'Comprehensive Metabolic Panel & Lipid Profile',
        filePath: '/secure_vault/usr-default-001/metabolic_panel_2026.pdf',
        fileSizeBytes: 245000,
        mimeType: 'application/pdf',
        createdAt: '2026-08-20T10:14:00Z',
        aiExplanation: {
          summary:
            'Standard outpatient metabolic panel evaluating kidney function, blood glucose, electrolytes, and lipid proteins.',
          terminology: [
            {
              term: 'Serum Glucose',
              explanation: 'Measures circulating blood sugar at the time of fasting blood draw.',
            },
            {
              term: 'eGFR',
              explanation: 'Estimated Glomerular Filtration Rate, calculating kidney filtering efficiency.',
            },
            {
              term: 'HDL / LDL',
              explanation: 'High-density (protective) and low-density cholesterol fractions.',
            },
          ],
          suggestedQuestions: [
            'Are my cholesterol and glucose levels within healthy targets for my age?',
            'Do these test metrics suggest any dietary modifications?',
          ],
        },
      },
      {
        id: 'doc-002',
        userId: 'usr-default-001',
        categoryId: 'prescriptions',
        categoryName: 'Prescriptions & Medications',
        title: 'Physician Consultation & Prescription Note',
        filePath: '/secure_vault/usr-default-001/prescription_note.pdf',
        fileSizeBytes: 184000,
        mimeType: 'application/pdf',
        createdAt: '2026-09-02T16:45:00Z',
      },
    ];

    const allDocs = this.getStorage<DocumentItem[]>(STORAGE_KEYS.DOCUMENTS, initialDocs);
    return allDocs.filter((d) => d.userId === currentUserId);
  }

  addDocument(doc: DocumentItem): void {
    const currentUserId = this.getCurrentUser()?.id || 'usr-default-001';
    doc.userId = currentUserId;
    const allDocs = this.getStorage<DocumentItem[]>(STORAGE_KEYS.DOCUMENTS, []);
    allDocs.unshift(doc);
    this.setStorage(STORAGE_KEYS.DOCUMENTS, allDocs);
    logAuditEvent({
      userId: doc.userId,
      action: 'UPLOAD_DOCUMENT',
      entityType: 'document',
      entityId: doc.id,
      details: { title: doc.title, category: doc.categoryName },
    });
  }

  deleteDocument(docId: string): void {
    const currentUserId = this.getCurrentUser()?.id || 'usr-default-001';
    let allDocs = this.getStorage<DocumentItem[]>(STORAGE_KEYS.DOCUMENTS, []);
    allDocs = allDocs.filter((d) => !(d.id === docId && d.userId === currentUserId));
    this.setStorage(STORAGE_KEYS.DOCUMENTS, allDocs);
    logAuditEvent({
      userId: currentUserId,
      action: 'DELETE_DOCUMENT',
      entityType: 'document',
      entityId: docId,
    });
  }

  // --- 6. FAMILY PROFILES ---
  getFamilyProfiles(): FamilyProfile[] {
    const defaultFamily: FamilyProfile[] = [
      {
        id: 'fam-001',
        primaryUserId: 'usr-default-001',
        fullName: 'Devi Patel',
        relationship: 'Parent',
        dateOfBirth: '1958-04-12',
        emergencyContact: '+1 (555) 987-6543',
        canManageDocuments: true,
        canManageNavigation: true,
        createdAt: '2026-02-01T10:00:00Z',
      },
      {
        id: 'fam-002',
        primaryUserId: 'usr-default-001',
        fullName: 'Aarav Patel',
        relationship: 'Child',
        dateOfBirth: '2019-11-20',
        emergencyContact: '+1 (555) 234-5678',
        canManageDocuments: true,
        canManageNavigation: true,
        createdAt: '2026-03-15T12:00:00Z',
      },
    ];

    return this.getStorage<FamilyProfile[]>(STORAGE_KEYS.FAMILY_PROFILES, defaultFamily);
  }

  saveFamilyProfile(profile: FamilyProfile): void {
    const list = this.getFamilyProfiles();
    const idx = list.findIndex((p) => p.id === profile.id);
    if (idx >= 0) {
      list[idx] = profile;
    } else {
      list.push(profile);
    }
    this.setStorage(STORAGE_KEYS.FAMILY_PROFILES, list);
  }

  deleteFamilyProfile(id: string): void {
    let list = this.getFamilyProfiles();
    list = list.filter((p) => p.id !== id);
    this.setStorage(STORAGE_KEYS.FAMILY_PROFILES, list);
  }

  // --- 7. EXPORT & DELETION (PRIVACY CENTER) ---
  exportPersonalData(): string {
    const data = {
      profile: this.getCurrentUser(),
      savedFacilities: this.getSavedFacilityIds(),
      journeys: this.getJourneys(),
      documents: this.getDocuments().map((d) => ({
        id: d.id,
        title: d.title,
        category: d.categoryName,
        createdAt: d.createdAt,
      })),
      familyProfiles: this.getFamilyProfiles(),
      exportedAt: new Date().toISOString(),
      platform: 'CarePath AI Privacy Export',
    };
    return JSON.stringify(data, null, 2);
  }

  purgeAllUserData(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
      localStorage.removeItem(STORAGE_KEYS.SAVED_FACILITIES);
      localStorage.removeItem(STORAGE_KEYS.JOURNEYS);
      localStorage.removeItem(STORAGE_KEYS.DOCUMENTS);
      localStorage.removeItem(STORAGE_KEYS.FAMILY_PROFILES);
      localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    }
    logAuditEvent({
      action: 'PURGE_ACCOUNT_DATA',
      entityType: 'account',
      details: { reason: 'User requested complete data deletion.' },
    });
  }
}

export const repository = new CarePathRepository();
