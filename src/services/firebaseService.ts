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
  Timestamp,
  limit
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

// Função para gerar ID único
const generateId = () => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

// Inicializar dados padrão
export const initializeDefaultData = async () => {
  try {
    console.log('🔄 Verificando dados padrão...');
    
    // Verificar se já existem configurações
    const settingsRef = doc(db, COLLECTIONS.SETTINGS, 'main');
    const settingsSnap = await getDoc(settingsRef);
    
    if (!settingsSnap.exists()) {
      console.log('📝 Criando configurações padrão...');
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
      where('email', '==', 'member@gmail.com'),
      limit(1)
    );
    const usersSnap = await getDocs(usersQuery);
    
    if (usersSnap.empty) {
      console.log('👤 Criando usuário admin padrão...');
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
    
    console.log('✅ Dados padrão verificados/criados com sucesso');
  } catch (error) {
    console.error('❌ Erro ao inicializar dados padrão:', error);
    throw error;
  }
};

// CRUD para Usuários
export const userService = {
  async getAll(): Promise<User[]> {
    try {
      console.log('👥 Carregando usuários...');
      const snapshot = await getDocs(collection(db, COLLECTIONS.USERS));
      const users = snapshot.docs.map(doc => ({
        id: doc.id,
        ...convertFirestoreData(doc.data())
      } as User));
      console.log(`✅ ${users.length} usuários carregados`);
      return users;
    } catch (error) {
      console.error('❌ Erro ao carregar usuários:', error);
      return [];
    }
  },

  async getById(id: string): Promise<User | null> {
    try {
      const docRef = doc(db, COLLECTIONS.USERS, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...convertFirestoreData(docSnap.data())
        } as User;
      }
      return null;
    } catch (error) {
      console.error('❌ Erro ao buscar usuário:', error);
      return null;
    }
  },

  async create(user: Omit<User, 'id'>): Promise<string> {
    try {
      console.log('👤 Criando usuário:', user.name);
      const docRef = await addDoc(collection(db, COLLECTIONS.USERS), {
        ...user,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log('✅ Usuário criado com ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Erro ao criar usuário:', error);
      throw error;
    }
  },

  async update(id: string, updates: Partial<User>): Promise<void> {
    try {
      console.log('👤 Atualizando usuário:', id);
      const docRef = doc(db, COLLECTIONS.USERS, id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      console.log('✅ Usuário atualizado');
    } catch (error) {
      console.error('❌ Erro ao atualizar usuário:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      console.log('👤 Deletando usuário:', id);
      await deleteDoc(doc(db, COLLECTIONS.USERS, id));
      console.log('✅ Usuário deletado');
    } catch (error) {
      console.error('❌ Erro ao deletar usuário:', error);
      throw error;
    }
  }
};

// CRUD para Cursos
export const courseService = {
  async getAll(): Promise<Course[]> {
    try {
      console.log('📚 Carregando cursos...');
      const snapshot = await getDocs(collection(db, COLLECTIONS.COURSES));
      const courses = snapshot.docs.map(doc => ({
        id: doc.id,
        ...convertFirestoreData(doc.data())
      } as Course));
      console.log(`✅ ${courses.length} cursos carregados`);
      return courses;
    } catch (error) {
      console.error('❌ Erro ao carregar cursos:', error);
      return [];
    }
  },

  async create(course: Omit<Course, 'id'>): Promise<string> {
    try {
      console.log('📚 Criando curso:', course.title);
      const docRef = await addDoc(collection(db, COLLECTIONS.COURSES), {
        ...course,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log('✅ Curso criado com ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Erro ao criar curso:', error);
      throw error;
    }
  },

  async update(id: string, updates: Partial<Course>): Promise<void> {
    try {
      console.log('📚 Atualizando curso:', id);
      const docRef = doc(db, COLLECTIONS.COURSES, id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      console.log('✅ Curso atualizado');
    } catch (error) {
      console.error('❌ Erro ao atualizar curso:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      console.log('📚 Deletando curso:', id);
      await deleteDoc(doc(db, COLLECTIONS.COURSES, id));
      console.log('✅ Curso deletado');
    } catch (error) {
      console.error('❌ Erro ao deletar curso:', error);
      throw error;
    }
  }
};

// CRUD para Produtos
export const productService = {
  async getAll(): Promise<Product[]> {
    try {
      console.log('📦 Carregando produtos...');
      const snapshot = await getDocs(collection(db, COLLECTIONS.PRODUCTS));
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...convertFirestoreData(doc.data())
      } as Product));
      console.log(`✅ ${products.length} produtos carregados`);
      return products;
    } catch (error) {
      console.error('❌ Erro ao carregar produtos:', error);
      return [];
    }
  },

  async create(product: Omit<Product, 'id'>): Promise<string> {
    try {
      console.log('📦 Criando produto:', product.title);
      const docRef = await addDoc(collection(db, COLLECTIONS.PRODUCTS), {
        ...product,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log('✅ Produto criado com ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Erro ao criar produto:', error);
      throw error;
    }
  },

  async update(id: string, updates: Partial<Product>): Promise<void> {
    try {
      console.log('📦 Atualizando produto:', id);
      const docRef = doc(db, COLLECTIONS.PRODUCTS, id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      console.log('✅ Produto atualizado');
    } catch (error) {
      console.error('❌ Erro ao atualizar produto:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      console.log('📦 Deletando produto:', id);
      await deleteDoc(doc(db, COLLECTIONS.PRODUCTS, id));
      console.log('✅ Produto deletado');
    } catch (error) {
      console.error('❌ Erro ao deletar produto:', error);
      throw error;
    }
  }
};

// CRUD para Configurações
export const settingsService = {
  async get(): Promise<AppSettings | null> {
    try {
      console.log('⚙️ Carregando configurações...');
      const docRef = doc(db, COLLECTIONS.SETTINGS, 'main');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const settings = convertFirestoreData(docSnap.data()) as AppSettings;
        console.log('✅ Configurações carregadas');
        return settings;
      }
      console.log('⚠️ Configurações não encontradas');
      return null;
    } catch (error) {
      console.error('❌ Erro ao carregar configurações:', error);
      return null;
    }
  },

  async update(settings: Partial<AppSettings>): Promise<void> {
    try {
      console.log('⚙️ Atualizando configurações...');
      const docRef = doc(db, COLLECTIONS.SETTINGS, 'main');
      await updateDoc(docRef, {
        ...settings,
        updatedAt: serverTimestamp()
      });
      console.log('✅ Configurações atualizadas');
    } catch (error) {
      console.error('❌ Erro ao atualizar configurações:', error);
      throw error;
    }
  }
};

// CRUD para Notificações
export const notificationService = {
  async getAll(): Promise<Notification[]> {
    try {
      console.log('🔔 Carregando notificações...');
      const q = query(
        collection(db, COLLECTIONS.NOTIFICATIONS),
        orderBy('createdAt', 'desc'),
        limit(100) // Limitar para evitar sobrecarga
      );
      const snapshot = await getDocs(q);
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...convertFirestoreData(doc.data())
      } as Notification));
      console.log(`✅ ${notifications.length} notificações carregadas`);
      return notifications;
    } catch (error) {
      console.error('❌ Erro ao carregar notificações:', error);
      return [];
    }
  },

  async getByUserId(userId: string): Promise<Notification[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.NOTIFICATIONS),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...convertFirestoreData(doc.data())
      } as Notification));
    } catch (error) {
      console.error('❌ Erro ao carregar notificações do usuário:', error);
      return [];
    }
  },

  async create(notification: Omit<Notification, 'id'>): Promise<string> {
    try {
      console.log('🔔 Criando notificação:', notification.title);
      const docRef = await addDoc(collection(db, COLLECTIONS.NOTIFICATIONS), {
        ...notification,
        createdAt: serverTimestamp()
      });
      console.log('✅ Notificação criada com ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Erro ao criar notificação:', error);
      throw error;
    }
  },

  async update(id: string, updates: Partial<Notification>): Promise<void> {
    try {
      console.log('🔔 Atualizando notificação:', id);
      const docRef = doc(db, COLLECTIONS.NOTIFICATIONS, id);
      await updateDoc(docRef, updates);
      console.log('✅ Notificação atualizada');
    } catch (error) {
      console.error('❌ Erro ao atualizar notificação:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      console.log('🔔 Deletando notificação:', id);
      await deleteDoc(doc(db, COLLECTIONS.NOTIFICATIONS, id));
      console.log('✅ Notificação deletada');
    } catch (error) {
      console.error('❌ Erro ao deletar notificação:', error);
      throw error;
    }
  }
};

// CRUD para Histórico de Visualização
export const watchHistoryService = {
  async getAll(): Promise<WatchHistory[]> {
    try {
      console.log('📺 Carregando histórico...');
      const q = query(
        collection(db, COLLECTIONS.WATCH_HISTORY),
        orderBy('lastWatchedAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const history = snapshot.docs.map(doc => ({
        id: doc.id,
        ...convertFirestoreData(doc.data())
      } as WatchHistory));
      console.log(`✅ ${history.length} registros de histórico carregados`);
      return history;
    } catch (error) {
      console.error('❌ Erro ao carregar histórico:', error);
      return [];
    }
  },

  async getByUserId(userId: string): Promise<WatchHistory[]> {
    try {
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
    } catch (error) {
      console.error('❌ Erro ao carregar histórico do usuário:', error);
      return [];
    }
  },

  async createOrUpdate(history: Omit<WatchHistory, 'id'>): Promise<void> {
    try {
      console.log('📺 Criando/atualizando histórico...');
      
      // Verificar se já existe um registro para este usuário e conteúdo
      const q = query(
        collection(db, COLLECTIONS.WATCH_HISTORY),
        where('userId', '==', history.userId),
        where(history.courseId ? 'courseId' : 'productId', '==', history.courseId || history.productId),
        limit(1)
      );
      
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        // Atualizar registro existente
        const docRef = snapshot.docs[0].ref;
        await updateDoc(docRef, {
          ...history,
          lastWatchedAt: serverTimestamp()
        });
        console.log('✅ Histórico atualizado');
      } else {
        // Criar novo registro
        await addDoc(collection(db, COLLECTIONS.WATCH_HISTORY), {
          ...history,
          firstWatchedAt: serverTimestamp(),
          lastWatchedAt: serverTimestamp()
        });
        console.log('✅ Histórico criado');
      }
    } catch (error) {
      console.error('❌ Erro ao criar/atualizar histórico:', error);
      throw error;
    }
  }
};

