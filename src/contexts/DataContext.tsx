import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Course, Product, AppSettings, User, Notification, WatchHistory, Favorite, Resource, SupportTicket, Banner, FixedNotification, UserSession, SecurityLog, SecuritySettings } from '../types';

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
  addCourse: (course: Course) => void;
  updateCourse: (courseId: string, course: Partial<Course>) => void;
  deleteCourse: (courseId: string) => void;
  addProduct: (product: Product) => void;
  updateProduct: (productId: string, product: Partial<Product>) => void;
  deleteProduct: (productId: string) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  addUser: (user: User) => void;
  deleteUser: (userId: string) => void;
  updateUser: (userId: string, updates: Partial<User>) => void;
  addNotification: (notification: Notification) => void;
  markNotificationAsRead: (notificationId: string) => void;
  deleteNotification: (notificationId: string) => void;
  markAllAsRead: (userId: string) => void;
  addToWatchHistory: (history: WatchHistory) => void;
  addFavorite: (userId: string, courseId?: string, productId?: string) => void;
  removeFavorite: (userId: string, courseId?: string, productId?: string) => void;
  addResource: (resource: Resource) => void;
  deleteResource: (resourceId: string) => void;
  addSupportTicket: (ticket: SupportTicket) => void;
  updateSupportTicket: (ticketId: string, updates: Partial<SupportTicket>) => void;
  addBanner: (banner: Banner) => void;
  updateBanner: (bannerId: string, updates: Partial<Banner>) => void;
  deleteBanner: (bannerId: string) => void;
  addFixedNotification: (notification: FixedNotification) => void;
  updateFixedNotification: (notificationId: string, updates: Partial<FixedNotification>) => void;
  deleteFixedNotification: (notificationId: string) => void;
  getActiveFixedNotifications: () => FixedNotification[];
  blockUser: (userId: string, reason: string, adminId: string) => void;
  unblockUser: (userId: string, adminId: string) => void;
  terminateUserSession: (sessionId: string, adminId: string) => void;
  terminateAllUserSessions: (userId: string, adminId: string) => void;
  getUserSessions: (userId: string) => UserSession[];
  getActiveUserSessions: (userId: string) => UserSession[];
  getSecurityLogs: (userId?: string) => SecurityLog[];
  updateSecuritySettings: (settings: Partial<SecuritySettings>) => void;
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
  
  const processedUnlocks = useRef<Set<string>>(new Set());
  const lastNotificationCheck = useRef<number>(0);

  useEffect(() => {
    // Load data from localStorage
    const savedCourses = localStorage.getItem('courses');
    const savedProducts = localStorage.getItem('products');
    const savedSettings = localStorage.getItem('settings');
    const savedUsers = localStorage.getItem('users');
    const savedNotifications = localStorage.getItem('notifications');
    const savedWatchHistory = localStorage.getItem('watchHistory');
    const savedFavorites = localStorage.getItem('favorites');
    const savedResources = localStorage.getItem('resources');
    const savedSupportTickets = localStorage.getItem('supportTickets');
    const savedBanners = localStorage.getItem('banners');
    const savedFixedNotifications = localStorage.getItem('fixedNotifications');
    const savedUserSessions = localStorage.getItem('userSessions');
    const savedSecurityLogs = localStorage.getItem('securityLogs');

    if (savedCourses) setCourses(JSON.parse(savedCourses));
    if (savedProducts) setProducts(JSON.parse(savedProducts));
    if (savedSettings) setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) });
    if (savedUsers) setUsers(JSON.parse(savedUsers));
    if (savedNotifications) {
      const parsedNotifications = JSON.parse(savedNotifications);
      const limitedNotifications = parsedNotifications.slice(-100);
      setNotifications(limitedNotifications);
      localStorage.setItem('notifications', JSON.stringify(limitedNotifications));
    }
    if (savedWatchHistory) setWatchHistory(JSON.parse(savedWatchHistory));
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
    if (savedResources) setResources(JSON.parse(savedResources));
    if (savedSupportTickets) setSupportTickets(JSON.parse(savedSupportTickets));
    if (savedBanners) setBanners(JSON.parse(savedBanners));
    if (savedFixedNotifications) setFixedNotifications(JSON.parse(savedFixedNotifications));
    if (savedUserSessions) setUserSessions(JSON.parse(savedUserSessions));
    if (savedSecurityLogs) setSecurityLogs(JSON.parse(savedSecurityLogs));
  }, []);

  useEffect(() => {
    const checkScheduledUnlocks = () => {
      const now = Date.now();
      
      if (now - lastNotificationCheck.current < 30000) {
        return;
      }
      
      lastNotificationCheck.current = now;
      
      const currentDate = new Date();
      const coursesToUpdate: Course[] = [];
      const productsToUpdate: Product[] = [];
      
      courses.forEach(course => {
        if (course.isBlocked && course.scheduledUnlockDate) {
          const unlockDate = new Date(course.scheduledUnlockDate);
          const unlockKey = `scheduled-course-${course.id}`;
          
          if (currentDate >= unlockDate && !processedUnlocks.current.has(unlockKey)) {
            coursesToUpdate.push({
              ...course,
              isBlocked: false,
              scheduledUnlockDate: undefined
            });
            processedUnlocks.current.add(unlockKey);
          }
        }
      });

      products.forEach(product => {
        if (product.isBlocked && product.scheduledUnlockDate) {
          const unlockDate = new Date(product.scheduledUnlockDate);
          const unlockKey = `scheduled-product-${product.id}`;
          
          if (currentDate >= unlockDate && !processedUnlocks.current.has(unlockKey)) {
            productsToUpdate.push({
              ...product,
              isBlocked: false,
              scheduledUnlockDate: undefined
            });
            processedUnlocks.current.add(unlockKey);
          }
        }
      });

      if (coursesToUpdate.length > 0) {
        const updatedCourses = courses.map(course => {
          const updatedCourse = coursesToUpdate.find(c => c.id === course.id);
          return updatedCourse || course;
        });
        
        setCourses(updatedCourses);
        localStorage.setItem('courses', JSON.stringify(updatedCourses));

        const nonAdminUsers = users.filter(user => !user.isAdmin);
        
        coursesToUpdate.forEach(course => {
          nonAdminUsers.forEach(user => {
            const notificationId = `scheduled-unlock-course-${course.id}-${user.id}`;
            
            const existingNotification = notifications.find(n => n.id === notificationId);
            if (!existingNotification) {
              addNotification({
                id: notificationId,
                userId: user.id,
                title: 'Curso Desbloqueado Automaticamente! 🎉',
                message: `O curso "${course.title}" foi desbloqueado conforme programado e está disponível para você!`,
                type: 'success',
                read: false,
                createdAt: new Date().toISOString(),
              });
            }
          });
        });
      }

      if (productsToUpdate.length > 0) {
        const updatedProducts = products.map(product => {
          const updatedProduct = productsToUpdate.find(p => p.id === product.id);
          return updatedProduct || product;
        });
        
        setProducts(updatedProducts);
        localStorage.setItem('products', JSON.stringify(updatedProducts));

        const nonAdminUsers = users.filter(user => !user.isAdmin);
        
        productsToUpdate.forEach(product => {
          nonAdminUsers.forEach(user => {
            const notificationId = `scheduled-unlock-product-${product.id}-${user.id}`;
            
            const existingNotification = notifications.find(n => n.id === notificationId);
            if (!existingNotification) {
              addNotification({
                id: notificationId,
                userId: user.id,
                title: 'Produto Desbloqueado Automaticamente! 🎉',
                message: `O produto "${product.title}" foi desbloqueado conforme programado e está disponível para você!`,
                type: 'success',
                read: false,
                createdAt: new Date().toISOString(),
              });
            }
          });
        });
      }
    };

    const timeoutId = setTimeout(checkScheduledUnlocks, 1000);
    const intervalId = setInterval(checkScheduledUnlocks, 5 * 60 * 1000);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [courses, products, users, notifications]);

  const addCourse = (course: Course) => {
    const newCourses = [...courses, course];
    setCourses(newCourses);
    localStorage.setItem('courses', JSON.stringify(newCourses));
  };

  const updateCourse = (courseId: string, courseUpdate: Partial<Course>) => {
    const newCourses = courses.map(course => 
      course.id === courseId ? { ...course, ...courseUpdate } : course
    );
    setCourses(newCourses);
    localStorage.setItem('courses', JSON.stringify(newCourses));
  };

  const deleteCourse = (courseId: string) => {
    const newCourses = courses.filter(course => course.id !== courseId);
    setCourses(newCourses);
    localStorage.setItem('courses', JSON.stringify(newCourses));
  };

  const addProduct = (product: Product) => {
    const newProducts = [...products, product];
    setProducts(newProducts);
    localStorage.setItem('products', JSON.stringify(newProducts));
  };

  const updateProduct = (productId: string, productUpdate: Partial<Product>) => {
    const newProducts = products.map(product => 
      product.id === productId ? { ...product, ...productUpdate } : product
    );
    setProducts(newProducts);
    localStorage.setItem('products', JSON.stringify(newProducts));
  };

  const deleteProduct = (productId: string) => {
    const newProducts = products.filter(product => product.id !== productId);
    setProducts(newProducts);
    localStorage.setItem('products', JSON.stringify(newProducts));
  };

  const updateSettings = (settingsUpdate: Partial<AppSettings>) => {
    const newSettings = { ...settings, ...settingsUpdate };
    setSettings(newSettings);
    localStorage.setItem('settings', JSON.stringify(newSettings));
  };

  const addUser = (user: User) => {
    const newUsers = [...users, user];
    setUsers(newUsers);
    localStorage.setItem('users', JSON.stringify(newUsers));
  };

  const deleteUser = (userId: string) => {
    const newUsers = users.filter(user => user.id !== userId);
    setUsers(newUsers);
    localStorage.setItem('users', JSON.stringify(newUsers));
  };

  const updateUser = (userId: string, updates: Partial<User>) => {
    const newUsers = users.map(user => 
      user.id === userId ? { ...user, ...updates } : user
    );
    setUsers(newUsers);
    localStorage.setItem('users', JSON.stringify(newUsers));
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (currentUser && currentUser.id === userId) {
      const updatedCurrentUser = { ...currentUser, ...updates };
      localStorage.setItem('currentUser', JSON.stringify(updatedCurrentUser));
    }
  };

  const addNotification = (notification: Notification) => {
    const isDuplicate = notifications.some(n => 
      n.userId === notification.userId && 
      n.title === notification.title && 
      n.message === notification.message &&
      Math.abs(new Date(n.createdAt).getTime() - new Date(notification.createdAt).getTime()) < 60000
    );
    
    if (isDuplicate) {
      return;
    }
    
    const newNotifications = [...notifications, notification];
    const limitedNotifications = newNotifications.slice(-100);
    
    setNotifications(limitedNotifications);
    localStorage.setItem('notifications', JSON.stringify(limitedNotifications));
  };

  const markNotificationAsRead = (notificationId: string) => {
    const newNotifications = notifications.map(notification =>
      notification.id === notificationId ? { ...notification, read: true } : notification
    );
    setNotifications(newNotifications);
    localStorage.setItem('notifications', JSON.stringify(newNotifications));
  };

  const deleteNotification = (notificationId: string) => {
    const newNotifications = notifications.filter(notification => notification.id !== notificationId);
    setNotifications(newNotifications);
    localStorage.setItem('notifications', JSON.stringify(newNotifications));
  };

  const markAllAsRead = (userId: string) => {
    const newNotifications = notifications.map(notification =>
      notification.userId === userId ? { ...notification, read: true } : notification
    );
    setNotifications(newNotifications);
    localStorage.setItem('notifications', JSON.stringify(newNotifications));
  };

  const addToWatchHistory = (history: WatchHistory) => {
    const existingIndex = watchHistory.findIndex(h => 
      h.userId === history.userId && 
      ((h.courseId && history.courseId && h.courseId === history.courseId) ||
       (h.productId && history.productId && h.productId === history.productId))
    );
    
    let newWatchHistory;
    if (existingIndex >= 0) {
      newWatchHistory = [...watchHistory];
      newWatchHistory[existingIndex] = history;
    } else {
      newWatchHistory = [...watchHistory, history];
    }
    
    setWatchHistory(newWatchHistory);
    localStorage.setItem('watchHistory', JSON.stringify(newWatchHistory));
  };

  const addFavorite = (userId: string, courseId?: string, productId?: string) => {
    const existingFavorite = favorites.find(fav => 
      fav.userId === userId && 
      ((courseId && fav.courseId === courseId) || (productId && fav.productId === productId))
    );
    
    if (existingFavorite) {
      return;
    }
    
    const favorite: Favorite = {
      id: Date.now().toString(),
      userId,
      courseId,
      productId,
      addedAt: new Date().toISOString(),
    };
    
    const newFavorites = [...favorites, favorite];
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
  };

  const removeFavorite = (userId: string, courseId?: string, productId?: string) => {
    const newFavorites = favorites.filter(fav => 
      !(fav.userId === userId && 
        ((courseId && fav.courseId === courseId) || (productId && fav.productId === productId)))
    );
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
  };

  const addResource = (resource: Resource) => {
    const newResources = [...resources, resource];
    setResources(newResources);
    localStorage.setItem('resources', JSON.stringify(newResources));
  };

  const deleteResource = (resourceId: string) => {
    const newResources = resources.filter(resource => resource.id !== resourceId);
    setResources(newResources);
    localStorage.setItem('resources', JSON.stringify(newResources));
  };

  const addSupportTicket = (ticket: SupportTicket) => {
    const newTickets = [...supportTickets, ticket];
    setSupportTickets(newTickets);
    localStorage.setItem('supportTickets', JSON.stringify(newTickets));
  };

  const updateSupportTicket = (ticketId: string, updates: Partial<SupportTicket>) => {
    const newTickets = supportTickets.map(ticket =>
      ticket.id === ticketId ? { ...ticket, ...updates } : ticket
    );
    setSupportTickets(newTickets);
    localStorage.setItem('supportTickets', JSON.stringify(newTickets));
  };

  const addBanner = (banner: Banner) => {
    const newBanners = [...banners, banner];
    setBanners(newBanners);
    localStorage.setItem('banners', JSON.stringify(newBanners));
  };

  const updateBanner = (bannerId: string, updates: Partial<Banner>) => {
    const newBanners = banners.map(banner =>
      banner.id === bannerId ? { ...banner, ...updates } : banner
    );
    setBanners(newBanners);
    localStorage.setItem('banners', JSON.stringify(newBanners));
  };

  const deleteBanner = (bannerId: string) => {
    const newBanners = banners.filter(banner => banner.id !== bannerId);
    setBanners(newBanners);
    localStorage.setItem('banners', JSON.stringify(newBanners));
  };

  const addFixedNotification = (notification: FixedNotification) => {
    const newNotifications = [...fixedNotifications, notification];
    setFixedNotifications(newNotifications);
    localStorage.setItem('fixedNotifications', JSON.stringify(newNotifications));
  };

  const updateFixedNotification = (notificationId: string, updates: Partial<FixedNotification>) => {
    const newNotifications = fixedNotifications.map(notification =>
      notification.id === notificationId ? { ...notification, ...updates } : notification
    );
    setFixedNotifications(newNotifications);
    localStorage.setItem('fixedNotifications', JSON.stringify(newNotifications));
  };

  const deleteFixedNotification = (notificationId: string) => {
    const newNotifications = fixedNotifications.filter(notification => notification.id !== notificationId);
    setFixedNotifications(newNotifications);
    localStorage.setItem('fixedNotifications', JSON.stringify(newNotifications));
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

  const blockUser = (userId: string, reason: string, adminId: string) => {
    const updates: Partial<User> = {
      isBlocked: true,
      blockedReason: reason,
      blockedAt: new Date().toISOString()
    };
    
    updateUser(userId, updates);
    terminateAllUserSessions(userId, adminId);
    
    const newLog: SecurityLog = {
      id: Date.now().toString(),
      userId,
      action: 'blocked',
      ipAddress: 'admin-action',
      userAgent: 'admin-panel',
      timestamp: new Date().toISOString(),
      details: `Usuário bloqueado pelo administrador. Motivo: ${reason}`,
      severity: 'high',
      adminId
    };
    
    const newLogs = [...securityLogs, newLog];
    setSecurityLogs(newLogs);
    localStorage.setItem('securityLogs', JSON.stringify(newLogs));
  };

  const unblockUser = (userId: string, adminId: string) => {
    const updates: Partial<User> = {
      isBlocked: false,
      blockedReason: undefined,
      blockedAt: undefined
    };
    
    updateUser(userId, updates);
    
    const newLog: SecurityLog = {
      id: Date.now().toString(),
      userId,
      action: 'unblocked',
      ipAddress: 'admin-action',
      userAgent: 'admin-panel',
      timestamp: new Date().toISOString(),
      details: 'Usuário desbloqueado pelo administrador',
      severity: 'medium',
      adminId
    };
    
    const newLogs = [...securityLogs, newLog];
    setSecurityLogs(newLogs);
    localStorage.setItem('securityLogs', JSON.stringify(newLogs));
  };

  const terminateUserSession = (sessionId: string, adminId: string) => {
    const session = userSessions.find(s => s.id === sessionId);
    if (!session) return;
    
    const updatedSessions = userSessions.map(s =>
      s.id === sessionId
        ? {
            ...s,
            isActive: false,
            logoutTime: new Date().toISOString(),
            sessionDuration: Math.floor((Date.now() - new Date(s.loginTime).getTime()) / (1000 * 60))
          }
        : s
    );
    
    setUserSessions(updatedSessions);
    localStorage.setItem('userSessions', JSON.stringify(updatedSessions));
    
    const newLog: SecurityLog = {
      id: Date.now().toString(),
      userId: session.userId,
      action: 'logout',
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      timestamp: new Date().toISOString(),
      details: `Sessão terminada pelo administrador (IP: ${session.ipAddress})`,
      severity: 'medium',
      adminId
    };
    
    const newLogs = [...securityLogs, newLog];
    setSecurityLogs(newLogs);
    localStorage.setItem('securityLogs', JSON.stringify(newLogs));
  };

  const terminateAllUserSessions = (userId: string, adminId: string) => {
    const userActiveSessions = userSessions.filter(s => s.userId === userId && s.isActive);
    
    const updatedSessions = userSessions.map(s =>
      s.userId === userId && s.isActive
        ? {
            ...s,
            isActive: false,
            logoutTime: new Date().toISOString(),
            sessionDuration: Math.floor((Date.now() - new Date(s.loginTime).getTime()) / (1000 * 60))
          }
        : s
    );
    
    setUserSessions(updatedSessions);
    localStorage.setItem('userSessions', JSON.stringify(updatedSessions));
    
    const newLog: SecurityLog = {
      id: Date.now().toString(),
      userId,
      action: 'logout',
      ipAddress: 'admin-action',
      userAgent: 'admin-panel',
      timestamp: new Date().toISOString(),
      details: `Todas as sessões (${userActiveSessions.length}) terminadas pelo administrador`,
      severity: 'high',
      adminId
    };
    
    const newLogs = [...securityLogs, newLog];
    setSecurityLogs(newLogs);
    localStorage.setItem('securityLogs', JSON.stringify(newLogs));
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

  const updateSecuritySettings = (securitySettings: Partial<SecuritySettings>) => {
    const newSettings = {
      ...settings,
      security: { ...settings.security, ...securitySettings }
    };
    setSettings(newSettings);
    localStorage.setItem('settings', JSON.stringify(newSettings));
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