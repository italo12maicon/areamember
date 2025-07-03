import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState, UserSession, SecurityLog } from '../types';
import { getClientIP, getUserAgent, getDeviceInfo, getLocationFromIP, generateSessionId } from '../utils/security';

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

  const createSecurityLog = (
    userId: string,
    action: SecurityLog['action'],
    ipAddress: string,
    userAgent: string,
    details: string,
    severity: SecurityLog['severity'] = 'low',
    adminId?: string
  ) => {
    const logs = JSON.parse(localStorage.getItem('securityLogs') || '[]');
    const newLog: SecurityLog = {
      id: Date.now().toString(),
      userId,
      action,
      ipAddress,
      userAgent,
      timestamp: new Date().toISOString(),
      details,
      severity,
      adminId
    };
    
    logs.push(newLog);
    localStorage.setItem('securityLogs', JSON.stringify(logs));
    
    console.log('Security Log Created:', newLog); // Debug log
  };

  const createUserSession = async (user: User): Promise<UserSession> => {
    console.log('Creating user session for:', user.name); // Debug log
    
    const ipAddress = await getClientIP();
    const userAgent = getUserAgent();
    const { device, browser } = getDeviceInfo();
    const location = await getLocationFromIP(ipAddress);
    
    console.log('IP Address obtained:', ipAddress); // Debug log
    console.log('Device info:', { device, browser }); // Debug log
    
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
    
    // Salvar sessão
    const sessions = JSON.parse(localStorage.getItem('userSessions') || '[]');
    sessions.push(session);
    localStorage.setItem('userSessions', JSON.stringify(sessions));
    
    console.log('Session created and saved:', session); // Debug log
    
    // Criar log de segurança
    createSecurityLog(
      user.id,
      'login',
      ipAddress,
      userAgent,
      `Login realizado de ${location} usando ${browser} em ${device}`,
      'low'
    );
    
    return session;
  };

  const updateLastActivity = (sessionId: string) => {
    const sessions = JSON.parse(localStorage.getItem('userSessions') || '[]');
    const updatedSessions = sessions.map((session: UserSession) => 
      session.id === sessionId 
        ? { ...session, lastActivity: new Date().toISOString() }
        : session
    );
    localStorage.setItem('userSessions', JSON.stringify(updatedSessions));
  };

  const terminateSession = (sessionId: string) => {
    const sessions = JSON.parse(localStorage.getItem('userSessions') || '[]');
    const updatedSessions = sessions.map((session: UserSession) => 
      session.id === sessionId 
        ? { 
            ...session, 
            isActive: false, 
            logoutTime: new Date().toISOString(),
            sessionDuration: Math.floor((Date.now() - new Date(session.loginTime).getTime()) / (1000 * 60))
          }
        : session
    );
    localStorage.setItem('userSessions', JSON.stringify(updatedSessions));
  };

  const checkUserBlocked = (userId: string): boolean => {
    const users = JSON.parse(localStorage.getItem('users') || '[]') as User[];
    const user = users.find(u => u.id === userId);
    return user?.isBlocked || false;
  };

  const checkMultipleActiveSessions = async (userId: string, currentIP: string): Promise<boolean> => {
    const sessions = JSON.parse(localStorage.getItem('userSessions') || '[]');
    const activeSessions = sessions.filter((s: UserSession) => 
      s.userId === userId && s.isActive
    );
    
    const uniqueIPs = new Set(activeSessions.map((s: UserSession) => s.ipAddress));
    
    console.log('Active sessions for user:', activeSessions); // Debug log
    console.log('Unique IPs:', Array.from(uniqueIPs)); // Debug log
    
    // Se há mais de 2 IPs diferentes ativos, criar log de atividade suspeita
    if (uniqueIPs.size > 2) {
      createSecurityLog(
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
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('Login attempt for:', email); // Debug log
    
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
      localStorage.setItem('currentSession', JSON.stringify(session));
      
      console.log('Admin login successful'); // Debug log
      return true;
    }

    // Check regular users
    const users = JSON.parse(localStorage.getItem('users') || '[]') as User[];
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
      console.log('User found:', user.name); // Debug log
      
      // Garantir que unlockedProducts existe
      if (!user.unlockedProducts) {
        user.unlockedProducts = [];
        // Atualizar no localStorage
        const updatedUsers = users.map(u => u.id === user.id ? { ...u, unlockedProducts: [] } : u);
        localStorage.setItem('users', JSON.stringify(updatedUsers));
      }
      
      // Verificar se usuário está bloqueado
      if (user.isBlocked) {
        const currentIP = await getClientIP();
        createSecurityLog(
          user.id,
          'blocked',
          currentIP,
          getUserAgent(),
          `Tentativa de login de usuário bloqueado: ${user.blockedReason || 'Motivo não especificado'}`,
          'medium'
        );
        console.log('User is blocked'); // Debug log
        return false;
      }
      
      const currentIP = await getClientIP();
      console.log('Current IP for login:', currentIP); // Debug log
      
      // Verificar múltiplas sessões ativas
      await checkMultipleActiveSessions(user.id, currentIP);
      
      const session = await createUserSession(user);
      
      setAuthState({
        isAuthenticated: true,
        user
      });
      setCurrentSession(session);
      
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('currentSession', JSON.stringify(session));
      
      console.log('User login successful'); // Debug log
      return true;
    }

    console.log('Login failed - user not found or wrong credentials'); // Debug log
    return false;
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
    
    console.log('User logged out'); // Debug log
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    const users = JSON.parse(localStorage.getItem('users') || '[]') as User[];
    
    if (users.find(u => u.email === email)) {
      return false; // User already exists
    }

    const newUser: User = {
      id: Date.now().toString(),
      email,
      password,
      name,
      isAdmin: false,
      registrationDate: new Date().toISOString(),
      unlockedCourses: [],
      unlockedProducts: [],
      isBlocked: false
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    return true;
  };

  const updateUser = (userId: string, updates: Partial<User>) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]') as User[];
    const updatedUsers = users.map(user => 
      user.id === userId ? { ...user, ...updates } : user
    );
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
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