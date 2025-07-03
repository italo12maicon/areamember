import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { 
  User, 
  Course, 
  Product, 
  AppSettings, 
  Notification, 
  WatchHistory, 
  Favorite, 
  Resource, 
  SupportTicket, 
  Banner, 
  FixedNotification, 
  UserSession, 
  SecurityLog 
} from '../types';

// Coleções do Firestore
export const COLLECTIONS = {
  USERS: 'users',
  COURSES: 'courses',
  PRODUCTS: 'products',
  SETTINGS: 'settings',
  NOTIFICATIONS: 'notifications',
  WATCH_HISTORY: 'watchHistory',
  FAVORITES: 'favorites',
  RESOURCES: 'resources',
  SUPPORT_TICKETS: 'supportTickets',
  BANNERS: 'banners',
  FIXED_NOTIFICATIONS: 'fixedNotifications',
  USER_SESSIONS: 'userSessions',
  SECURITY_LOGS: 'securityLogs'
};

// Função para converter timestamp do Firestore
const convertTimestamp = (timestamp: any) => {
  if (timestamp && timestamp.toDate) {
    return timestamp.toDate().toISOString();
  }
  return timestamp;
};

// Função para converter dados do Firestore
const convertFirestoreData = (data: any) => {
  if (!data) return data;
  
  const converted = { ...data };
  
  // Converter timestamps
  Object.keys(converted).forEach(key => {
    if (converted[key] && typeof converted[key] === 'object' && converted[key].toDate) {
      converted[key] = convertTimestamp(converted[key]);
    }
  });
  
  return converted;
};

// Inicializar dados padrão
export const initializeDefaultData = async () => {
  try {
    // Verificar se já existem configurações
    const settingsRef = doc(db, COLLECTIONS.SETTINGS, 'main');
    const settingsSnap = await getDoc(settingsRef);
    
    if (!settingsSnap.exists()) {
      // Criar configurações padrão
      const defaultSettings: AppSettings = {
        whatsappNumber: '+5511999999999',
        socialLinks: {
          email: 'contato@exemplo.com',
          instagram: '@exemplo',
          whatsapp: '+5511999999999'
        },
        customizations: {
          primaryColor: '#e50914',
          logoText: 'MemberArea',
          logoUrl: '',
          faviconUrl: '',
          secondaryColor: '#6b7280'
        },
        helpCenter: {
          tutorialsUrl: '',
          supportHours: '24/7 disponível'
        },
        security: {
          maxConcurrentSessions: 3,
          sessionTimeout: 480,
          blockOnMultipleIPs: false,
          allowedIPsPerUser: 5,
          suspiciousActivityThreshold: 3,
          enableGeoBlocking: false,
          allowedCountries: ['BR'],
          enableDeviceTracking: true,
          requireReauthOnNewDevice: false
        }
      };
      
      await setDoc(settingsRef, {
        ...defaultSettings,
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ Configurações padrão criadas');
    }
    
    // Verificar se existe usuário admin
    const usersQuery = query(
      collection(db, COLLECTIONS.USERS), 
      where('email', '==', 'member@gmail.com')
    );
    const usersSnap = await getDocs(usersQuery);
    
    if (usersSnap.empty) {
      // Criar usuário admin padrão
      const adminUser: Omit<User, 'id'> = {
        email: 'member@gmail.com',
        password: 'member123#',
        name: 'Administrator',
        isAdmin: true,
        registrationDate: new Date().toISOString(),
        unlockedCourses: [],
        unlockedProducts: [],
        isBlocked: false
      };
      
      await setDoc(doc(db, COLLECTIONS.USERS, 'admin'), {
        ...adminUser,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ Usuário admin criado');
    }
    
  } catch (error) {
    console.error('❌ Erro ao inicializar dados padrão:', error);
    throw error;
  }
};

// CRUD para Usuários
export const userService = {
  async getAll(): Promise<User[]> {
    const snapshot = await getDocs(collection(db, COLLECTIONS.USERS));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...convertFirestoreData(doc.data())
    } as User));
  },

  async getById(id: string): Promise<User | null> {
    const docRef = doc(db, COLLECTIONS.USERS, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...convertFirestoreData(docSnap.data())
      } as User;
    }
    return null;
  },

  async create(user: Omit<User, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.USERS), {
      ...user,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  },

  async update(id: string, updates: Partial<User>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.USERS, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTIONS.USERS, id));
  }
};

