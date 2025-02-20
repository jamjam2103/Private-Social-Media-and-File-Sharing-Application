import { users, files, type User, type InsertUser, type Message, type FileShare } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import session from "express-session";
import createMemoryStore from "memorystore";
import crypto from 'crypto';

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  sessionStore: session.Store;

  // Chat methods
  getMessages(limit: number): Message[];
  addMessage(message: Message): void;

  // File sharing methods
  getFiles(): Promise<FileShare[]>;
  addFile(file: Omit<FileShare, 'id'>): Promise<FileShare>;
  getFileData(fileId: string): Promise<string>;
}

export class SqliteStorage implements IStorage {
  private messages: Message[];
  public sessionStore: session.Store;

  constructor() {
    this.messages = [];
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  getMessages(limit: number): Message[] {
    return this.messages.slice(-limit);
  }

  addMessage(message: Message): void {
    this.messages.push(message);
    if (this.messages.length > 100) {
      this.messages = this.messages.slice(-100);
    }
  }

  async getFiles(): Promise<FileShare[]> {
    return await db.select().from(files).orderBy(files.timestamp);
  }

  async addFile(file: Omit<FileShare, 'id'>): Promise<FileShare> {
    const id = crypto.randomUUID();
    const [newFile] = await db
      .insert(files)
      .values({ ...file, id })
      .returning();
    return newFile;
  }

  async getFileData(fileId: string): Promise<string> {
    const [file] = await db
      .select()
      .from(files)
      .where(eq(files.id, fileId));

    if (!file) {
      throw new Error('File not found');
    }
    return file.data;
  }
}

export const storage = new SqliteStorage();