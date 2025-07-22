import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import createMemoryStore from "memorystore";
import { storage } from "./storage";
import { User } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends User {}
  }
}

const scryptAsync = promisify(scrypt);
const MemoryStore = createMemoryStore(session);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "taskflow-secret-key-development",
    resave: false,
    saveUninitialized: false,
    store: new MemoryStore({
      checkPeriod: 86400000,
    }),
    cookie: {
      secure: false, // Para desenvolvimento, em produção deve ser true com HTTPS
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 dias
    },
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      {
        usernameField: "username",
        passwordField: "password",
      },
      async (username, password, done) => {
        try {
          const user = await storage.getUserByUsername(username);
          if (!user) {
            return done(null, false, { message: "Usuário não encontrado" });
          }

          if (!user.isActive) {
            return done(null, false, { message: "Conta inativa" });
          }

          const isValidPassword = await comparePasswords(password, user.password);
          if (!isValidPassword) {
            return done(null, false, { message: "Senha incorreta" });
          }

          // Atualizar último login
          await storage.updateLastLogin(user.id);

          return done(null, user);
        } catch (error) {
          console.error("Erro na autenticação:", error);
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  // Rota de registro
  app.post("/api/register", async (req, res, next) => {
    try {
      const { username, email, password, firstName, lastName } = req.body;

      // Verificar se usuário já existe
      const existingUserByUsername = await storage.getUserByUsername(username);
      if (existingUserByUsername) {
        return res.status(400).json({ message: "Nome de usuário já existe" });
      }

      const existingUserByEmail = await storage.getUserByEmail(email);
      if (existingUserByEmail) {
        return res.status(400).json({ message: "Email já está em uso" });
      }

      // Hash da senha
      const hashedPassword = await hashPassword(password);

      // Criar usuário
      const user = await storage.createUser({
        username,
        email,
        password: hashedPassword,
        firstName: firstName || null,
        lastName: lastName || null,
        role: "user",
        isActive: true,
      });

      // Login automático após registro
      req.login(user, (err) => {
        if (err) return next(err);
        
        // Remover senha da resposta
        const { password: _, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      console.error("Erro no registro:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Rota de login
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: User, info: any) => {
      if (err) {
        console.error("Erro no login:", err);
        return res.status(500).json({ message: "Erro interno do servidor" });
      }

      if (!user) {
        return res.status(401).json({ message: info?.message || "Credenciais inválidas" });
      }

      req.login(user, (loginErr) => {
        if (loginErr) {
          console.error("Erro ao fazer login:", loginErr);
          return res.status(500).json({ message: "Erro interno do servidor" });
        }

        // Remover senha da resposta
        const { password: _, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
      });
    })(req, res, next);
  });

  // Rota de logout
  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) {
        console.error("Erro no logout:", err);
        return next(err);
      }
      res.sendStatus(200);
    });
  });

  // Rota para obter dados do usuário atual
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }

    // Remover senha da resposta
    const { password: _, ...userWithoutPassword } = req.user!;
    res.json(userWithoutPassword);
  });
}

// Middleware para verificar se usuário está autenticado
export function isAuthenticated(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Não autorizado" });
}

// Middleware para verificar se usuário é admin
export function isAdmin(req: any, res: any, next: any) {
  if (req.isAuthenticated() && req.user?.role === "admin") {
    return next();
  }
  res.status(403).json({ message: "Acesso negado" });
}

export { hashPassword, comparePasswords };