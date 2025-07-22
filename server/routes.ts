import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTaskSchema, insertWhatsappMessageSchema, insertWhatsappConnectionSchema, insertNotificationSchema, loginSchema, registerSchema } from "@shared/schema";
import { setupAuth, isAuthenticated, isAdmin } from "./auth";
import { whatsAppService } from "./whatsapp";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  setupAuth(app);

  // Task routes
  app.get("/api/tasks", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const tasks = await storage.getTasks(userId);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.get("/api/tasks/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const task = await storage.getTask(id);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch task" });
    }
  });

  app.post("/api/tasks", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const taskData = insertTaskSchema.parse({ ...req.body, userId });
      const task = await storage.createTask(taskData);
      
      // Create notification for new task
      await storage.createNotification({
        userId,
        title: "Nova Tarefa Criada",
        message: `Tarefa "${task.title}" foi criada com sucesso`,
        type: "success",
      });
      
      res.json(task);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid task data" });
    }
  });

  app.patch("/api/tasks/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const task = await storage.updateTask(id, updates);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  app.delete("/api/tasks/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteTask(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete task" });
    }
  });

  // Stats route
  app.get("/api/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const stats = await storage.getTaskStats(userId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // WhatsApp Messages routes
  app.get("/api/whatsapp/messages", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const messages = await storage.getWhatsappMessages(userId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch WhatsApp messages" });
    }
  });

  app.post("/api/whatsapp/messages", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const messageData = insertWhatsappMessageSchema.parse({ ...req.body, userId });
      const message = await storage.createWhatsappMessage(messageData);
      res.json(message);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid message data" });
    }
  });

  app.patch("/api/whatsapp/messages/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const message = await storage.updateWhatsappMessage(id, updates);
      
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }
      
      res.json(message);
    } catch (error) {
      res.status(500).json({ message: "Failed to update message" });
    }
  });

  // Convert WhatsApp message to task
  app.post("/api/whatsapp/messages/:id/convert", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const messageId = parseInt(req.params.id);
      const message = await storage.getWhatsappMessage(messageId);
      
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }
      
      // Create task from message
      const taskData = insertTaskSchema.parse({
        userId,
        title: `Task from ${message.contact}`,
        description: message.content,
        priority: message.priority || "media",
        status: "pendente",
        client: message.contact,
        fromWhatsapp: true,
      });
      
      const task = await storage.createTask(taskData);
      
      // Mark message as converted
      await storage.updateWhatsappMessage(messageId, { converted: true });
      
      // Create notification
      await storage.createNotification({
        userId,
        title: "Mensagem Convertida",
        message: `Mensagem de ${message.contact} foi convertida em tarefa`,
        type: "success",
      });
      
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: "Failed to convert message to task" });
    }
  });

  // WhatsApp Connection routes
  app.get("/api/whatsapp/connection", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const connection = await storage.getWhatsappConnection(userId);
      res.json(connection);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch WhatsApp connection" });
    }
  });

  app.post("/api/whatsapp/connection", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const connectionData = insertWhatsappConnectionSchema.parse({ ...req.body, userId });
      const connection = await storage.createWhatsappConnection(connectionData);
      res.json(connection);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Invalid connection data" });
    }
  });

  app.patch("/api/whatsapp/connection", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const updates = req.body;
      const connection = await storage.updateWhatsappConnection(userId, updates);
      
      if (!connection) {
        return res.status(404).json({ message: "Connection not found" });
      }
      
      res.json(connection);
    } catch (error) {
      res.status(500).json({ message: "Failed to update WhatsApp connection" });
    }
  });

  // Generate WhatsApp QR code and start connection
  app.post("/api/whatsapp/connect", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      const result = await whatsAppService.startConnection(userId);
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(500).json(result);
      }
    } catch (error) {
      console.error("Error connecting to WhatsApp:", error);
      res.status(500).json({ message: "Failed to connect to WhatsApp" });
    }
  });

  // Disconnect WhatsApp
  app.post("/api/whatsapp/disconnect", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      const result = await whatsAppService.disconnect(userId);
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(500).json(result);
      }
    } catch (error) {
      console.error("Error disconnecting WhatsApp:", error);
      res.status(500).json({ message: "Failed to disconnect WhatsApp" });
    }
  });

  // Get WhatsApp status
  app.get("/api/whatsapp/status", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const status = whatsAppService.getStatus(userId);
      res.json(status);
    } catch (error) {
      console.error("Error getting WhatsApp status:", error);
      res.status(500).json({ message: "Failed to get WhatsApp status" });
    }
  });

  // Send WhatsApp message
  app.post("/api/whatsapp/send", isAuthenticated, async (req: any, res) => {
    try {
      const { to, message } = req.body;
      
      if (!to || !message) {
        return res.status(400).json({ message: "Número e mensagem são obrigatórios" });
      }
      
      const result = await whatsAppService.sendMessage(to, message);
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(500).json(result);
      }
    } catch (error) {
      console.error("Error sending WhatsApp message:", error);
      res.status(500).json({ message: "Failed to send WhatsApp message" });
    }
  });



  // Notifications routes
  app.get("/api/notifications", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const notifications = await storage.getNotifications(userId);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.patch("/api/notifications/:id/read", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.markNotificationRead(id);
      
      if (!success) {
        return res.status(404).json({ message: "Notification not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Admin routes
  app.get("/api/admin/users", isAdmin, async (req: any, res) => {
    try {
      const users = await storage.getAllUsers();
      // Remove passwords from response
      const safeUsers = users.map(({ password, ...user }) => user);
      res.json(safeUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.patch("/api/admin/users/:id", isAdmin, async (req: any, res) => {
    try {
      const userId = parseInt(req.params.id);
      const updates = req.body;
      
      // Don't allow updating password through this endpoint
      delete updates.password;
      
      const user = await storage.updateUser(userId, updates);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}