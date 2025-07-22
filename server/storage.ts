import {
  users,
  tasks,
  whatsappMessages,
  whatsappConnections,
  notifications,
  type User,
  type UpsertUser,
  type Task,
  type InsertTask,
  type WhatsappMessage,
  type InsertWhatsappMessage,
  type WhatsappConnection,
  type InsertWhatsappConnection,
  type Notification,
  type InsertNotification,
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Task operations
  getTasks(userId: string): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  getTaskStats(userId: string): Promise<{
    totalTasks: number;
    inProgress: number;
    completed: number;
    whatsappTasks: number;
  }>;
  
  // WhatsApp messages
  getWhatsappMessages(userId: string): Promise<WhatsappMessage[]>;
  getWhatsappMessage(id: number): Promise<WhatsappMessage | undefined>;
  createWhatsappMessage(message: InsertWhatsappMessage): Promise<WhatsappMessage>;
  updateWhatsappMessage(id: number, message: Partial<InsertWhatsappMessage>): Promise<WhatsappMessage | undefined>;
  
  // WhatsApp connections
  getWhatsappConnection(userId: string): Promise<WhatsappConnection | undefined>;
  createWhatsappConnection(connection: InsertWhatsappConnection): Promise<WhatsappConnection>;
  updateWhatsappConnection(userId: string, connection: Partial<InsertWhatsappConnection>): Promise<WhatsappConnection | undefined>;
  
  // Notifications
  getNotifications(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationRead(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Task operations
  async getTasks(userId: string): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.userId, userId)).orderBy(desc(tasks.createdAt));
  }

  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }

  async createTask(task: InsertTask): Promise<Task> {
    const [newTask] = await db.insert(tasks).values(task).returning();
    return newTask;
  }

  async updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined> {
    const [updatedTask] = await db
      .update(tasks)
      .set(task)
      .where(eq(tasks.id, id))
      .returning();
    return updatedTask || undefined;
  }

  async deleteTask(id: number): Promise<boolean> {
    const result = await db.delete(tasks).where(eq(tasks.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getTaskStats(userId: string): Promise<{
    totalTasks: number;
    inProgress: number;
    completed: number;
    whatsappTasks: number;
  }> {
    const userTasks = await this.getTasks(userId);
    
    return {
      totalTasks: userTasks.length,
      inProgress: userTasks.filter(task => task.status === "em-andamento").length,
      completed: userTasks.filter(task => task.status === "concluida").length,
      whatsappTasks: userTasks.filter(task => task.fromWhatsapp).length,
    };
  }

  // WhatsApp messages
  async getWhatsappMessages(userId: string): Promise<WhatsappMessage[]> {
    return await db.select().from(whatsappMessages).where(eq(whatsappMessages.userId, userId)).orderBy(desc(whatsappMessages.createdAt));
  }

  async getWhatsappMessage(id: number): Promise<WhatsappMessage | undefined> {
    const [message] = await db.select().from(whatsappMessages).where(eq(whatsappMessages.id, id));
    return message;
  }

  async createWhatsappMessage(message: InsertWhatsappMessage): Promise<WhatsappMessage> {
    const [newMessage] = await db.insert(whatsappMessages).values(message).returning();
    return newMessage;
  }

  async updateWhatsappMessage(id: number, message: Partial<InsertWhatsappMessage>): Promise<WhatsappMessage | undefined> {
    const [updatedMessage] = await db
      .update(whatsappMessages)
      .set(message)
      .where(eq(whatsappMessages.id, id))
      .returning();
    return updatedMessage || undefined;
  }

  // WhatsApp connections
  async getWhatsappConnection(userId: string): Promise<WhatsappConnection | undefined> {
    const [connection] = await db.select().from(whatsappConnections).where(eq(whatsappConnections.userId, userId));
    return connection;
  }

  async createWhatsappConnection(connection: InsertWhatsappConnection): Promise<WhatsappConnection> {
    const [newConnection] = await db.insert(whatsappConnections).values(connection).returning();
    return newConnection;
  }

  async updateWhatsappConnection(userId: string, connection: Partial<InsertWhatsappConnection>): Promise<WhatsappConnection | undefined> {
    const [updatedConnection] = await db
      .update(whatsappConnections)
      .set(connection)
      .where(eq(whatsappConnections.userId, userId))
      .returning();
    return updatedConnection || undefined;
  }

  // Notifications
  async getNotifications(userId: string): Promise<Notification[]> {
    return await db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db.insert(notifications).values(notification).returning();
    return newNotification;
  }

  async markNotificationRead(id: number): Promise<boolean> {
    const result = await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, id));
    return (result.rowCount || 0) > 0;
  }
}