// CRUD para Favoritos
export const favoriteService = {
  async getAll(): Promise<Favorite[]> {
    try {
      console.log('❤️ Carregando favoritos...');
      const q = query(
        collection(db, COLLECTIONS.FAVORITES),
        orderBy('addedAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const favorites = snapshot.docs.map(doc => ({
        id: doc.id,
        ...convertFirestoreData(doc.data())
      } as Favorite));
      console.log(`✅ ${favorites.length} favoritos carregados`);
      return favorites;
    } catch (error) {
      console.error('❌ Erro ao carregar favoritos:', error);
      return [];
    }
  },

  async getByUserId(userId: string): Promise<Favorite[]> {
    try {
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
    } catch (error) {
      console.error('❌ Erro ao carregar favoritos do usuário:', error);
      return [];
    }
  },

  async create(favorite: Omit<Favorite, 'id'>): Promise<string> {
    try {
      console.log('❤️ Criando favorito...');
      const docRef = await addDoc(collection(db, COLLECTIONS.FAVORITES), {
        ...favorite,
        addedAt: serverTimestamp()
      });
      console.log('✅ Favorito criado com ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Erro ao criar favorito:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      console.log('❤️ Deletando favorito:', id);
      await deleteDoc(doc(db, COLLECTIONS.FAVORITES, id));
      console.log('✅ Favorito deletado');
    } catch (error) {
      console.error('❌ Erro ao deletar favorito:', error);
      throw error;
    }
  }
};

