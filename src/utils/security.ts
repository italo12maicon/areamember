// Utilitários para segurança e rastreamento
export const getClientIP = async (): Promise<string> => {
  try {
    // Múltiplas tentativas para obter o IP real
    const services = [
      'https://api.ipify.org?format=json',
      'https://ipapi.co/json/',
      'https://httpbin.org/ip'
    ];
    
    for (const service of services) {
      try {
        const response = await fetch(service);
        const data = await response.json();
        
        // Diferentes formatos de resposta dos serviços
        const ip = data.ip || data.query || data.origin;
        if (ip && isValidIP(ip)) {
          return ip;
        }
      } catch (error) {
        continue; // Tenta o próximo serviço
      }
    }
    
    // Fallback: gerar IP simulado baseado em características do navegador
    const fingerprint = generateBrowserFingerprint();
    return `192.168.1.${fingerprint % 254 + 1}`;
  } catch (error) {
    // Último fallback
    return `192.168.1.${Math.floor(Math.random() * 254) + 1}`;
  }
};

export const generateBrowserFingerprint = (): number => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Browser fingerprint', 2, 2);
  }
  
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    canvas.toDataURL()
  ].join('|');
  
  // Gera um hash simples
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Converte para 32bit
  }
  
  return Math.abs(hash);
};

export const getUserAgent = (): string => {
  return navigator.userAgent;
};

export const getDeviceInfo = (): { device: string; browser: string } => {
  const userAgent = navigator.userAgent;
  
  // Detectar dispositivo
  let device = 'Desktop';
  if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
    if (/iPad/.test(userAgent)) {
      device = 'Tablet';
    } else {
      device = 'Mobile';
    }
  }
  
  // Detectar navegador
  let browser = 'Unknown';
  if (userAgent.includes('Chrome') && !userAgent.includes('Edge')) {
    browser = 'Chrome';
  } else if (userAgent.includes('Firefox')) {
    browser = 'Firefox';
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    browser = 'Safari';
  } else if (userAgent.includes('Edge')) {
    browser = 'Edge';
  } else if (userAgent.includes('Opera')) {
    browser = 'Opera';
  }
  
  return { device, browser };
};

export const getLocationFromIP = async (ip: string): Promise<string> => {
  try {
    // Usando um serviço gratuito para obter localização aproximada
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = await response.json();
    
    if (data.city && data.country_name) {
      return `${data.city}, ${data.country_name}`;
    } else if (data.country_name) {
      return data.country_name;
    }
    
    return 'Brasil'; // Fallback padrão
  } catch (error) {
    return 'Localização não disponível';
  }
};

export const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const isValidIP = (ip: string): boolean => {
  // Regex para IPv4
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  // Regex básica para IPv6
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
};

export const calculateSessionDuration = (loginTime: string, logoutTime: string): number => {
  const login = new Date(loginTime).getTime();
  const logout = new Date(logoutTime).getTime();
  return Math.floor((logout - login) / (1000 * 60)); // Retorna em minutos
};

export const detectSuspiciousActivity = (sessions: any[], userId: string): boolean => {
  const userSessions = sessions.filter(s => s.userId === userId && s.isActive);
  const uniqueIPs = new Set(userSessions.map(s => s.ipAddress));
  
  // Considera suspeito se há mais de 3 IPs diferentes ativos
  return uniqueIPs.size > 3;
};

export const formatIPAddress = (ip: string): string => {
  if (!ip || ip === '127.0.0.1') {
    return 'IP Local';
  }
  return ip;
};

export const getSecurityRiskLevel = (sessions: any[], userId: string): 'low' | 'medium' | 'high' | 'critical' => {
  const userSessions = sessions.filter(s => s.userId === userId && s.isActive);
  const uniqueIPs = new Set(userSessions.map(s => s.ipAddress));
  
  if (uniqueIPs.size >= 5) return 'critical';
  if (uniqueIPs.size >= 3) return 'high';
  if (uniqueIPs.size >= 2) return 'medium';
  return 'low';
};