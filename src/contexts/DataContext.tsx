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
        console.log('🔄 Inicializando dados do Firebase...');
        
        // Inicializar dados padrão
        await initializeDefaultData();
        
        // Carregar dados iniciais
        console.log('📥 Carregando dados iniciais...');
        const [
          coursesData,
          productsData,
          settingsData,
          usersData,
          notificationsData,
          watchHistoryData,
          favoritesData,
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
          notificationService.getAll(),
          watchHistoryService.getAll(),
          favoriteService.getAll(),
          resourceService.getAll(),
          supportTicketService.getAll(),
          bannerService.getAll(),
          fixedNotificationService.getAll(),
          userSessionService.getAll(),
          securityLogService.getAll()
        ]);

        console.log('📊 Dados carregados:', {
          courses: coursesData.length,
          products: productsData.length,
          users: usersData.length,
          notifications: notificationsData.length,
          resources: resourcesData.length
        });

        setCourses(coursesData);
        setProducts(productsData);
        setSettings(settingsData || defaultSettings);
        setUsers(usersData);
        setNotifications(notificationsData);
        setWatchHistory(watchHistoryData);
        setFavorites(favoritesData);
        setResources(resourcesData);
        setSupportTickets(supportTicketsData);
        setBanners(bannersData);
        setFixedNotifications(fixedNotificationsData);
        setUserSessions(userSessionsData);
        setSecurityLogs(securityLogsData);

        // Configurar listeners em tempo real
        console.log('🔄 Configurando listeners em tempo real...');
        const unsubscribeCourses = subscribeToCollection('courses', (data) => {
          console.log('📚 Cursos atualizados:', data.length);
          setCourses(data);
        });
        
        const unsubscribeProducts = subscribeToCollection('products', (data) => {
          console.log('📦 Produtos atualizados:', data.length);
          setProducts(data);
        });
        
        const unsubscribeUsers = subscribeToCollection('users', (data) => {
          console.log('👥 Usuários atualizados:', data.length);
          setUsers(data);
        });
        
        const unsubscribeNotifications = subscribeToCollection('notifications', (data) => {
          console.log('🔔 Notificações atualizadas:', data.length);
          setNotifications(data);
        });
        
        const unsubscribeWatchHistory = subscribeToCollection('watchHistory', (data) => {
          console.log('📺 Histórico atualizado:', data.length);
          setWatchHistory(data);
        });
        
        const unsubscribeFavorites = subscribeToCollection('favorites', (data) => {
          console.log('❤️ Favoritos atualizados:', data.length);
          setFavorites(data);
        });
        
        const unsubscribeResources = subscribeToCollection('resources', (data) => {
          console.log('📁 Recursos atualizados:', data.length);
          setResources(data);
        });
        
        const unsubscribeBanners = subscribeToCollection('banners', (data) => {
          console.log('🖼️ Banners atualizados:', data.length);
          setBanners(data);
        });
        
        const unsubscribeFixedNotifications = subscribeToCollection('fixedNotifications', (data) => {
          console.log('📢 Notificações fixas atualizadas:', data.length);
          setFixedNotifications(data);
        });
        
        const unsubscribeUserSessions = subscribeToCollection('userSessions', (data) => {
          console.log('🔐 Sessões atualizadas:', data.length);
          setUserSessions(data);
        });
        
        const unsubscribeSecurityLogs = subscribeToCollection('securityLogs', (data) => {
          console.log('🛡️ Logs de segurança atualizados:', data.length);
          setSecurityLogs(data);
        });

        unsubscribeFunctions.current = [
          unsubscribeCourses,
          unsubscribeProducts,
          unsubscribeUsers,
          unsubscribeNotifications,
          unsubscribeWatchHistory,
          unsubscribeFavorites,
          unsubscribeResources,
          unsubscribeBanners,
          unsubscribeFixedNotifications,
          unsubscribeUserSessions,
          unsubscribeSecurityLogs
        ];

        console.log('✅ Dados carregados e listeners configurados com sucesso!');
      } catch (error) {
        console.error('❌ Erro ao carregar dados do Firebase:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeData();

    // Cleanup listeners
    return () => {
      console.log('🧹 Limpando listeners...');
      unsubscribeFunctions.current.forEach(unsubscribe => unsubscribe());
    };
  }, []);

  // Verificar desbloqueios programados
  useEffect(() => {
    const checkScheduledUnlocks = async () => {
      const now = Date.now();
      
      if (now - lastNotificationCheck.current < 30000) {
        return;
      }
      
      lastNotificationCheck.current = now;
      
      const currentDate = new Date();
      
      // Verificar cursos para desbloqueio
      for (const course of courses) {
        if (course.isBlocked && course.scheduledUnlockDate) {
          const unlockDate = new Date(course.scheduledUnlockDate);
          const unlockKey = `scheduled-course-${course.id}`;
          
          if (currentDate >= unlockDate && !processedUnlocks.current.has(unlockKey)) {
            try {
              await updateCourse(course.id, {
                isBlocked: false,
                scheduledUnlockDate: undefined
              });
              
              processedUnlocks.current.add(unlockKey);
              
              // Notificar usuários
              const nonAdminUsers = users.filter(user => !user.isAdmin);
              for (const user of nonAdminUsers) {
                await addNotification({
                  id: `scheduled-unlock-course-${course.id}-${user.id}`,
                  userId: user.id,
                  title: 'Curso Desbloqueado Automaticamente! 🎉',
                  message: `O curso "${course.title}" foi desbloqueado conforme programado e está disponível para você!`,
                  type: 'success',
                  read: false,
                  createdAt: new Date().toISOString(),
                });
              }
            } catch (error) {
              console.error('Erro ao desbloquear curso:', error);
            }
          }
        }
      }

      // Verificar produtos para desbloqueio
      for (const product of products) {
        if (product.isBlocked && product.scheduledUnlockDate) {
          const unlockDate = new Date(product.scheduledUnlockDate);
          const unlockKey = `scheduled-product-${product.id}`;
          
          if (currentDate >= unlockDate && !processedUnlocks.current.has(unlockKey)) {
            try {
              await updateProduct(product.id, {
                isBlocked: false,
                scheduledUnlockDate: undefined
              });
              
              processedUnlocks.current.add(unlockKey);
              
              // Notificar usuários
              const nonAdminUsers = users.filter(user => !user.isAdmin);
              for (const user of nonAdminUsers) {
                await addNotification({
                  id: `scheduled-unlock-product-${product.id}-${user.id}`,
                  userId: user.id,
                  title: 'Produto Desbloqueado Automaticamente! 🎉',
                  message: `O produto "${product.title}" foi desbloqueado conforme programado e está disponível para você!`,
                  type: 'success',
                  read: false,
                  createdAt: new Date().toISOString(),
                });
              }
            } catch (error) {
              console.error('Erro ao desbloquear produto:', error);
            }
          }
        }
      }
    };

    const timeoutId = setTimeout(checkScheduledUnlocks, 1000);
    const intervalId = setInterval(checkScheduledUnlocks, 5 * 60 * 1000);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [courses, products, users]);

  // Implementação das funções CRUD com logs detalhados
  const addCourse = async (course: Course) => {
    try {
      console.log('📚 Adicionando curso:', course.title);
      const { id, ...courseData } = course;
      const newId = await courseService.create(courseData);
      console.log('✅ Curso adicionado com ID:', newId);
    } catch (error) {
      console.error('❌ Erro ao adicionar curso:', error);
      throw error;
    }
  };

  const updateCourse = async (courseId: string, courseUpdate: Partial<Course>) => {
    try {
      console.log('📚 Atualizando curso:', courseId, courseUpdate);
      await courseService.update(courseId, courseUpdate);
      console.log('✅ Curso atualizado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao atualizar curso:', error);
      throw error;
    }
  };

  const deleteCourse = async (courseId: string) => {
    try {
      console.log('📚 Deletando curso:', courseId);
      await courseService.delete(courseId);
      console.log('✅ Curso deletado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao deletar curso:', error);
      throw error;
    }
  };

  const addProduct = async (product: Product) => {
    try {
      console.log('📦 Adicionando produto:', product.title);
      const { id, ...productData } = product;
      const newId = await productService.create(productData);
      console.log('✅ Produto adicionado com ID:', newId);
    } catch (error) {
      console.error('❌ Erro ao adicionar produto:', error);
      throw error;
    }
  };

  const updateProduct = async (productId: string, productUpdate: Partial<Product>) => {
    try {
      console.log('📦 Atualizando produto:', productId, productUpdate);
      await productService.update(productId, productUpdate);
      console.log('✅ Produto atualizado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao atualizar produto:', error);
      throw error;
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      console.log('📦 Deletando produto:', productId);
      await productService.delete(productId);
      console.log('✅ Produto deletado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao deletar produto:', error);
      throw error;
    }
  };

  const updateSettings = async (settingsUpdate: Partial<AppSettings>) => {
    try {
      console.log('⚙️ Atualizando configurações:', settingsUpdate);
      await settingsService.update(settingsUpdate);
      setSettings(prev => ({ ...prev, ...settingsUpdate }));
      console.log('✅ Configurações atualizadas com sucesso');
    } catch (error) {
      console.error('❌ Erro ao atualizar configurações:', error);
      throw error;
    }
  };

  const addUser = async (user: User) => {
    try {
      console.log('👤 Adicionando usuário:', user.name);
      const { id, ...userData } = user;
      const newId = await userService.create(userData);
      console.log('✅ Usuário adicionado com ID:', newId);
    } catch (error) {
      console.error('❌ Erro ao adicionar usuário:', error);
      throw error;
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      console.log('👤 Deletando usuário:', userId);
      await userService.delete(userId);
      console.log('✅ Usuário deletado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao deletar usuário:', error);
      throw error;
    }
  };

  const updateUser = async (userId: string, updates: Partial<User>) => {
    try {
      console.log('👤 Atualizando usuário:', userId, updates);
      await userService.update(userId, updates);
      console.log('✅ Usuário atualizado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao atualizar usuário:', error);
      throw error;
    }
  };

  const addNotification = async (notification: Notification) => {
    try {
      console.log('🔔 Adicionando notificação:', notification.title);
      const { id, ...notificationData } = notification;
      const newId = await notificationService.create(notificationData);
      console.log('✅ Notificação adicionada com ID:', newId);
    } catch (error) {
      console.error('❌ Erro ao adicionar notificação:', error);
      throw error;
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      console.log('🔔 Marcando notificação como lida:', notificationId);
      await notificationService.update(notificationId, { read: true });
      console.log('✅ Notificação marcada como lida');
    } catch (error) {
      console.error('❌ Erro ao marcar notificação como lida:', error);
      throw error;
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      console.log('🔔 Deletando notificação:', notificationId);
      await notificationService.delete(notificationId);
      console.log('✅ Notificação deletada com sucesso');
    } catch (error) {
      console.error('❌ Erro ao deletar notificação:', error);
      throw error;
    }
  };

  const markAllAsRead = async (userId: string) => {
    try {
      console.log('🔔 Marcando todas as notificações como lidas para usuário:', userId);
      const userNotifications = notifications.filter(n => n.userId === userId && !n.read);
      await Promise.all(
        userNotifications.map(notification => 
          notificationService.update(notification.id, { read: true })
        )
      );
      console.log('✅ Todas as notificações marcadas como lidas');
    } catch (error) {
      console.error('❌ Erro ao marcar todas as notificações como lidas:', error);
      throw error;
    }
  };

  const addToWatchHistory = async (history: WatchHistory) => {
    try {
      console.log('📺 Adicionando ao histórico:', history.id);
      const { id, ...historyData } = history;
      await watchHistoryService.createOrUpdate(historyData);
      console.log('✅ Histórico atualizado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao adicionar ao histórico:', error);
      throw error;
    }
  };

  const addFavorite = async (userId: string, courseId?: string, productId?: string) => {
    try {
      console.log('❤️ Adicionando favorito:', { userId, courseId, productId });
      await favoriteService.create({
        id: Date.now().toString(),
        userId,
        courseId,
        productId,
        addedAt: new Date().toISOString(),
      });
      console.log('✅ Favorito adicionado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao adicionar favorito:', error);
      throw error;
    }
  };

  const removeFavorite = async (userId: string, courseId?: string, productId?: string) => {
    try {
      console.log('❤️ Removendo favorito:', { userId, courseId, productId });
      const favorite = favorites.find(fav => 
        fav.userId === userId && 
        ((courseId && fav.courseId === courseId) || (productId && fav.productId === productId))
      );
      
      if (favorite) {
        await favoriteService.delete(favorite.id);
        console.log('✅ Favorito removido com sucesso');
      }
    } catch (error) {
      console.error('❌ Erro ao remover favorito:', error);
      throw error;
    }
  };

  const addResource = async (resource: Resource) => {
    try {
      console.log('📁 Adicionando recurso:', resource.title);
      const { id, ...resourceData } = resource;
      const newId = await resourceService.create(resourceData);
      console.log('✅ Recurso adicionado com ID:', newId);
    } catch (error) {
      console.error('❌ Erro ao adicionar recurso:', error);
      throw error;
    }
  };

  const deleteResource = async (resourceId: string) => {
    try {
      console.log('📁 Deletando recurso:', resourceId);
      await resourceService.delete(resourceId);
      console.log('✅ Recurso deletado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao deletar recurso:', error);
      throw error;
    }
  };

  const addSupportTicket = async (ticket: SupportTicket) => {
    try {
      console.log('🎫 Adicionando ticket de suporte:', ticket.subject);
      const { id, ...ticketData } = ticket;
      const newId = await supportTicketService.create(ticketData);
      console.log('✅ Ticket de suporte adicionado com ID:', newId);
    } catch (error) {
      console.error('❌ Erro ao adicionar ticket de suporte:', error);
      throw error;
    }
  };

  const updateSupportTicket = async (ticketId: string, updates: Partial<SupportTicket>) => {
    try {
      console.log('🎫 Atualizando ticket de suporte:', ticketId, updates);
      await supportTicketService.update(ticketId, updates);
      console.log('✅ Ticket de suporte atualizado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao atualizar ticket de suporte:', error);
      throw error;
    }
  };

  const addBanner = async (banner: Banner) => {
    try {
      console.log('🖼️ Adicionando banner:', banner.title);
      const { id, ...bannerData } = banner;
      const newId = await bannerService.create(bannerData);
      console.log('✅ Banner adicionado com ID:', newId);
    } catch (error) {
      console.error('❌ Erro ao adicionar banner:', error);
      throw error;
    }
  };

  const updateBanner = async (bannerId: string, updates: Partial<Banner>) => {
    try {
      console.log('🖼️ Atualizando banner:', bannerId, updates);
      await bannerService.update(bannerId, updates);
      console.log('✅ Banner atualizado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao atualizar banner:', error);
      throw error;
    }
  };

  const deleteBanner = async (bannerId: string) => {
    try {
      console.log('🖼️ Deletando banner:', bannerId);
      await bannerService.delete(bannerId);
      console.log('✅ Banner deletado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao deletar banner:', error);
      throw error;
    }
  };

  const addFixedNotification = async (notification: FixedNotification) => {
    try {
      console.log('📢 Adicionando notificação fixa:', notification.title);
      const { id, ...notificationData } = notification;
      const newId = await fixedNotificationService.create(notificationData);
      console.log('✅ Notificação fixa adicionada com ID:', newId);
    } catch (error) {
      console.error('❌ Erro ao adicionar notificação fixa:', error);
      throw error;
    }
  };

  const updateFixedNotification = async (notificationId: string, updates: Partial<FixedNotification>) => {
    try {
      console.log('📢 Atualizando notificação fixa:', notificationId, updates);
      await fixedNotificationService.update(notificationId, updates);
      console.log('✅ Notificação fixa atualizada com sucesso');
    } catch (error) {
      console.error('❌ Erro ao atualizar notificação fixa:', error);
      throw error;
    }
  };

  const deleteFixedNotification = async (notificationId: string) => {
    try {
      console.log('📢 Deletando notificação fixa:', notificationId);
      await fixedNotificationService.delete(notificationId);
      console.log('✅ Notificação fixa deletada com sucesso');
    } catch (error) {
      console.error('❌ Erro ao deletar notificação fixa:', error);
      throw error;
    }
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
    try {
      console.log('🚫 Bloqueando usuário:', userId, reason);
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
      console.log('✅ Usuário bloqueado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao bloquear usuário:', error);
      throw error;
    }
  };

  const unblockUser = async (userId: string, adminId: string) => {
    try {
      console.log('✅ Desbloqueando usuário:', userId);
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
      console.log('✅ Usuário desbloqueado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao desbloquear usuário:', error);
      throw error;
    }
  };

  const terminateUserSession = async (sessionId: string, adminId: string) => {
    try {
      console.log('🔐 Terminando sessão:', sessionId);
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
      console.log('✅ Sessão terminada com sucesso');
    } catch (error) {
      console.error('❌ Erro ao terminar sessão:', error);
      throw error;
    }
  };

  const terminateAllUserSessions = async (userId: string, adminId: string) => {
    try {
      console.log('🔐 Terminando todas as sessões do usuário:', userId);
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
      console.log('✅ Todas as sessões terminadas com sucesso');
    } catch (error) {
      console.error('❌ Erro ao terminar todas as sessões:', error);
      throw error;
    }
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
    try {
      console.log('🛡️ Atualizando configurações de segurança:', securitySettings);
      const newSettings = {
        ...settings,
        security: { ...settings.security, ...securitySettings }
      };
      await updateSettings(newSettings);
      console.log('✅ Configurações de segurança atualizadas com sucesso');
    } catch (error) {
      console.error('❌ Erro ao atualizar configurações de segurança:', error);
      throw error;
    }
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