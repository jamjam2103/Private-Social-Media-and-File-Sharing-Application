import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { Message, FileShare } from "@shared/schema";
import * as crypto from 'crypto';
const validTokens = new Map<string, number>();
const TOKEN_EXPIRY = 30 * 60 * 1000;
export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  // Track connected clients
  const authMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    next();
  };
  app.post("/api/generate-token", (req, res) => {
    const token = crypto.randomBytes(32).toString('hex');
    validTokens.set(token, Date.now());
    res.json({ token });
  });

  // Verify access token
  app.post("/api/verify-token", (req, res) => {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    const timestamp = validTokens.get(token);

    if (!timestamp) {
      return res.status(401).json({ message: "Invalid token" });
    }

    if (Date.now() - timestamp > TOKEN_EXPIRY) {
      validTokens.delete(token); // Clean up expired token
      return res.status(401).json({ message: "Token expired" });
    }

    res.json({ valid: true });
  });
  // Add file routes with auth
  app.post("/api/files", authMiddleware, async (req, res) => {
    try {
      const { name, data } = req.body;
      const username = req.user!.username;
      const file = await storage.addFile({
        name,
        data,
        username,
        timestamp: Date.now(),
      });
      res.json(file);
    } catch (error) {
      res.status(500).json({ message: "Failed to upload file" });
    }
  });

  const clients = new Set<WebSocket>();

  wss.on("connection", (ws) => {
    clients.add(ws);
    console.log(`WebSocket client connected. Total connections: ${clients.size}`);

    // Send last 50 messages on connect
    const messages = storage.getMessages(50);
    ws.send(JSON.stringify({ type: "history", messages }));

    ws.on("message", (data) => {
      try {
        const message = JSON.parse(data.toString());

        if (message.type === "chat") {
          const chatMessage: Message = {
            id: crypto.randomUUID(),
            username: message.username,
            content: message.content,
            encrypted: message.encrypted,
            timestamp: Date.now(),
          };

          storage.addMessage(chatMessage);

          // Broadcast to all connected clients
          clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({ type: "message", message: chatMessage }));
            }
          });
        }
      } catch (error) {
        console.error("Failed to parse message:", error);
        ws.send(JSON.stringify({ 
          type: "error", 
          message: "Failed to process message" 
        }));
      }
    });

    ws.on("close", () => {
      clients.delete(ws);
      console.log(`WebSocket client disconnected. Remaining connections: ${clients.size}`);
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
      clients.delete(ws);
    });
  });

  // File sharing endpoints
  app.get("/api/files", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const files = storage.getFiles();
    res.json(files);
  });

  app.get("/api/files/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const fileData = await storage.getFileData(req.params.id);
      res.json({ data: fileData });
    } catch (error) {
      res.status(404).json({ message: "File not found" });
    }
  });

  app.post("/api/files", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const file: Omit<FileShare, 'data'> & { data: string } = {
        id: crypto.randomUUID(),
        name: req.body.name,
        data: req.body.data,
        username: req.user!.username,
        timestamp: Date.now(),
      };

      const savedFile = await storage.addFile(file);
      res.status(201).json(savedFile);
    } catch (error) {
      console.error("File upload error:", error);
      res.status(500).json({ 
        message: "Failed to upload file to IPFS",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  return httpServer;
}