// CRUD para Recursos
export const resourceService = {
  async getAll(): Promise<Resource[]> {
    try {
      console.log('📁 Carregando recursos...');
      const snapshot = await getDocs(collection(db, COLLECTIONS.RESOURCES));
      const resources = snapshot.docs.map(doc => ({
        id: doc.id,
        ...convertFirestoreData(doc.data())
      } as Resource));
      console.log(`✅ ${resources.length} recursos carregados`);
      return resources;
    } catch (error) {
      console.error('❌ Erro ao carregar recursos:', error);
      return [];
    }
  },

  async create(resource: Omit<Resource, 'id'>): Promise<string> {
    try {
      console.log('📁 Criando recurso:', resource.title);
      const docRef = await addDoc(collection(db, COLLECTIONS.RESOURCES), {
        ...resource,
        createdAt: serverTimestamp()
      });
      console.log('✅ Recurso criado com ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Erro ao criar recurso:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      console.log('📁 Deletando recurso:', id);
      await deleteDoc(doc(db, COLLECTIONS.RESOURCES, id));
      console.log('✅ Recurso deletado');
    } catch (error) {
      console.error('❌ Erro ao deletar recurso:', error);
      throw error;
    }
  }
};

// CRUD para Tickets de Suporte
export const supportTicketService = {
  async getAll(): Promise<SupportTicket[]> {
    try {
      console.log('🎫 Carregando tickets...');
      const q = query(
        collection(db, COLLECTIONS.SUPPORT_TICKETS),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const tickets = snapshot.docs.map(doc => ({
        id: doc.id,
        ...convertFirestoreData(doc.data())
      } as SupportTicket));
      console.log(`✅ ${tickets.length} tickets carregados`);
      return tickets;
    } catch (error) {
      console.error('❌ Erro ao carregar tickets:', error);
      return [];
    }
  },

  async create(ticket: Omit<SupportTicket, 'id'>): Promise<string> {
    try {
      console.log('🎫 Criando ticket:', ticket.subject);
      const docRef = await addDoc(collection(db, COLLECTIONS.SUPPORT_TICKETS), {
        ...ticket,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log('✅ Ticket criado com ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Erro ao criar ticket:', error);
      throw error;
    }
  },

  async update(id: string, updates: Partial<SupportTicket>): Promise<void> {
    try {
      console.log('🎫 Atualizando ticket:', id);
      const docRef = doc(db, COLLECTIONS.SUPPORT_TICKETS, id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      console.log('✅ Ticket atualizado');
    } catch (error) {
      console.error('❌ Erro ao atualizar ticket:', error);
      throw error;
    }
  }
};

// CRUD para Banners
export const bannerService = {
  async getAll(): Promise<Banner[]> {
    try {
      console.log('🖼️ Carregando banners...');
      const q = query(
        collection(db, COLLECTIONS.BANNERS),
        orderBy('order', 'asc')
      );
      const snapshot = await getDocs(q);
      const banners = snapshot.docs.map(doc => ({
        id: doc.id,
        ...convertFirestoreData(doc.data())
      } as Banner));
      console.log(`✅ ${banners.length} banners carregados`);
      return banners;
    } catch (error) {
      console.error('❌ Erro ao carregar banners:', error);
      return [];
    }
  },

  async create(banner: Omit<Banner, 'id'>): Promise<string> {
    try {
      console.log('🖼️ Criando banner:', banner.title);
      const docRef = await addDoc(collection(db, COLLECTIONS.BANNERS), {
        ...banner,
        createdAt: serverTimestamp()
      });
      console.log('✅ Banner criado com ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Erro ao criar banner:', error);
      throw error;
    }
  },

  async update(id: string, updates: Partial<Banner>): Promise<void> {
    try {
      console.log('🖼️ Atualizando banner:', id);
      const docRef = doc(db, COLLECTIONS.BANNERS, id);
      await updateDoc(docRef, updates);
      console.log('✅ Banner atualizado');
    } catch (error) {
      console.error('❌ Erro ao atualizar banner:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      console.log('🖼️ Deletando banner:', id);
      await deleteDoc(doc(db, COLLECTIONS.BANNERS, id));
      console.log('✅ Banner deletado');
    } catch (error) {
      console.error('❌ Erro ao deletar banner:', error);
      throw error;
    }
  }
};

// CRUD para Notificações Fixas
export const fixedNotificationService = {
  async getAll(): Promise<FixedNotification[]> {
    try {
      console.log('📢 Carregando notificações fixas...');
      const snapshot = await getDocs(collection(db, COLLECTIONS.FIXED_NOTIFICATIONS));
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...convertFirestoreData(doc.data())
      } as FixedNotification));
      console.log(`✅ ${notifications.length} notificações fixas carregadas`);
      return notifications;
    } catch (error) {
      console.error('❌ Erro ao carregar notificações fixas:', error);
      return [];
    }
  },

  async create(notification: Omit<FixedNotification, 'id'>): Promise<string> {
    try {
      console.log('📢 Criando notificação fixa:', notification.title);
      const docRef = await addDoc(collection(db, COLLECTIONS.FIXED_NOTIFICATIONS), {
        ...notification,
        createdAt: serverTimestamp()
      });
      console.log('✅ Notificação fixa criada com ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Erro ao criar notificação fixa:', error);
      throw error;
    }
  },

  async update(id: string, updates: Partial<FixedNotification>): Promise<void> {
    try {
      console.log('📢 Atualizando notificação fixa:', id);
      const docRef = doc(db, COLLECTIONS.FIXED_NOTIFICATIONS, id);
      await updateDoc(docRef, updates);
      console.log('✅ Notificação fixa atualizada');
    } catch (error) {
      console.error('❌ Erro ao atualizar notificação fixa:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      console.log('📢 Deletando notificação fixa:', id);
      await deleteDoc(doc(db, COLLECTIONS.FIXED_NOTIFICATIONS, id));
      console.log('✅ Notificação fixa deletada');
    } catch (error) {
      console.error('❌ Erro ao deletar notificação fixa:', error);
      throw error;
    }
  }
};

// CRUD para Sessões de Usuário
export const userSessionService = {
  async getAll(): Promise<UserSession[]> {
    try {
      console.log('🔐 Carregando sessões...');
      const snapshot = await getDocs(collection(db, COLLECTIONS.USER_SESSIONS));
      const sessions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...convertFirestoreData(doc.data())
      } as UserSession));
      console.log(`✅ ${sessions.length} sessões carregadas`);
      return sessions;
    } catch (error) {
      console.error('❌ Erro ao carregar sessões:', error);
      return [];
    }
  },

  async create(session: Omit<UserSession, 'id'>): Promise<string> {
    try {
      console.log('🔐 Criando sessão...');
      const docRef = await addDoc(collection(db, COLLECTIONS.USER_SESSIONS), {
        ...session,
        loginTime: serverTimestamp(),
        lastActivity: serverTimestamp()
      });
      console.log('✅ Sessão criada com ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Erro ao criar sessão:', error);
      throw error;
    }
  },

  async update(id: string, updates: Partial<UserSession>): Promise<void> {
    try {
      console.log('🔐 Atualizando sessão:', id);
      const docRef = doc(db, COLLECTIONS.USER_SESSIONS, id);
      await updateDoc(docRef, {
        ...updates,
        lastActivity: serverTimestamp()
      });
      console.log('✅ Sessão atualizada');
    } catch (error) {
      console.error('❌ Erro ao atualizar sessão:', error);
      throw error;
    }
  }
};

// CRUD para Logs de Segurança
export const securityLogService = {
  async getAll(): Promise<SecurityLog[]> {
    try {
      console.log('🛡️ Carregando logs de segurança...');
      const q = query(
        collection(db, COLLECTIONS.SECURITY_LOGS),
        orderBy('timestamp', 'desc'),
        limit(200) // Limitar para performance
      );
      const snapshot = await getDocs(q);
      const logs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...convertFirestoreData(doc.data())
      } as SecurityLog));
      console.log(`✅ ${logs.length} logs de segurança carregados`);
      return logs;
    } catch (error) {
      console.error('❌ Erro ao carregar logs de segurança:', error);
      return [];
    }
  },

  async create(log: Omit<SecurityLog, 'id'>): Promise<string> {
    try {
      console.log('🛡️ Criando log de segurança...');
      const docRef = await addDoc(collection(db, COLLECTIONS.SECURITY_LOGS), {
        ...log,
        timestamp: serverTimestamp()
      });
      console.log('✅ Log de segurança criado com ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Erro ao criar log de segurança:', error);
      throw error;
    }
  }
};

