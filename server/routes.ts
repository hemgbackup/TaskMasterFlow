import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTaskSchema, insertWhatsappMessageSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Task routes
  app.get("/api/tasks", async (req, res) => {
    try {
      const tasks = await storage.getTasks();
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.get("/api/tasks/:id", async (req, res) => {
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

  app.post("/api/tasks", async (req, res) => {
    try {
      const taskData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(taskData);
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid task data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  app.patch("/api/tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = insertTaskSchema.partial().parse(req.body);
      const task = await storage.updateTask(id, updateData);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid task data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteTask(id);
      if (!deleted) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete task" });
    }
  });

  // Stats route
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getTaskStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // WhatsApp message routes
  app.get("/api/whatsapp/messages", async (req, res) => {
    try {
      const messages = await storage.getWhatsappMessages();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch WhatsApp messages" });
    }
  });

  app.post("/api/whatsapp/messages", async (req, res) => {
    try {
      const messageData = insertWhatsappMessageSchema.parse(req.body);
      const message = await storage.createWhatsappMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid message data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create WhatsApp message" });
    }
  });

  // Convert WhatsApp message to task
  app.post("/api/whatsapp/messages/:id/convert", async (req, res) => {
    try {
      const messageId = parseInt(req.params.id);
      const message = await storage.getWhatsappMessage(messageId);
      
      if (!message) {
        return res.status(404).json({ message: "WhatsApp message not found" });
      }

      // Create task from WhatsApp message
      const taskData = insertTaskSchema.parse({
        title: `WhatsApp: ${message.contact}`,
        description: message.content,
        priority: message.priority || "media",
        status: "pendente",
        client: message.contact,
        fromWhatsapp: true,
        completed: false
      });

      const task = await storage.createTask(taskData);
      
      // Mark message as converted
      await storage.updateWhatsappMessage(messageId, { converted: true });
      
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid conversion data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to convert message to task" });
    }
  });

  // WhatsApp webhook endpoint
  app.post("/api/whatsapp/webhook", async (req, res) => {
    try {
      const { contact, content, time } = req.body;
      
      if (!contact || !content) {
        return res.status(400).json({ message: "Missing required fields: contact, content" });
      }

      // Detect priority based on keywords
      let priority = "media";
      const urgentKeywords = ["urgente", "emergencia", "prioritario", "rapido"];
      if (urgentKeywords.some(keyword => content.toLowerCase().includes(keyword))) {
        priority = "alta";
      }

      const messageData = {
        contact,
        content,
        time: time || new Date().toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        priority,
        converted: false
      };

      const message = await storage.createWhatsappMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      res.status(500).json({ message: "Failed to process WhatsApp webhook" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
