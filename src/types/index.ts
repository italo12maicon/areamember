export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  isAdmin: boolean;
  registrationDate: string;
  unlockedCourses: string[];
  unlockedProducts: string[]; // Nova propriedade para produtos desbloqueados
  isBlocked?: boolean;
  blockedReason?: string;
  blockedAt?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  isBlocked: boolean;
  unlockAfterDays?: number;
  manualUnlockOnly?: boolean;
  unblockLink?: string;
  scheduledUnlockDate?: string;
  lessons: Lesson[];
  topics?: Topic[]; // Nova propriedade opcional para tópicos
}

// Nova interface para produtos (idêntica aos cursos)
export interface Product {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  isBlocked: boolean;
  unlockAfterDays?: number;
  manualUnlockOnly?: boolean;
  unblockLink?: string;
  scheduledUnlockDate?: string;
  lessons: Lesson[];
  topics?: Topic[]; // Nova propriedade opcional para tópicos
}

// Nova interface para tópicos
export interface Topic {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
  order: number;
  lessons: Lesson[];
  createdAt: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  youtubeUrl: string;
  thumbnailUrl?: string; // Nova propriedade opcional para thumbnail personalizada
  additionalLink?: string;
  additionalLinks?: AdditionalLink[];
}

export interface AdditionalLink {
  id: string;
  title: string;
  url: string;
}

export interface Banner {
  id: string;
  imageUrl: string;
  linkUrl: string;
  title: string;
  isActive: boolean;
  order: number;
  createdAt: string;
}

export interface FixedNotification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info' | 'promotion';
  isActive: boolean;
  startDate: string;
  endDate: string;
  buttonText?: string;
  buttonUrl?: string;
  createdAt: string;
}

export interface UserSession {
  id: string;
  userId: string;
  ipAddress: string;
  userAgent: string;
  loginTime: string;
  lastActivity: string;
  isActive: boolean;
  location?: string;
  device?: string;
  browser?: string;
  logoutTime?: string;
  sessionDuration?: number;
}

export interface SecurityLog {
  id: string;
  userId: string;
  action: 'login' | 'logout' | 'blocked' | 'unblocked' | 'suspicious_activity' | 'multiple_ips';
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  adminId?: string;
}

export interface SecuritySettings {
  maxConcurrentSessions: number;
  sessionTimeout: number;
  blockOnMultipleIPs: boolean;
  allowedIPsPerUser: number;
  suspiciousActivityThreshold: number;
  enableGeoBlocking: boolean;
  allowedCountries: string[];
  enableDeviceTracking: boolean;
  requireReauthOnNewDevice: boolean;
}

export interface AppSettings {
  whatsappNumber: string;
  socialLinks: {
    email: string;
    instagram: string;
    whatsapp: string;
  };
  customizations: {
    primaryColor: string;
    logoText: string;
    logoUrl?: string;
    faviconUrl?: string;
    secondaryColor?: string;
  };
  helpCenter?: {
    tutorialsUrl?: string;
    supportHours?: string;
  };
  security?: SecuritySettings;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info' | 'course' | 'system';
  read: boolean;
  createdAt: string;
}

export interface WatchHistory {
  id: string;
  userId: string;
  courseId?: string; // Opcional para compatibilidade
  productId?: string; // Nova propriedade para produtos
  topicId?: string; // Nova propriedade para tópicos
  lastLessonId: string;
  lastWatchedAt: string;
  firstWatchedAt?: string;
  watchTimeMinutes: number;
  completedLessons: string[];
}

export interface Favorite {
  id: string;
  userId: string;
  courseId?: string; // Opcional para compatibilidade
  productId?: string; // Nova propriedade para produtos
  topicId?: string; // Nova propriedade para tópicos
  addedAt: string;
}

export interface Resource {
  id: string;
  courseId?: string; // Opcional para compatibilidade
  productId?: string; // Nova propriedade para produtos
  topicId?: string; // Nova propriedade para tópicos
  title: string;
  description: string;
  type: 'pdf' | 'video' | 'image' | 'link' | 'file';
  url: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  category: string;
  priority: string;
  message: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
}