// Função para escutar mudanças em tempo real
export const subscribeToCollection = (
  collectionName: string,
  callback: (data: any[]) => void,
  queryConstraints: any[] = []
) => {
  try {
    console.log(`🔄 Configurando listener para ${collectionName}...`);
    
    let q;
    if (queryConstraints.length > 0) {
      q = query(collection(db, collectionName), ...queryConstraints);
    } else {
      // Configurações específicas para cada coleção
      switch (collectionName) {
        case COLLECTIONS.NOTIFICATIONS:
          q = query(
            collection(db, collectionName),
            orderBy('createdAt', 'desc'),
            limit(100)
          );
          break;
        case COLLECTIONS.SECURITY_LOGS:
          q = query(
            collection(db, collectionName),
            orderBy('timestamp', 'desc'),
            limit(200)
          );
          break;
        case COLLECTIONS.BANNERS:
          q = query(
            collection(db, collectionName),
            orderBy('order', 'asc')
          );
          break;
        case COLLECTIONS.SUPPORT_TICKETS:
          q = query(
            collection(db, collectionName),
            orderBy('createdAt', 'desc')
          );
          break;
        case COLLECTIONS.WATCH_HISTORY:
          q = query(
            collection(db, collectionName),
            orderBy('lastWatchedAt', 'desc')
          );
          break;
        case COLLECTIONS.FAVORITES:
          q = query(
            collection(db, collectionName),
            orderBy('addedAt', 'desc')
          );
          break;
        default:
          q = collection(db, collectionName);
      }
    }
    
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...convertFirestoreData(doc.data())
      }));
      console.log(`📊 ${collectionName} atualizado: ${data.length} itens`);
      callback(data);
    }, (error) => {
      console.error(`❌ Erro no listener de ${collectionName}:`, error);
    });
  } catch (error) {
    console.error(`❌ Erro ao configurar listener para ${collectionName}:`, error);
    return () => {}; // Retorna função vazia em caso de erro
  }
};