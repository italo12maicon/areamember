import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState, UserSession, SecurityLog } from '../types';
import { getClientIP, getUserAgent, getDeviceInfo, getLocationFromIP, generateSessionId } from '../utils/security';
import { userService, userSessionService, securityLogService } from '../services/firebaseService';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  updateUser: (userId: string, updates: Partial<User>) => void;
  currentSession: UserSession | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_CREDENTIALS = {
  email: 'member@gmail.com',
  password: 'member123#'
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null
  });
  const [currentSession, setCurrentSession] = useState<UserSession | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    const savedSession = localStorage.getItem('currentSession');
    
    if (savedUser && savedSession) {
      const user = JSON.parse(savedUser);
      const session = JSON.parse(savedSession);
      
      // Verificar se o usuário não está bloqueado
      if (!user.isBlocked) {
        // Garantir que unlockedProducts existe
        if (!user.unlockedProducts) {
          user.unlockedProducts = [];
        }
        
        setAuthState({
          isAuthenticated: true,
          user
        });
        setCurrentSession(session);
        
        // Atualizar última atividade
        updateLastActivity(session.id);
      } else {
        // Se usuário está bloqueado, fazer logout
        logout();
      }
    }
  }, []);

  const createSecurityLog = async (
    userId: string,
    action: SecurityLog['action'],
    ipAddress: string,
    userAgent: string,
    details: string,
    severity: SecurityLog['severity'] = 'low',
    adminId?: string
  ) => {
    try {
      await securityLogService.create({
        id: Date.now().toString(),
        userId,
        action,
        ipAddress,
        userAgent,
        timestamp: new Date().toISOString(),
        details,
        severity,
        adminId
      });
    } catch (error) {
      console.error('Erro ao criar log de segurança:', error);
    }
  };

  const createUserSession = async (user: User): Promise<UserSession> => {
    console.log('Creating user session for:', user.name);
    
    const ipAddress = await getClientIP();
    const userAgent = getUserAgent();
    const { device, browser } = getDeviceInfo();
    const location = await getLocationFromIP(ipAddress);
    
    const session: UserSession = {
      id: generateSessionId(),
      userId: user.id,
      ipAddress,
      userAgent,
      loginTime: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      isActive: true,
      location,
      device,
      browser
    };
    
    // Salvar sessão no Firebase
    try {
      await userSessionService.create(session);
    } catch (error) {
      console.error('Erro ao salvar sessão no Firebase:', error);
    }
    
    // Salvar também no localStorage para recuperação
    localStorage.setItem('currentSession', JSON.stringify(session));
    
    // Criar log de segurança
    await createSecurityLog(
      user.id,
      'login',
      ipAddress,
      userAgent,
      `Login realizado de ${location} usando ${browser} em ${device}`,
      'low'
    );
    
    return session;
  };

  const updateLastActivity = async (sessionId: string) => {
    try {
      await userSessionService.update(sessionId, {
        lastActivity: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erro ao atualizar última atividade:', error);
    }
  };

  const terminateSession = async (sessionId: string) => {
    try {
      const session = currentSession;
      if (session) {
        await userSessionService.update(sessionId, {
          isActive: false,
          logoutTime: new Date().toISOString(),
          sessionDuration: Math.floor((Date.now() - new Date(session.loginTime).getTime()) / (1000 * 60))
        });
      }
    } catch (error) {
      console.error('Erro ao terminar sessão:', error);
    }
  };

  const checkMultipleActiveSessions = async (userId: string, currentIP: string): Promise<boolean> => {
    try {
      const allSessions = await userSessionService.getAll();
      const activeSessions = allSessions.filter((s: UserSession) => 
        s.userId === userId && s.isActive
      );
      
      const uniqueIPs = new Set(activeSessions.map((s: UserSession) => s.ipAddress));
      
      // Se há mais de 2 IPs diferentes ativos, criar log de atividade suspeita
      if (uniqueIPs.size > 2) {
        await createSecurityLog(
          userId,
          'multiple_ips',
          currentIP,
          getUserAgent(),
          `Usuário ativo em ${uniqueIPs.size} IPs diferentes: ${Array.from(uniqueIPs).join(', ')}`,
          'high'
        );
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erro ao verificar múltiplas sessões:', error);
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('Login attempt for:', email);
    
    try {
      // Check admin credentials
      if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
        const adminUser: User = {
          id: 'admin',
          email: ADMIN_CREDENTIALS.email,
          password: ADMIN_CREDENTIALS.password,
          name: 'Administrator',
          isAdmin: true,
          registrationDate: new Date().toISOString(),
          unlockedCourses: [],
          unlockedProducts: []
        };
        
        const session = await createUserSession(adminUser);
        
        setAuthState({
          isAuthenticated: true,
          user: adminUser
        });
        setCurrentSession(session);
        
        localStorage.setItem('currentUser', JSON.stringify(adminUser));
        
        console.log('Admin login successful');
        return true;
      }

      // Check regular users from Firebase
      const users = await userService.getAll();
      const user = users.find(u => u.email === email && u.password === password);
      
      if (user) {
        console.log('User found:', user.name);
        
        // Garantir que unlockedProducts existe
        if (!user.unlockedProducts) {
          user.unlockedProducts = [];
          await userService.update(user.id, { unlockedProducts: [] });
        }
        
        // Verificar se usuário está bloqueado
        if (user.isBlocked) {
          const currentIP = await getClientIP();
          await createSecurityLog(
            user.id,
            'blocked',
            currentIP,
            getUserAgent(),
            `Tentativa de login de usuário bloqueado: ${user.blockedReason || 'Motivo não especificado'}`,
            'medium'
          );
          console.log('User is blocked');
          return false;
        }
        
        const currentIP = await getClientIP();
        
        // Verificar múltiplas sessões ativas
        await checkMultipleActiveSessions(user.id, currentIP);
        
        const session = await createUserSession(user);
        
        setAuthState({
          isAuthenticated: true,
          user
        });
        setCurrentSession(session);
        
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        console.log('User login successful');
        return true;
      }

      console.log('Login failed - user not found or wrong credentials');
      return false;
    } catch (error) {
      console.error('Erro durante login:', error);
      return false;
    }
  };

  const logout = () => {
    if (currentSession) {
      terminateSession(currentSession.id);
      
      // Criar log de logout
      if (authState.user) {
        createSecurityLog(
          authState.user.id,
          'logout',
          currentSession.ipAddress,
          currentSession.userAgent,
          `Logout realizado após ${Math.floor((Date.now() - new Date(currentSession.loginTime).getTime()) / (1000 * 60))} minutos`,
          'low'
        );
      }
    }
    
    setAuthState({
      isAuthenticated: false,
      user: null
    });
    setCurrentSession(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentSession');
    
    console.log('User logged out');
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      const users = await userService.getAll();
      
      if (users.find(u => u.email === email)) {
        return false; // User already exists
      }

      const newUser: Omit<User, 'id'> = {
        email,
        password,
        name,
        isAdmin: false,
        registrationDate: new Date().toISOString(),
        unlockedCourses: [],
        unlockedProducts: [],
        isBlocked: false
      };

      await userService.create(newUser);
      return true;
    } catch (error) {
      console.error('Erro durante registro:', error);
      return false;
    }
  };

  const updateUser = async (userId: string, updates: Partial<User>) => {
    try {
      await userService.update(userId, updates);
      
      // Se o usuário atual foi atualizado, atualizar o estado
      if (authState.user && authState.user.id === userId) {
        const updatedUser = { ...authState.user, ...updates };
        setAuthState({
          ...authState,
          user: updatedUser
        });
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        
        // Se o usuário foi bloqueado, fazer logout
        if (updates.isBlocked) {
          logout();
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
    }
  };

  // Atualizar atividade a cada 5 minutos
  useEffect(() => {
    if (currentSession && authState.isAuthenticated) {
      const interval = setInterval(() => {
        updateLastActivity(currentSession.id);
      }, 5 * 60 * 1000); // 5 minutos

      return () => clearInterval(interval);
    }
  }, [currentSession, authState.isAuthenticated]);

  return (
    <AuthContext.Provider value={{
      ...authState,
      login,
      logout,
      register,
      updateUser,
      currentSession
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};