// In-memory storage for development/migration compatibility
export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private tasks: Map<number, Task> = new Map();
  private whatsappMessages: Map<number, WhatsappMessage> = new Map();
  private whatsappConnections: Map<string, WhatsappConnection> = new Map();
  private notifications: Map<number, Notification> = new Map();
  private nextTaskId = 1;
  private nextMessageId = 1;
  private nextNotificationId = 1;
  private nextConnectionId = 1;

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const user: User = {
      ...userData,
      email: userData.email || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
      createdAt: this.users.get(userData.id)?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    this.users.set(userData.id, user);
    return user;
  }

  // Task operations
  async getTasks(userId: string): Promise<Task[]> {
    return Array.from(this.tasks.values())
      .filter(task => task.userId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(taskData: InsertTask): Promise<Task> {
    const task: Task = {
      ...taskData,
      id: this.nextTaskId++,
      priority: taskData.priority || "media",
      status: taskData.status || "pendente",
      description: taskData.description || null,
      client: taskData.client || null,
      deadline: taskData.deadline || null,
      completed: taskData.completed || false,
      fromWhatsapp: taskData.fromWhatsapp || false,
      createdAt: new Date(),
    };
    this.tasks.set(task.id, task);
    return task;
  }

  async updateTask(id: number, taskData: Partial<InsertTask>): Promise<Task | undefined> {
    const existingTask = this.tasks.get(id);
    if (!existingTask) return undefined;
    
    const updatedTask: Task = { ...existingTask, ...taskData };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }

  async getTaskStats(userId: string): Promise<{
    totalTasks: number;
    inProgress: number;
    completed: number;
    whatsappTasks: number;
  }> {
    const userTasks = await this.getTasks(userId);
    
    return {
      totalTasks: userTasks.length,
      inProgress: userTasks.filter(task => task.status === "em-andamento").length,
      completed: userTasks.filter(task => task.status === "concluida").length,
      whatsappTasks: userTasks.filter(task => task.fromWhatsapp).length,
    };
  }

  // WhatsApp messages
  async getWhatsappMessages(userId: string): Promise<WhatsappMessage[]> {
    return Array.from(this.whatsappMessages.values())
      .filter(message => message.userId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getWhatsappMessage(id: number): Promise<WhatsappMessage | undefined> {
    return this.whatsappMessages.get(id);
  }

  async createWhatsappMessage(messageData: InsertWhatsappMessage): Promise<WhatsappMessage> {
    const message: WhatsappMessage = {
      ...messageData,
      id: this.nextMessageId++,
      priority: messageData.priority || null,
      converted: messageData.converted || false,
      createdAt: new Date(),
    };
    this.whatsappMessages.set(message.id, message);
    return message;
  }

  async updateWhatsappMessage(id: number, messageData: Partial<InsertWhatsappMessage>): Promise<WhatsappMessage | undefined> {
    const existingMessage = this.whatsappMessages.get(id);
    if (!existingMessage) return undefined;
    
    const updatedMessage: WhatsappMessage = { ...existingMessage, ...messageData };
    this.whatsappMessages.set(id, updatedMessage);
    return updatedMessage;
  }

  // WhatsApp connections
  async getWhatsappConnection(userId: string): Promise<WhatsappConnection | undefined> {
    return this.whatsappConnections.get(userId);
  }

  async createWhatsappConnection(connectionData: InsertWhatsappConnection): Promise<WhatsappConnection> {
    const connection: WhatsappConnection = {
      ...connectionData,
      id: this.nextConnectionId++,
      phoneNumber: connectionData.phoneNumber || null,
      qrCode: connectionData.qrCode || null,
      isConnected: connectionData.isConnected || false,
      lastConnected: connectionData.lastConnected || null,
      createdAt: new Date(),
    };
    this.whatsappConnections.set(connectionData.userId, connection);
    return connection;
  }

  async updateWhatsappConnection(userId: string, connectionData: Partial<InsertWhatsappConnection>): Promise<WhatsappConnection | undefined> {
    const existingConnection = this.whatsappConnections.get(userId);
    if (!existingConnection) return undefined;
    
    const updatedConnection: WhatsappConnection = { ...existingConnection, ...connectionData };
    this.whatsappConnections.set(userId, updatedConnection);
    return updatedConnection;
  }

  // Notifications
  async getNotifications(userId: string): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async createNotification(notificationData: InsertNotification): Promise<Notification> {
    const notification: Notification = {
      ...notificationData,
      id: this.nextNotificationId++,
      read: notificationData.read || false,
      createdAt: new Date(),
    };
    this.notifications.set(notification.id, notification);
    return notification;
  }

  async markNotificationRead(id: number): Promise<boolean> {
    const notification = this.notifications.get(id);
    if (!notification) return false;
    
    notification.read = true;
    this.notifications.set(id, notification);
    return true;
  }
}

// Use MemStorage if database is not available, DatabaseStorage otherwise
import { db } from "./db";
export const storage = db ? new DatabaseStorage() : new MemStorage();