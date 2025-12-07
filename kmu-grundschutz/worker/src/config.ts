import "dotenv/config"

export const config = {
  databaseUrl: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/kmu_grundschutz?schema=public",
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
  openaiApiKey: process.env.OPENAI_API_KEY || "",
  hibpApiKey: process.env.HIBP_API_KEY || "",
}

