import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import path from "path";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

const dirname = import.meta.dirname ?? __dirname;
// drizzle-kit passes this through fast-glob, which treats backslashes as
// escape characters — normalize to forward slashes so it resolves on Windows.
const schemaPath = path.join(dirname, "./src/schema/index.ts").split(path.sep).join("/");

export default defineConfig({
  schema: schemaPath,
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