// CRUD para Cursos
export const courseService = {
  async getAll(): Promise<Course[]> {
    const snapshot = await getDocs(collection(db, COLLECTIONS.COURSES));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...convertFirestoreData(doc.data())
    } as Course));
  },

  async create(course: Omit<Course, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.COURSES), {
      ...course,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  },

  async update(id: string, updates: Partial<Course>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.COURSES, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTIONS.COURSES, id));
  }
};

// CRUD para Produtos
export const productService = {
  async getAll(): Promise<Product[]> {
    const snapshot = await getDocs(collection(db, COLLECTIONS.PRODUCTS));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...convertFirestoreData(doc.data())
    } as Product));
  },

  async create(product: Omit<Product, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.PRODUCTS), {
      ...product,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  },

  async update(id: string, updates: Partial<Product>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.PRODUCTS, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTIONS.PRODUCTS, id));
  }
};

// CRUD para Configurações
export const settingsService = {
  async get(): Promise<AppSettings | null> {
    const docRef = doc(db, COLLECTIONS.SETTINGS, 'main');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return convertFirestoreData(docSnap.data()) as AppSettings;
    }
    return null;
  },

  async update(settings: Partial<AppSettings>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.SETTINGS, 'main');
    await updateDoc(docRef, {
      ...settings,
      updatedAt: serverTimestamp()
    });
  }
};

// CRUD para Notificações
export const notificationService = {
  async getByUserId(userId: string): Promise<Notification[]> {
    const q = query(
      collection(db, COLLECTIONS.NOTIFICATIONS),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...convertFirestoreData(doc.data())
    } as Notification));
  },

  async create(notification: Omit<Notification, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.NOTIFICATIONS), {
      ...notification,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  },

  async update(id: string, updates: Partial<Notification>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.NOTIFICATIONS, id);
    await updateDoc(docRef, updates);
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTIONS.NOTIFICATIONS, id));
  }
};

// CRUD para Histórico de Visualização
export const watchHistoryService = {
  async getByUserId(userId: string): Promise<WatchHistory[]> {
    const q = query(
      collection(db, COLLECTIONS.WATCH_HISTORY),
      where('userId', '==', userId),
      orderBy('lastWatchedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...convertFirestoreData(doc.data())
    } as WatchHistory));
  },

  async createOrUpdate(history: Omit<WatchHistory, 'id'>): Promise<void> {
    // Verificar se já existe um registro para este usuário e conteúdo
    const q = query(
      collection(db, COLLECTIONS.WATCH_HISTORY),
      where('userId', '==', history.userId),
      where(history.courseId ? 'courseId' : 'productId', '==', history.courseId || history.productId)
    );
    
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      // Atualizar registro existente
      const docRef = snapshot.docs[0].ref;
      await updateDoc(docRef, {
        ...history,
        lastWatchedAt: serverTimestamp()
      });
    } else {
      // Criar novo registro
      await addDoc(collection(db, COLLECTIONS.WATCH_HISTORY), {
        ...history,
        firstWatchedAt: serverTimestamp(),
        lastWatchedAt: serverTimestamp()
      });
    }
  }
};

