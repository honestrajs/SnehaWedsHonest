import { Router, type IRouter, type Request, type Response } from "express";
import { desc, eq } from "drizzle-orm";
import { CreateSavingsEntryBody, LoginBody } from "@workspace/api-zod";
import { db, savingsEntriesTable, weddingSettingsTable } from "@workspace/db";
import { randomBytes } from "node:crypto";

type Member = {
  username: "Honest" | "Sneha";
  name: "Honest Raj S" | "Sneha Christy C";
  role: "groom" | "bride";
};

const members: Record<string, { password: string; member: Member }> = {
  Honest: {
    password: "1407",
    member: { username: "Honest", name: "Honest Raj S", role: "groom" },
  },
  Sneha: {
    password: "1407",
    member: { username: "Sneha", name: "Sneha Christy C", role: "bride" },
  },
};

const sessions = new Map<string, Member>();
const TARGET_CENTS = 100000000;
const WEDDING_DATE = new Date("2027-07-14T00:00:00.000Z");

export function getMember(req: Request): Member | null {
  const token = req.cookies?.wedding_session as string | undefined;
  return token ? sessions.get(token) ?? null : null;
}

function toEntryResponse(entry: typeof savingsEntriesTable.$inferSelect) {
  return {
    id: entry.id,
    amount: entry.amountCents / 100,
    occurredAt: entry.occurredAt,
    summary: entry.summary,
    category: entry.category,
    addedBy: "Both",
    addedByName: "Both of us",
    createdAt: entry.createdAt,
  };
}

function requireMember(req: Request, res: Response): Member | null {
  const member = getMember(req);
  if (!member) {
    res.status(401).json({ error: "Please sign in to view your wedding fund." });
    return null;
  }
  return member;
}

const router: IRouter = Router();

router.post("/auth/login", (req, res) => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Enter your name and password." });
    return;
  }

  const account = members[parsed.data.username];
  if (!account || account.password !== parsed.data.password) {
    res.status(401).json({ error: "That name and password do not match." });
    return;
  }

  const token = randomBytes(32).toString("hex");
  sessions.set(token, account.member);
  res.cookie("wedding_session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 60 * 24 * 30,
  });
  res.json(account.member);
});

router.get("/auth/me", (req, res) => {
  const member = getMember(req);
  if (!member) {
    res.status(401).json({ error: "Not signed in." });
    return;
  }
  res.json(member);
});

router.post("/auth/logout", (req, res) => {
  const token = req.cookies?.wedding_session as string | undefined;
  if (token) sessions.delete(token);
  res.clearCookie("wedding_session");
  res.status(204).send();
});

router.get("/savings/entries", async (req, res) => {
  if (!requireMember(req, res)) return;
  const entries = await db
    .select()
    .from(savingsEntriesTable)
    .orderBy(desc(savingsEntriesTable.occurredAt), desc(savingsEntriesTable.createdAt));
  res.json(entries.map(toEntryResponse));
});

router.post("/savings/entries", async (req, res) => {
  const member = requireMember(req, res);
  if (!member) return;

  const parsed = CreateSavingsEntryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Add an amount, date, category, and a short memory." });
    return;
  }

  const amountCents = Math.round(parsed.data.amount * 100);
  const [entry] = await db
    .insert(savingsEntriesTable)
    .values({
      amountCents,
      occurredAt: parsed.data.occurredAt,
      summary: parsed.data.summary.trim(),
      category: parsed.data.category,
      addedBy: "Both",
      addedByName: "Both of us",
    })
    .returning();
  res.status(201).json(toEntryResponse(entry));
});

router.get("/savings/summary", async (req, res) => {
  if (!requireMember(req, res)) return;

  const entries = await db.select().from(savingsEntriesTable);
  const totalSavedCents = entries.reduce((total, entry) => total + entry.amountCents, 0);
  const remainingCents = Math.max(TARGET_CENTS - totalSavedCents, 0);
  const percentage = Math.min((totalSavedCents / TARGET_CENTS) * 100, 100);
  const daysUntilWedding = Math.max(
    Math.ceil((WEDDING_DATE.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
    0,
  );
  const monthsRemaining = daysUntilWedding > 0 ? Math.max(daysUntilWedding / 30.44, 1) : 0;

  res.json({
    target: TARGET_CENTS / 100,
    totalSaved: totalSavedCents / 100,
    percentage,
    remaining: remainingCents / 100,
    daysUntilWedding,
    monthlyNeeded: monthsRemaining ? remainingCents / 100 / monthsRemaining : 0,
  });
});

router.get("/savings/photo", async (req, res) => {
  if (!requireMember(req, res)) return;
  const [settings] = await db
    .select()
    .from(weddingSettingsTable)
    .where(eq(weddingSettingsTable.id, 1));
  const objectPath = settings?.photoPath ?? null;
  res.json({
    objectPath,
    url: objectPath ? `/api/storage${objectPath}` : null,
  });
});

router.put("/savings/photo", async (req, res) => {
  if (!requireMember(req, res)) return;
  const objectPath = typeof req.body?.objectPath === "string" ? req.body.objectPath.trim() : "";
  if (!objectPath.startsWith("/objects/") || objectPath.length > 500) {
    res.status(400).json({ error: "That photo could not be saved." });
    return;
  }

  const [settings] = await db
    .insert(weddingSettingsTable)
    .values({ id: 1, photoPath: objectPath })
    .onConflictDoUpdate({
      target: weddingSettingsTable.id,
      set: { photoPath: objectPath, updatedAt: new Date() },
    })
    .returning();
  res.json({ objectPath: settings.photoPath, url: `/api/storage${settings.photoPath}` });
});

export default router;