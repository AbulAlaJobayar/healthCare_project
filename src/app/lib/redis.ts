import { createClient, RedisClientType } from "redis";
import { envVars } from "../config/env";

class RedisServices {
  private client: RedisClientType | null = null;
  private isConnected: boolean = false;
  async connect(): Promise<void> {
    try {
      const redisUrl = envVars.REDIS.REDIS_URL;
      this.client = createClient({ url: redisUrl });
      // handle connection events
      this.client.on("error", (error) => {
        console.error("Redis client Error", error);
        this.isConnected = false;
      });
      this.client.on("connect", () => {
        console.log("redis client connected");
        this.isConnected = true;
      });
      this.client.on("ready", () => {
        console.log("redis client ready");
        this.isConnected = true;
      });
      this.client.on("end", () => {
        console.log("redis client end");
        this.isConnected = false;
      });
      this.client.on("reconnecting", () => {
        console.log("redis client reconnecting");
      });
      await this.client.connect();
    } catch (error) {
      console.log(error);
      this.isConnected = false;
    }
  }
  private ensureConnection(): RedisClientType {
    if (!this.client) {
      throw new Error("Redis client not initialized. call connect First");
    }
    if (!this.isConnected) {
      throw new Error("Redis client not connected.");
    }
    return this.client;
  }

  async get(key: string): Promise<string | null> {
    try {
      const client = this.ensureConnection();
      return await client.get(key);
    } catch (error) {
      console.log("Redis get error", error);
      return null;
    }
  }

  async set(key: string, value: string, ttlInSeconds: number): Promise<void> {
    try {
      const client = this.ensureConnection();
      const stringValue =
        typeof value === "string" ? value : JSON.stringify(value);

      await client.set(key, stringValue, { EX: ttlInSeconds });
    } catch (error) {
      console.error("Redis set Error", error);
    }
  }
  async update(key: string, value: string, ttlInSeconds: number) {
    await this.set(key, value, ttlInSeconds);
  }
  async delete(key: string): Promise<void> {
    try {
      const client = this.ensureConnection();
      await client.del(key);
    } catch (error) {
      console.log(" Redis delete Error", error);
    }
  }
  async isAvailable(): Promise<boolean> {
    try {
      const client = this.ensureConnection();
      await client.ping();
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }
  async disConnect(): Promise<void> {
    if (this.client && this.isConnected) {
      await this.client.quit();
      this.isConnected = false;
    }
  }
}

export const redisService = new RedisServices();
