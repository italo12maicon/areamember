import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Configuração do banco de dados Netlify/Neon
const DATABASE_URL = import.meta.env.VITE_DATABASE_URL || 'postgresql://neondb_owner:npg_password@ep-example.us-east-1.aws.neon.tech/neondb?sslmode=require';

// Criar conexão com o banco
const sql = neon(DATABASE_URL);
export const db = drizzle(sql, { schema });

// Função para testar conexão
export async function testConnection() {
  try {
    const result = await sql`SELECT 1 as test`;
    console.log('✅ Conexão com banco de dados estabelecida:', result);
    return true;
  } catch (error) {
    console.error('❌ Erro na conexão com banco de dados:', error);
    return false;
  }
}

// Função para inicializar o banco de dados
export async function initializeDatabase() {
  try {
    console.log('🔄 Inicializando banco de dados...');
    
    // Criar tabelas se não existirem
    await createTables();
    
    // Inserir dados iniciais se necessário
    await insertInitialData();
    
    console.log('✅ Banco de dados inicializado com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error);
    return false;
  }
}

// Função para criar tabelas
async function createTables() {
  try {
    // Criar tabela de usuários
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        is_admin BOOLEAN DEFAULT FALSE,
        registration_date TIMESTAMP DEFAULT NOW(),
        unlocked_courses TEXT[] DEFAULT '{}',
        unlocked_products TEXT[] DEFAULT '{}',
        is_blocked BOOLEAN DEFAULT FALSE,
        blocked_reason TEXT,
        blocked_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Criar tabela de cursos
    await sql`
      CREATE TABLE IF NOT EXISTS courses (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        image_url TEXT,
        is_blocked BOOLEAN DEFAULT FALSE,
        unlock_after_days INTEGER,
        manual_unlock_only BOOLEAN DEFAULT FALSE,
        unblock_link TEXT,
        scheduled_unlock_date TIMESTAMP,
        lessons JSONB DEFAULT '[]',
        topics JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Criar tabela de produtos
    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        image_url TEXT,
        is_blocked BOOLEAN DEFAULT FALSE,
        unlock_after_days INTEGER,
        manual_unlock_only BOOLEAN DEFAULT FALSE,
        unblock_link TEXT,
        scheduled_unlock_date TIMESTAMP,
        lessons JSONB DEFAULT '[]',
        topics JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Criar tabela de notificações
    await sql`
      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT NOT NULL,
        read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Criar tabela de histórico de visualização
    await sql`
      CREATE TABLE IF NOT EXISTS watch_history (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        course_id TEXT,
        product_id TEXT,
        topic_id TEXT,
        last_lesson_id TEXT,
        last_watched_at TIMESTAMP DEFAULT NOW(),
        first_watched_at TIMESTAMP DEFAULT NOW(),
        watch_time_minutes INTEGER DEFAULT 0,
        completed_lessons TEXT[] DEFAULT '{}'
      )
    `;

    // Criar tabela de favoritos
    await sql`
      CREATE TABLE IF NOT EXISTS favorites (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        course_id TEXT,
        product_id TEXT,
        topic_id TEXT,
        added_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Criar tabela de recursos
    await sql`
      CREATE TABLE IF NOT EXISTS resources (
        id TEXT PRIMARY KEY,
        course_id TEXT,
        product_id TEXT,
        topic_id TEXT,
        title TEXT NOT NULL,
        description TEXT,
        type TEXT NOT NULL,
        url TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Criar tabela de tickets de suporte
    await sql`
      CREATE TABLE IF NOT EXISTS support_tickets (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        subject TEXT NOT NULL,
        category TEXT NOT NULL,
        priority TEXT NOT NULL,
        message TEXT NOT NULL,
        status TEXT DEFAULT 'open',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Criar tabela de banners
    await sql`
      CREATE TABLE IF NOT EXISTS banners (
        id TEXT PRIMARY KEY,
        image_url TEXT NOT NULL,
        link_url TEXT NOT NULL,
        title TEXT NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        order_position INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Criar tabela de notificações fixas
    await sql`
      CREATE TABLE IF NOT EXISTS fixed_notifications (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        start_date TIMESTAMP NOT NULL,
        end_date TIMESTAMP NOT NULL,
        button_text TEXT,
        button_url TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Criar tabela de sessões de usuário
    await sql`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        ip_address TEXT NOT NULL,
        user_agent TEXT NOT NULL,
        login_time TIMESTAMP DEFAULT NOW(),
        last_activity TIMESTAMP DEFAULT NOW(),
        is_active BOOLEAN DEFAULT TRUE,
        location TEXT,
        device TEXT,
        browser TEXT,
        logout_time TIMESTAMP,
        session_duration INTEGER
      )
    `;

    // Criar tabela de logs de segurança
    await sql`
      CREATE TABLE IF NOT EXISTS security_logs (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        action TEXT NOT NULL,
        ip_address TEXT NOT NULL,
        user_agent TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT NOW(),
        details TEXT NOT NULL,
        severity TEXT NOT NULL,
        admin_id TEXT
      )
    `;

    // Criar tabela de configurações
    await sql`
      CREATE TABLE IF NOT EXISTS settings (
        id TEXT PRIMARY KEY DEFAULT 'main',
        whatsapp_number TEXT,
        social_links JSONB DEFAULT '{}',
        customizations JSONB DEFAULT '{}',
        help_center JSONB DEFAULT '{}',
        security JSONB DEFAULT '{}',
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;

    console.log('✅ Tabelas criadas com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao criar tabelas:', error);
    throw error;
  }
}

// Função para inserir dados iniciais
async function insertInitialData() {
  try {
    // Verificar se já existem configurações
    const existingSettings = await sql`SELECT id FROM settings WHERE id = 'main'`;
    
    if (existingSettings.length === 0) {
      // Inserir configurações padrão
      await sql`
        INSERT INTO settings (id, whatsapp_number, social_links, customizations, help_center, security)
        VALUES (
          'main',
          '+5511999999999',
          '{"email": "contato@exemplo.com", "instagram": "@exemplo", "whatsapp": "+5511999999999"}',
          '{"primaryColor": "#e50914", "logoText": "MemberArea", "logoUrl": "", "faviconUrl": "", "secondaryColor": "#6b7280"}',
          '{"tutorialsUrl": "", "supportHours": "24/7 disponível"}',
          '{"maxConcurrentSessions": 3, "sessionTimeout": 480, "blockOnMultipleIPs": false, "allowedIPsPerUser": 5, "suspiciousActivityThreshold": 3, "enableGeoBlocking": false, "allowedCountries": ["BR"], "enableDeviceTracking": true, "requireReauthOnNewDevice": false}'
        )
      `;
      console.log('✅ Configurações padrão inseridas!');
    }

    // Verificar se já existe usuário admin
    const existingAdmin = await sql`SELECT id FROM users WHERE email = 'member@gmail.com'`;
    
    if (existingAdmin.length === 0) {
      // Inserir usuário admin padrão
      await sql`
        INSERT INTO users (id, email, password, name, is_admin, registration_date, unlocked_courses, unlocked_products)
        VALUES (
          'admin',
          'member@gmail.com',
          'member123#',
          'Administrator',
          true,
          NOW(),
          '{}',
          '{}'
        )
      `;
      console.log('✅ Usuário admin criado!');
    }

  } catch (error) {
    console.error('❌ Erro ao inserir dados iniciais:', error);
    throw error;
  }
}

export default db;