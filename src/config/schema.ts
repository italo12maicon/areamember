import { pgTable, text, boolean, integer, timestamp, jsonb } from 'drizzle-orm/pg-core';

// Tabela de usuários
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  name: text('name').notNull(),
  isAdmin: boolean('is_admin').default(false),
  registrationDate: timestamp('registration_date').defaultNow(),
  unlockedCourses: text('unlocked_courses').array().default([]),
  unlockedProducts: text('unlocked_products').array().default([]),
  isBlocked: boolean('is_blocked').default(false),
  blockedReason: text('blocked_reason'),
  blockedAt: timestamp('blocked_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Tabela de cursos
export const courses = pgTable('courses', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  imageUrl: text('image_url'),
  isBlocked: boolean('is_blocked').default(false),
  unlockAfterDays: integer('unlock_after_days'),
  manualUnlockOnly: boolean('manual_unlock_only').default(false),
  unblockLink: text('unblock_link'),
  scheduledUnlockDate: timestamp('scheduled_unlock_date'),
  lessons: jsonb('lessons').default([]),
  topics: jsonb('topics').default([]),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Tabela de produtos
export const products = pgTable('products', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  imageUrl: text('image_url'),
  isBlocked: boolean('is_blocked').default(false),
  unlockAfterDays: integer('unlock_after_days'),
  manualUnlockOnly: boolean('manual_unlock_only').default(false),
  unblockLink: text('unblock_link'),
  scheduledUnlockDate: timestamp('scheduled_unlock_date'),
  lessons: jsonb('lessons').default([]),
  topics: jsonb('topics').default([]),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Tabela de notificações
export const notifications = pgTable('notifications', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: text('type').notNull(),
  read: boolean('read').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// Tabela de histórico de visualização
export const watchHistory = pgTable('watch_history', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  courseId: text('course_id'),
  productId: text('product_id'),
  topicId: text('topic_id'),
  lastLessonId: text('last_lesson_id'),
  lastWatchedAt: timestamp('last_watched_at').defaultNow(),
  firstWatchedAt: timestamp('first_watched_at').defaultNow(),
  watchTimeMinutes: integer('watch_time_minutes').default(0),
  completedLessons: text('completed_lessons').array().default([]),
});

// Tabela de favoritos
export const favorites = pgTable('favorites', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  courseId: text('course_id'),
  productId: text('product_id'),
  topicId: text('topic_id'),
  addedAt: timestamp('added_at').defaultNow(),
});

// Tabela de recursos
export const resources = pgTable('resources', {
  id: text('id').primaryKey(),
  courseId: text('course_id'),
  productId: text('product_id'),
  topicId: text('topic_id'),
  title: text('title').notNull(),
  description: text('description'),
  type: text('type').notNull(),
  url: text('url').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Tabela de tickets de suporte
export const supportTickets = pgTable('support_tickets', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  subject: text('subject').notNull(),
  category: text('category').notNull(),
  priority: text('priority').notNull(),
  message: text('message').notNull(),
  status: text('status').default('open'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Tabela de banners
export const banners = pgTable('banners', {
  id: text('id').primaryKey(),
  imageUrl: text('image_url').notNull(),
  linkUrl: text('link_url').notNull(),
  title: text('title').notNull(),
  isActive: boolean('is_active').default(true),
  order: integer('order_position').default(1),
  createdAt: timestamp('created_at').defaultNow(),
});

// Tabela de notificações fixas
export const fixedNotifications = pgTable('fixed_notifications', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: text('type').notNull(),
  isActive: boolean('is_active').default(true),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  buttonText: text('button_text'),
  buttonUrl: text('button_url'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Tabela de sessões de usuário
export const userSessions = pgTable('user_sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  ipAddress: text('ip_address').notNull(),
  userAgent: text('user_agent').notNull(),
  loginTime: timestamp('login_time').defaultNow(),
  lastActivity: timestamp('last_activity').defaultNow(),
  isActive: boolean('is_active').default(true),
  location: text('location'),
  device: text('device'),
  browser: text('browser'),
  logoutTime: timestamp('logout_time'),
  sessionDuration: integer('session_duration'),
});

// Tabela de logs de segurança
export const securityLogs = pgTable('security_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  action: text('action').notNull(),
  ipAddress: text('ip_address').notNull(),
  userAgent: text('user_agent').notNull(),
  timestamp: timestamp('timestamp').defaultNow(),
  details: text('details').notNull(),
  severity: text('severity').notNull(),
  adminId: text('admin_id'),
});

// Tabela de configurações
export const settings = pgTable('settings', {
  id: text('id').primaryKey().default('main'),
  whatsappNumber: text('whatsapp_number'),
  socialLinks: jsonb('social_links').default({}),
  customizations: jsonb('customizations').default({}),
  helpCenter: jsonb('help_center').default({}),
  security: jsonb('security').default({}),
  updatedAt: timestamp('updated_at').defaultNow(),
});