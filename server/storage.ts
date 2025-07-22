import { users, tasks, whatsappMessages, type User, type InsertUser, type Task, type InsertTask, type WhatsappMessage, type InsertWhatsappMessage } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Tasks
  getTasks(): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  getTaskStats(): Promise<{
    totalTasks: number;
    inProgress: number;
    completed: number;
    whatsappTasks: number;
  }>;
  
  // WhatsApp Messages
  getWhatsappMessages(): Promise<WhatsappMessage[]>;
  getWhatsappMessage(id: number): Promise<WhatsappMessage | undefined>;
  createWhatsappMessage(message: InsertWhatsappMessage): Promise<WhatsappMessage>;
  updateWhatsappMessage(id: number, message: Partial<InsertWhatsappMessage>): Promise<WhatsappMessage | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tasks: Map<number, Task>;
  private whatsappMessages: Map<number, WhatsappMessage>;
  private currentUserId: number;
  private currentTaskId: number;
  private currentMessageId: number;

  constructor() {
    this.users = new Map();
    this.tasks = new Map();
    this.whatsappMessages = new Map();
    this.currentUserId = 1;
    this.currentTaskId = 1;
    this.currentMessageId = 1;
    
    // Add some initial WhatsApp messages
    this.createWhatsappMessage({
      contact: "Maria Santos",
      content: "Preciso urgente de uma correção no sistema de pagamentos",
      time: "14:30",
      converted: false,
      priority: "alta"
    });
    
    this.createWhatsappMessage({
      contact: "João Oliveira", 
      content: "Quando vai ficar pronto o relatório mensal?",
      time: "13:45",
      converted: false,
      priority: "media"
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.currentTaskId++;
    const task: Task = { 
      ...insertTask,
      client: insertTask.client || null,
      description: insertTask.description || null,
      deadline: insertTask.deadline || null,
      priority: insertTask.priority || "media",
      status: insertTask.status || "pendente",
      completed: insertTask.completed || false,
      fromWhatsapp: insertTask.fromWhatsapp || false,
      id, 
      createdAt: new Date()
    };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: number, taskUpdate: Partial<InsertTask>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    const updatedTask = { ...task, ...taskUpdate };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }

  async getTaskStats(): Promise<{
    totalTasks: number;
    inProgress: number;
    completed: number;
    whatsappTasks: number;
  }> {
    const tasks = Array.from(this.tasks.values());
    return {
      totalTasks: tasks.length,
      inProgress: tasks.filter(t => t.status === "em-andamento").length,
      completed: tasks.filter(t => t.completed).length,
      whatsappTasks: tasks.filter(t => t.fromWhatsapp).length
    };
  }

  async getWhatsappMessages(): Promise<WhatsappMessage[]> {
    return Array.from(this.whatsappMessages.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getWhatsappMessage(id: number): Promise<WhatsappMessage | undefined> {
    return this.whatsappMessages.get(id);
  }

  async createWhatsappMessage(insertMessage: InsertWhatsappMessage): Promise<WhatsappMessage> {
    const id = this.currentMessageId++;
    const message: WhatsappMessage = { 
      ...insertMessage,
      priority: insertMessage.priority || null,
      converted: insertMessage.converted || false,
      id, 
      createdAt: new Date()
    };
    this.whatsappMessages.set(id, message);
    return message;
  }

  async updateWhatsappMessage(id: number, messageUpdate: Partial<InsertWhatsappMessage>): Promise<WhatsappMessage | undefined> {
    const message = this.whatsappMessages.get(id);
    if (!message) return undefined;
    
    const updatedMessage = { ...message, ...messageUpdate };
    this.whatsappMessages.set(id, updatedMessage);
    return updatedMessage;
  }
}

export const storage = new MemStorage();
