import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { sendMessage, clearChatSession } from "./gemini";

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/chat/message", async (req, res) => {
    try {
      const { message } = req.body;
      const userId = "default-user";

      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "Mensagem inválida" });
      }

      const response = await sendMessage(userId, message);
      
      res.json({ response });
    } catch (error) {
      console.error("Error in chat:", error);
      res.status(500).json({ error: "Erro ao processar mensagem" });
    }
  });

  app.post("/api/chat/clear", async (req, res) => {
    try {
      const userId = "default-user";
      clearChatSession(userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error clearing chat:", error);
      res.status(500).json({ error: "Erro ao limpar conversa" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