// CRUD para Favoritos
export const favoriteService = {
  async getByUserId(userId: string): Promise<Favorite[]> {
    const q = query(
      collection(db, COLLECTIONS.FAVORITES),
      where('userId', '==', userId),
      orderBy('addedAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...convertFirestoreData(doc.data())
    } as Favorite));
  },

  async create(favorite: Omit<Favorite, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.FAVORITES), {
      ...favorite,
      addedAt: serverTimestamp()
    });
    return docRef.id;
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTIONS.FAVORITES, id));
  }
};

// CRUD para Recursos
export const resourceService = {
  async getAll(): Promise<Resource[]> {
    const snapshot = await getDocs(collection(db, COLLECTIONS.RESOURCES));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...convertFirestoreData(doc.data())
    } as Resource));
  },

  async create(resource: Omit<Resource, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.RESOURCES), {
      ...resource,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTIONS.RESOURCES, id));
  }
};

// CRUD para Tickets de Suporte
export const supportTicketService = {
  async getAll(): Promise<SupportTicket[]> {
    const q = query(
      collection(db, COLLECTIONS.SUPPORT_TICKETS),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...convertFirestoreData(doc.data())
    } as SupportTicket));
  },

  async create(ticket: Omit<SupportTicket, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.SUPPORT_TICKETS), {
      ...ticket,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  },

  async update(id: string, updates: Partial<SupportTicket>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.SUPPORT_TICKETS, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  }
};

// CRUD para Banners
export const bannerService = {
  async getAll(): Promise<Banner[]> {
    const q = query(
      collection(db, COLLECTIONS.BANNERS),
      orderBy('order', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...convertFirestoreData(doc.data())
    } as Banner));
  },

  async create(banner: Omit<Banner, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.BANNERS), {
      ...banner,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  },

  async update(id: string, updates: Partial<Banner>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.BANNERS, id);
    await updateDoc(docRef, updates);
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTIONS.BANNERS, id));
  }
};

// CRUD para Notificações Fixas
export const fixedNotificationService = {
  async getAll(): Promise<FixedNotification[]> {
    const snapshot = await getDocs(collection(db, COLLECTIONS.FIXED_NOTIFICATIONS));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...convertFirestoreData(doc.data())
    } as FixedNotification));
  },

  async create(notification: Omit<FixedNotification, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.FIXED_NOTIFICATIONS), {
      ...notification,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  },

  async update(id: string, updates: Partial<FixedNotification>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.FIXED_NOTIFICATIONS, id);
    await updateDoc(docRef, updates);
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTIONS.FIXED_NOTIFICATIONS, id));
  }
};

// CRUD para Sessões de Usuário
export const userSessionService = {
  async getAll(): Promise<UserSession[]> {
    const snapshot = await getDocs(collection(db, COLLECTIONS.USER_SESSIONS));
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...convertFirestoreData(doc.data())
    } as UserSession));
  },

  async create(session: Omit<UserSession, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.USER_SESSIONS), {
      ...session,
      loginTime: serverTimestamp(),
      lastActivity: serverTimestamp()
    });
    return docRef.id;
  },

  async update(id: string, updates: Partial<UserSession>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.USER_SESSIONS, id);
    await updateDoc(docRef, {
      ...updates,
      lastActivity: serverTimestamp()
    });
  }
};

// CRUD para Logs de Segurança
export const securityLogService = {
  async getAll(): Promise<SecurityLog[]> {
    const q = query(
      collection(db, COLLECTIONS.SECURITY_LOGS),
      orderBy('timestamp', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...convertFirestoreData(doc.data())
    } as SecurityLog));
  },

  async create(log: Omit<SecurityLog, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTIONS.SECURITY_LOGS), {
      ...log,
      timestamp: serverTimestamp()
    });
    return docRef.id;
  }
};

// Função para escutar mudanças em tempo real
export const subscribeToCollection = (
  collectionName: string,
  callback: (data: any[]) => void,
  queryConstraints: any[] = []
) => {
  const q = query(collection(db, collectionName), ...queryConstraints);
  
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...convertFirestoreData(doc.data())
    }));
    callback(data);
  });
};