import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table with custom authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).unique().notNull(),
  email: varchar("email", { length: 100 }).unique().notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 50 }),
  lastName: varchar("last_name", { length: 50 }),
  role: varchar("role", { length: 20 }).default("user").notNull(), // user, admin
  isActive: boolean("is_active").default(true).notNull(),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const whatsappConnections = pgTable("whatsapp_connections", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  phoneNumber: text("phone_number"),
  qrCode: text("qr_code"),
  isConnected: boolean("is_connected").default(false),
  lastConnected: timestamp("last_connected"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  priority: text("priority").notNull().default("media"), // alta, media, baixa
  status: text("status").notNull().default("pendente"), // pendente, em-andamento, concluida
  client: text("client"),
  deadline: text("deadline"),
  completed: boolean("completed").default(false),
  fromWhatsapp: boolean("from_whatsapp").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const whatsappMessages = pgTable("whatsapp_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  contact: text("contact").notNull(),
  content: text("content").notNull(),
  time: text("time").notNull(),
  converted: boolean("converted").default(false),
  priority: text("priority"), // alta, media, baixa
  createdAt: timestamp("created_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // info, success, warning, error
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastLogin: true,
});

export const loginSchema = z.object({
  username: z.string().min(3, "Nome de usuário deve ter pelo menos 3 caracteres"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

export const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
});

export const insertWhatsappMessageSchema = createInsertSchema(whatsappMessages).omit({
  id: true,
  createdAt: true,
});

export const insertWhatsappConnectionSchema = createInsertSchema(whatsappConnections).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertWhatsappMessage = z.infer<typeof insertWhatsappMessageSchema>;
export type WhatsappMessage = typeof whatsappMessages.$inferSelect;
export type InsertWhatsappConnection = z.infer<typeof insertWhatsappConnectionSchema>;
export type WhatsappConnection = typeof whatsappConnections.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  tasks: many(tasks),
  whatsappMessages: many(whatsappMessages),
  whatsappConnections: many(whatsappConnections),
  notifications: many(notifications),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  user: one(users, {
    fields: [tasks.userId],
    references: [users.id],
  }),
}));

export const whatsappMessagesRelations = relations(whatsappMessages, ({ one }) => ({
  user: one(users, {
    fields: [whatsappMessages.userId],
    references: [users.id],
  }),
}));

export const whatsappConnectionsRelations = relations(whatsappConnections, ({ one }) => ({
  user: one(users, {
    fields: [whatsappConnections.userId],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));
