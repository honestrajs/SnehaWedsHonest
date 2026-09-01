import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from './supabase';

export const TARGET = 1_000_000; // INR 10,00,000
export const WEDDING_DATE_MS = new Date('2027-07-14T00:00:00.000Z').getTime();

export const SAVINGS_CATEGORIES = ['salary', 'gift', 'side-income', 'other'] as const;
export type SavingsCategory = (typeof SAVINGS_CATEGORIES)[number];

export type Member = {
  username: 'Honest' | 'Sneha';
  name: 'Honest Raj S' | 'Sneha Christy C';
  role: 'groom' | 'bride';
};

const MEMBERS: Record<string, { password: string; member: Member }> = {
  Honest: {
    password: '1407',
    member: { username: 'Honest', name: 'Honest Raj S', role: 'groom' },
  },
  Sneha: {
    password: '1407',
    member: { username: 'Sneha', name: 'Sneha Christy C', role: 'bride' },
  },
};

const SESSION_KEY = 'wedding-fund-member';

export function getStoredMember(): Member | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Member) : null;
  } catch {
    return null;
  }
}

export function login(username: string, password: string): Member {
  const account = MEMBERS[username.trim()];
  if (!account || account.password !== password) {
    throw new Error('That name and password do not match.');
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(account.member));
  return account.member;
}

export function logout(): void {
  localStorage.removeItem(SESSION_KEY);
}

export type SavingsEntry = {
  id: number;
  amount: number;
  occurredAt: string;
  summary: string;
  category: string;
  createdAt: string;
};

export type SavingsEntryInput = {
  amount: number;
  occurredAt: string;
  summary: string;
  category: SavingsCategory;
};

export type SavingsSummary = {
  target: number;
  totalSaved: number;
  remaining: number;
  percentage: number;
  daysUntilWedding: number;
  monthlyNeeded: number;
};

const ENTRIES_QUERY_KEY = ['savings-entries'];

export function useSavingsEntries() {
  return useQuery({
    queryKey: ENTRIES_QUERY_KEY,
    queryFn: async (): Promise<SavingsEntry[]> => {
      const { data, error } = await supabase
        .from('savings_entries')
        .select('id, amount_cents, occurred_at, summary, category, created_at')
        .order('occurred_at', { ascending: false })
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []).map((row) => ({
        id: row.id,
        amount: row.amount_cents / 100,
        occurredAt: row.occurred_at,
        summary: row.summary,
        category: row.category,
        createdAt: row.created_at,
      }));
    },
  });
}

export function useCreateSavingsEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: SavingsEntryInput) => {
      const { error } = await supabase.from('savings_entries').insert({
        amount_cents: Math.round(input.amount * 100),
        occurred_at: new Date(input.occurredAt).toISOString(),
        summary: input.summary,
        category: input.category,
        // Deliberately not attributed to whoever is logged in — both of you
        // add to one shared story, not two separate ledgers.
        added_by: 'Both',
        added_by_name: 'Both of us',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ENTRIES_QUERY_KEY });
    },
  });
}

export function useUpdateSavingsEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: SavingsEntryInput & { id: number }) => {
      const { error } = await supabase
        .from('savings_entries')
        .update({
          amount_cents: Math.round(input.amount * 100),
          occurred_at: new Date(input.occurredAt).toISOString(),
          summary: input.summary,
          category: input.category,
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ENTRIES_QUERY_KEY });
    },
  });
}

export function useDeleteSavingsEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from('savings_entries').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ENTRIES_QUERY_KEY });
    },
  });
}

export function summarize(entries: SavingsEntry[]): SavingsSummary {
  const totalSaved = entries.reduce((sum, entry) => sum + entry.amount, 0);
  const remaining = Math.max(TARGET - totalSaved, 0);
  const percentage = Math.min((totalSaved / TARGET) * 100, 100);
  const daysUntilWedding = Math.max(Math.ceil((WEDDING_DATE_MS - Date.now()) / 86_400_000), 0);
  const monthsRemaining = daysUntilWedding > 0 ? Math.max(daysUntilWedding / 30.44, 1) : 0;
  const monthlyNeeded = monthsRemaining ? remaining / monthsRemaining : 0;
  return { target: TARGET, totalSaved, remaining, percentage, daysUntilWedding, monthlyNeeded };
}
