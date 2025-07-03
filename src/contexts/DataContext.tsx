import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Course, Product, AppSettings, User, Notification, WatchHistory, Favorite, Resource, SupportTicket, Banner, FixedNotification, UserSession, SecurityLog, SecuritySettings } from '../types';
import {
  userService,
  courseService,
  productService,
  settingsService,
  notificationService,
  watchHistoryService,
  favoriteService,
  resourceService,
  supportTicketService,
  bannerService,
  fixedNotificationService,
  userSessionService,
  securityLogService,
  subscribeToCollection,
  initializeDefaultData
} from '../services/firebaseService';

interface DataContextType {
  courses: Course[];
  products: Product[];
  settings: AppSettings;
  users: User[];
  notifications: Notification[];
  watchHistory: WatchHistory[];
  favorites: Favorite[];
  resources: Resource[];
  supportTickets: SupportTicket[];
  banners: Banner[];
  fixedNotifications: FixedNotification[];
  userSessions: UserSession[];
  securityLogs: SecurityLog[];
  loading: boolean;
  addCourse: (course: Course) => Promise<void>;
  updateCourse: (courseId: string, course: Partial<Course>) => Promise<void>;
  deleteCourse: (courseId: string) => Promise<void>;
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (productId: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
  addUser: (user: User) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  updateUser: (userId: string, updates: Partial<User>) => Promise<void>;
  addNotification: (notification: Notification) => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  markAllAsRead: (userId: string) => Promise<void>;
  addToWatchHistory: (history: WatchHistory) => Promise<void>;
  addFavorite: (userId: string, courseId?: string, productId?: string) => Promise<void>;
  removeFavorite: (userId: string, courseId?: string, productId?: string) => Promise<void>;
  addResource: (resource: Resource) => Promise<void>;
  deleteResource: (resourceId: string) => Promise<void>;
  addSupportTicket: (ticket: SupportTicket) => Promise<void>;
  updateSupportTicket: (ticketId: string, updates: Partial<SupportTicket>) => Promise<void>;
  addBanner: (banner: Banner) => Promise<void>;
  updateBanner: (bannerId: string, updates: Partial<Banner>) => Promise<void>;
  deleteBanner: (bannerId: string) => Promise<void>;
  addFixedNotification: (notification: FixedNotification) => Promise<void>;
  updateFixedNotification: (notificationId: string, updates: Partial<FixedNotification>) => Promise<void>;
  deleteFixedNotification: (notificationId: string) => Promise<void>;
  getActiveFixedNotifications: () => FixedNotification[];
  blockUser: (userId: string, reason: string, adminId: string) => Promise<void>;
  unblockUser: (userId: string, adminId: string) => Promise<void>;
  terminateUserSession: (sessionId: string, adminId: string) => Promise<void>;
  terminateAllUserSessions: (userId: string, adminId: string) => Promise<void>;
  getUserSessions: (userId: string) => UserSession[];
  getActiveUserSessions: (userId: string) => UserSession[];
  getSecurityLogs: (userId?: string) => SecurityLog[];
  updateSecuritySettings: (settings: Partial<SecuritySettings>) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const defaultSecuritySettings: SecuritySettings = {
  maxConcurrentSessions: 3,
  sessionTimeout: 480,
  blockOnMultipleIPs: false,
  allowedIPsPerUser: 5,
  suspiciousActivityThreshold: 3,
  enableGeoBlocking: false,
  allowedCountries: ['BR'],
  enableDeviceTracking: true,
  requireReauthOnNewDevice: false
};

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
  security: defaultSecuritySettings
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [users, setUsers] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [watchHistory, setWatchHistory] = useState<WatchHistory[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [fixedNotifications, setFixedNotifications] = useState<FixedNotification[]>([]);
  const [userSessions, setUserSessions] = useState<UserSession[]>([]);
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([]);
  const [loading, setLoading] = useState(true);
  
  const processedUnlocks = useRef<Set<string>>(new Set());
  const lastNotificationCheck = useRef<number>(0);
  const unsubscribeFunctions = useRef<(() => void)[]>([]);

  // Inicializar dados e configurar listeners
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        
        // Inicializar dados padrão
        await initializeDefaultData();
        
        // Carregar dados iniciais
        const [
          coursesData,
          productsData,
          settingsData,
          usersData,
          resourcesData,
          supportTicketsData,
          bannersData,
          fixedNotificationsData,
          userSessionsData,
          securityLogsData
        ] = await Promise.all([
          courseService.getAll(),
          productService.getAll(),
          settingsService.get(),
          userService.getAll(),
          resourceService.getAll(),
          supportTicketService.getAll(),
          bannerService.getAll(),
          fixedNotificationService.getAll(),
          userSessionService.getAll(),
          securityLogService.getAll()
        ]);

        setCourses(coursesData);
        setProducts(productsData);
        setSettings(settingsData || defaultSettings);
        setUsers(usersData);
        setResources(resourcesData);
        setSupportTickets(supportTicketsData);
        setBanners(bannersData);
        setFixedNotifications(fixedNotificationsData);
        setUserSessions(userSessionsData);
        setSecurityLogs(securityLogsData);

        // Configurar listeners em tempo real
        const unsubscribeCourses = subscribeToCollection('courses', setCourses);
        const unsubscribeProducts = subscribeToCollection('products', setProducts);
        const unsubscribeUsers = subscribeToCollection('users', setUsers);
        const unsubscribeResources = subscribeToCollection('resources', setResources);
        const unsubscribeBanners = subscribeToCollection('banners', setBanners);
        const unsubscribeFixedNotifications = subscribeToCollection('fixedNotifications', setFixedNotifications);
        const unsubscribeUserSessions = subscribeToCollection('userSessions', setUserSessions);
        const unsubscribeSecurityLogs = subscribeToCollection('securityLogs', setSecurityLogs);

        unsubscribeFunctions.current = [
          unsubscribeCourses,
          unsubscribeProducts,
          unsubscribeUsers,
          unsubscribeResources,
          unsubscribeBanners,
          unsubscribeFixedNotifications,
          unsubscribeUserSessions,
          unsubscribeSecurityLogs
        ];

        console.log('✅ Dados carregados do Firebase com sucesso!');
      } catch (error) {
        console.error('❌ Erro ao carregar dados do Firebase:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeData();

    // Cleanup listeners
    return () => {
      unsubscribeFunctions.current.forEach(unsubscribe => unsubscribe());
    };
  }, []);

  // Verificar desbloqueios programados
  useEffect(() => {
    const checkScheduledUnlocks = () => {
      const now = Date.now();
      
      if (now - lastNotificationCheck.current < 30000) {
        return;
      }
      
      lastNotificationCheck.current = now;
      
      const currentDate = new Date();
      
      // Verificar cursos para desbloqueio
      courses.forEach(async (course) => {
        if (course.isBlocked && course.scheduledUnlockDate) {
          const unlockDate = new Date(course.scheduledUnlockDate);
          const unlockKey = `scheduled-course-${course.id}`;
          
          if (currentDate >= unlockDate && !processedUnlocks.current.has(unlockKey)) {
            await updateCourse(course.id, {
              isBlocked: false,
              scheduledUnlockDate: undefined
            });
            
            processedUnlocks.current.add(unlockKey);
            
            // Notificar usuários
            const nonAdminUsers = users.filter(user => !user.isAdmin);
            nonAdminUsers.forEach(async (user) => {
              await addNotification({
                id: `scheduled-unlock-course-${course.id}-${user.id}`,
                userId: user.id,
                title: 'Curso Desbloqueado Automaticamente! 🎉',
                message: `O curso "${course.title}" foi desbloqueado conforme programado e está disponível para você!`,
                type: 'success',
                read: false,
                createdAt: new Date().toISOString(),
              });
            });
          }
        }
      });

      // Verificar produtos para desbloqueio
      products.forEach(async (product) => {
        if (product.isBlocked && product.scheduledUnlockDate) {
          const unlockDate = new Date(product.scheduledUnlockDate);
          const unlockKey = `scheduled-product-${product.id}`;
          
          if (currentDate >= unlockDate && !processedUnlocks.current.has(unlockKey)) {
            await updateProduct(product.id, {
              isBlocked: false,
              scheduledUnlockDate: undefined
            });
            
            processedUnlocks.current.add(unlockKey);
            
            // Notificar usuários
            const nonAdminUsers = users.filter(user => !user.isAdmin);
            nonAdminUsers.forEach(async (user) => {
              await addNotification({
                id: `scheduled-unlock-product-${product.id}-${user.id}`,
                userId: user.id,
                title: 'Produto Desbloqueado Automaticamente! 🎉',
                message: `O produto "${product.title}" foi desbloqueado conforme programado e está disponível para você!`,
                type: 'success',
                read: false,
                createdAt: new Date().toISOString(),
              });
            });
          }
        }
      });
    };

    const timeoutId = setTimeout(checkScheduledUnlocks, 1000);
    const intervalId = setInterval(checkScheduledUnlocks, 5 * 60 * 1000);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [courses, products, users]);

  // Implementação das funções CRUD
  const addCourse = async (course: Course) => {
    const { id, ...courseData } = course;
    await courseService.create(courseData);
  };

  const updateCourse = async (courseId: string, courseUpdate: Partial<Course>) => {
    await courseService.update(courseId, courseUpdate);
  };

  const deleteCourse = async (courseId: string) => {
    await courseService.delete(courseId);
  };

  const addProduct = async (product: Product) => {
    const { id, ...productData } = product;
    await productService.create(productData);
  };

  const updateProduct = async (productId: string, productUpdate: Partial<Product>) => {
    await productService.update(productId, productUpdate);
  };

  const deleteProduct = async (productId: string) => {
    await productService.delete(productId);
  };

  const updateSettings = async (settingsUpdate: Partial<AppSettings>) => {
    await settingsService.update(settingsUpdate);
    setSettings(prev => ({ ...prev, ...settingsUpdate }));
  };

  const addUser = async (user: User) => {
    const { id, ...userData } = user;
    await userService.create(userData);
  };

  const deleteUser = async (userId: string) => {
    await userService.delete(userId);
  };

  const updateUser = async (userId: string, updates: Partial<User>) => {
    await userService.update(userId, updates);
  };

  const addNotification = async (notification: Notification) => {
    const { id, ...notificationData } = notification;
    await notificationService.create(notificationData);
  };

  const markNotificationAsRead = async (notificationId: string) => {
    await notificationService.update(notificationId, { read: true });
  };

  const deleteNotification = async (notificationId: string) => {
    await notificationService.delete(notificationId);
  };

  const markAllAsRead = async (userId: string) => {
    const userNotifications = notifications.filter(n => n.userId === userId && !n.read);
    await Promise.all(
      userNotifications.map(notification => 
        notificationService.update(notification.id, { read: true })
      )
    );
  };

  const addToWatchHistory = async (history: WatchHistory) => {
    const { id, ...historyData } = history;
    await watchHistoryService.createOrUpdate(historyData);
  };

  const addFavorite = async (userId: string, courseId?: string, productId?: string) => {
    await favoriteService.create({
      id: Date.now().toString(),
      userId,
      courseId,
      productId,
      addedAt: new Date().toISOString(),
    });
  };

  const removeFavorite = async (userId: string, courseId?: string, productId?: string) => {
    const favorite = favorites.find(fav => 
      fav.userId === userId && 
      ((courseId && fav.courseId === courseId) || (productId && fav.productId === productId))
    );
    
    if (favorite) {
      await favoriteService.delete(favorite.id);
    }
  };

  const addResource = async (resource: Resource) => {
    const { id, ...resourceData } = resource;
    await resourceService.create(resourceData);
  };

  const deleteResource = async (resourceId: string) => {
    await resourceService.delete(resourceId);
  };

  const addSupportTicket = async (ticket: SupportTicket) => {
    const { id, ...ticketData } = ticket;
    await supportTicketService.create(ticketData);
  };

  const updateSupportTicket = async (ticketId: string, updates: Partial<SupportTicket>) => {
    await supportTicketService.update(ticketId, updates);
  };

  const addBanner = async (banner: Banner) => {
    const { id, ...bannerData } = banner;
    await bannerService.create(bannerData);
  };

  const updateBanner = async (bannerId: string, updates: Partial<Banner>) => {
    await bannerService.update(bannerId, updates);
  };

  const deleteBanner = async (bannerId: string) => {
    await bannerService.delete(bannerId);
  };

  const addFixedNotification = async (notification: FixedNotification) => {
    const { id, ...notificationData } = notification;
    await fixedNotificationService.create(notificationData);
  };

  const updateFixedNotification = async (notificationId: string, updates: Partial<FixedNotification>) => {
    await fixedNotificationService.update(notificationId, updates);
  };

  const deleteFixedNotification = async (notificationId: string) => {
    await fixedNotificationService.delete(notificationId);
  };

  const getActiveFixedNotifications = () => {
    const now = new Date();
    return fixedNotifications.filter(notification => {
      if (!notification.isActive) return false;
      
      const startDate = new Date(notification.startDate);
      const endDate = new Date(notification.endDate);
      
      return now >= startDate && now <= endDate;
    });
  };

  const blockUser = async (userId: string, reason: string, adminId: string) => {
    const updates: Partial<User> = {
      isBlocked: true,
      blockedReason: reason,
      blockedAt: new Date().toISOString()
    };
    
    await updateUser(userId, updates);
    await terminateAllUserSessions(userId, adminId);
    
    await securityLogService.create({
      id: Date.now().toString(),
      userId,
      action: 'blocked',
      ipAddress: 'admin-action',
      userAgent: 'admin-panel',
      timestamp: new Date().toISOString(),
      details: `Usuário bloqueado pelo administrador. Motivo: ${reason}`,
      severity: 'high',
      adminId
    });
  };

  const unblockUser = async (userId: string, adminId: string) => {
    const updates: Partial<User> = {
      isBlocked: false,
      blockedReason: undefined,
      blockedAt: undefined
    };
    
    await updateUser(userId, updates);
    
    await securityLogService.create({
      id: Date.now().toString(),
      userId,
      action: 'unblocked',
      ipAddress: 'admin-action',
      userAgent: 'admin-panel',
      timestamp: new Date().toISOString(),
      details: 'Usuário desbloqueado pelo administrador',
      severity: 'medium',
      adminId
    });
  };

  const terminateUserSession = async (sessionId: string, adminId: string) => {
    const session = userSessions.find(s => s.id === sessionId);
    if (!session) return;
    
    await userSessionService.update(sessionId, {
      isActive: false,
      logoutTime: new Date().toISOString(),
      sessionDuration: Math.floor((Date.now() - new Date(session.loginTime).getTime()) / (1000 * 60))
    });
    
    await securityLogService.create({
      id: Date.now().toString(),
      userId: session.userId,
      action: 'logout',
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      timestamp: new Date().toISOString(),
      details: `Sessão terminada pelo administrador (IP: ${session.ipAddress})`,
      severity: 'medium',
      adminId
    });
  };

  const terminateAllUserSessions = async (userId: string, adminId: string) => {
    const userActiveSessions = userSessions.filter(s => s.userId === userId && s.isActive);
    
    await Promise.all(
      userActiveSessions.map(session =>
        userSessionService.update(session.id, {
          isActive: false,
          logoutTime: new Date().toISOString(),
          sessionDuration: Math.floor((Date.now() - new Date(session.loginTime).getTime()) / (1000 * 60))
        })
      )
    );
    
    await securityLogService.create({
      id: Date.now().toString(),
      userId,
      action: 'logout',
      ipAddress: 'admin-action',
      userAgent: 'admin-panel',
      timestamp: new Date().toISOString(),
      details: `Todas as sessões (${userActiveSessions.length}) terminadas pelo administrador`,
      severity: 'high',
      adminId
    });
  };

  const getUserSessions = (userId: string): UserSession[] => {
    return userSessions.filter(s => s.userId === userId);
  };

  const getActiveUserSessions = (userId: string): UserSession[] => {
    return userSessions.filter(s => s.userId === userId && s.isActive);
  };

  const getSecurityLogs = (userId?: string): SecurityLog[] => {
    if (userId) {
      return securityLogs.filter(log => log.userId === userId);
    }
    return securityLogs;
  };

  const updateSecuritySettings = async (securitySettings: Partial<SecuritySettings>) => {
    const newSettings = {
      ...settings,
      security: { ...settings.security, ...securitySettings }
    };
    await updateSettings(newSettings);
  };

  return (
    <DataContext.Provider value={{
      courses,
      products,
      settings,
      users,
      notifications,
      watchHistory,
      favorites,
      resources,
      supportTickets,
      banners,
      fixedNotifications,
      userSessions,
      securityLogs,
      loading,
      addCourse,
      updateCourse,
      deleteCourse,
      addProduct,
      updateProduct,
      deleteProduct,
      updateSettings,
      addUser,
      deleteUser,
      updateUser,
      addNotification,
      markNotificationAsRead,
      deleteNotification,
      markAllAsRead,
      addToWatchHistory,
      addFavorite,
      removeFavorite,
      addResource,
      deleteResource,
      addSupportTicket,
      updateSupportTicket,
      addBanner,
      updateBanner,
      deleteBanner,
      addFixedNotification,
      updateFixedNotification,
      deleteFixedNotification,
      getActiveFixedNotifications,
      blockUser,
      unblockUser,
      terminateUserSession,
      terminateAllUserSessions,
      getUserSessions,
      getActiveUserSessions,
      getSecurityLogs,
      updateSecuritySettings,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};