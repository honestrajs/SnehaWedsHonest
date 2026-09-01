import { FormEvent, useState } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import {
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Gift,
  Heart,
  LogOut,
  Menu,
  Plus,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
  UserRound,
  WalletCards,
  X,
} from 'lucide-react';
import {
  getGetCurrentMemberQueryKey,
  getGetSavingsSummaryQueryKey,
  getListSavingsEntriesQueryKey,
  SavingsEntryCategory,
  type Member,
  type SavingsEntry,
  type SavingsEntryInput,
  type SavingsSummary,
  useCreateSavingsEntry,
  useGetCurrentMember,
  useGetSavingsSummary,
  useListSavingsEntries,
  useLogin,
  useLogout,
} from '@workspace/api-client-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Router as WouterRouter, Switch } from 'wouter';
import ourStoryImage from './assets/our-story.png';
import './index.css';

const queryClient = new QueryClient();
const categoryLabels: Record<string, string> = {
  salary: 'Salary',
  gift: 'Gift',
  'side-income': 'Side income',
  other: 'Other',
};

const categoryIcons: Record<string, typeof WalletCards> = {
  salary: WalletCards,
  gift: Gift,
  'side-income': TrendingUp,
  other: CircleDollarSign,
};

const money = (value: number | undefined) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value ?? 0);

const shortDate = (value: string) =>
  new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));

function LoadingPanel({ label = 'Opening your shared fund...' }: { label?: string }) {
  return (
    <div className="min-h-[100dvh] bg-background p-5 sm:p-10" data-testid="state-loading">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="h-7 w-36 animate-pulse rounded-full bg-muted" />
        <div className="grid gap-5 lg:grid-cols-[1.4fr_.9fr]">
          <div className="h-72 animate-pulse rounded-[2rem] bg-muted" />
          <div className="h-72 animate-pulse rounded-[2rem] bg-muted" />
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          <div className="h-32 animate-pulse rounded-3xl bg-muted" />
          <div className="h-32 animate-pulse rounded-3xl bg-muted" />
          <div className="h-32 animate-pulse rounded-3xl bg-muted" />
        </div>
        <p className="mono-label text-center text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function AuthGate() {
  const currentMember = useGetCurrentMember({
    query: { queryKey: getGetCurrentMemberQueryKey(), retry: false },
  });

  if (currentMember.isLoading) return <LoadingPanel />;
  if (currentMember.data) return <Dashboard member={currentMember.data} />;
  return <LoginScreen />;
}

function LoginScreen({ error }: { error?: string }) {
  const queryClient = useQueryClient();
  const login = useLogin();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!username.trim() || !password) return;
    login.mutate(
      { data: { username: username.trim(), password } },
      {
        onSuccess: (member) => {
          queryClient.setQueryData(getGetCurrentMemberQueryKey(), member);
        },
      },
    );
  };

  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-[#eee9dc] text-[#272638]">
      <div className="paper-grid pointer-events-none absolute inset-0 opacity-60" />
      <div className="pointer-events-none absolute -right-28 -top-32 h-[26rem] w-[26rem] rounded-full bg-[#e6b935]/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-32 h-[28rem] w-[28rem] rounded-full bg-[#cf8394]/15 blur-3xl" />
      <div className="relative mx-auto grid min-h-[100dvh] max-w-[1400px] lg:grid-cols-[1.1fr_.9fr]">
        <section className="flex flex-col justify-between px-6 py-8 sm:px-12 lg:px-16 lg:py-12" data-testid="panel-welcome">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#272638] text-[#f3c632]">
              <Heart size={18} fill="currentColor" strokeWidth={1.7} />
            </div>
            <span className="serif-display text-2xl">Our Wedding Fund</span>
          </div>
          <div className="max-w-xl py-16 lg:py-0">
            <p className="mono-label mb-6 text-[11px] text-[#8d6570]">Sneha &amp; Honest · together since forever</p>
            <h1 className="serif-display text-[clamp(4.5rem,11vw,9.5rem)] leading-[.83] tracking-[-.045em]">
              One day.
              <br />
              <span className="italic text-[#ad6878]">One dream.</span>
            </h1>
            <p className="mt-9 max-w-sm text-base leading-7 text-[#686675]">
              A quiet corner for the little deposits that become a beautiful beginning. Your July 14, 2027 is getting closer.
            </p>
            <div className="mt-12 flex items-center gap-5 text-sm text-[#686675]">
              <span className="flex items-center gap-2">
                <CalendarDays size={16} className="text-[#ad6878]" />
                14 July 2027
              </span>
              <span className="h-1 w-1 rounded-full bg-[#e6b935]" />
              <span>Just yours</span>
            </div>
          </div>
          <p className="mono-label text-[10px] text-[#8c8990]">A private space for two · no audience required</p>
        </section>

        <section className="relative flex items-center justify-center px-6 py-10 sm:px-12 lg:bg-[#272638] lg:py-16" data-testid="panel-login">
          <div className="absolute right-8 top-8 hidden items-center gap-2 text-xs text-[#aaa8b2] lg:flex">
            <span className="h-2 w-2 rounded-full bg-[#e6b935]" />
            private &amp; encrypted
          </div>
          <div className="w-full max-w-md">
            <div className="mb-10 lg:hidden">
              <p className="mono-label text-[10px] text-[#8c8990]">Your shared space</p>
            </div>
            <div className="mb-10">
              <p className="mono-label mb-4 text-[11px] text-[#e6b935]">Welcome back</p>
              <h2 className="serif-display text-5xl leading-none text-[#272638] lg:text-[#f4f0e5]">Let&apos;s keep<br />the promise.</h2>
              <p className="mt-5 max-w-xs text-sm leading-6 text-[#686675] lg:text-[#aaa8b2]">
                Sign in to see where you are, and add a little more to where you&apos;re going.
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5" data-testid="form-login">
              <label className="block">
                <span className="mono-label mb-2 block text-[10px] text-[#686675] lg:text-[#aaa8b2]">Username</span>
                <input
                  data-testid="input-username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  autoComplete="username"
                  placeholder="your username"
                  className="h-14 w-full rounded-xl border border-[#d1cdc2] bg-[#f8f5ed] px-4 text-[#272638] outline-none transition focus:border-[#e6b935] focus:ring-2 focus:ring-[#e6b935]/20 lg:border-[#575668] lg:bg-[#343347] lg:text-[#f4f0e5] lg:placeholder:text-[#777587]"
                />
              </label>
              <label className="block">
                <div className="mb-2 flex items-center justify-between">
                  <span className="mono-label block text-[10px] text-[#686675] lg:text-[#aaa8b2]">Password</span>
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="text-xs text-[#ad6878] transition hover:text-[#8e4c5c] lg:text-[#e6b935] lg:hover:text-[#f3cf58]"
                    data-testid="button-toggle-password"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <input
                  data-testid="input-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  placeholder="your password"
                  className="h-14 w-full rounded-xl border border-[#d1cdc2] bg-[#f8f5ed] px-4 text-[#272638] outline-none transition focus:border-[#e6b935] focus:ring-2 focus:ring-[#e6b935]/20 lg:border-[#575668] lg:bg-[#343347] lg:text-[#f4f0e5] lg:placeholder:text-[#777587]"
                />
              </label>
              {(error || login.isError) && (
                <div className="rounded-xl border border-[#d79aa6]/50 bg-[#f8e9eb] px-4 py-3 text-sm text-[#8e4c5c]" role="alert" data-testid="status-login-error">
                  {login.isError ? 'That sign-in did not work. Check the details and try again.' : error}
                </div>
              )}
              <button
                data-testid="button-submit-login"
                type="submit"
                disabled={login.isPending || !username.trim() || !password}
                className="group flex h-14 w-full items-center justify-between rounded-xl bg-[#e6b935] px-5 font-semibold text-[#272638] transition hover:bg-[#f3cf58] focus:outline-none focus:ring-2 focus:ring-[#f3b900] focus:ring-offset-2 focus:ring-offset-[#272638] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span>{login.isPending ? 'Opening your fund...' : 'Enter our fund'}</span>
                {login.isPending ? <RefreshCw size={18} className="animate-spin" /> : <ArrowUpRight size={19} className="transition group-hover:translate-x-1 group-hover:-translate-y-1" />}
              </button>
            </form>
            <div className="mt-10 flex items-center gap-3 text-xs text-[#8c8990] lg:text-[#777587]">
              <Sparkles size={14} className="text-[#ad6878] lg:text-[#e6b935]" />
              <span>Made for the two of you, with room for every small win.</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Dashboard({ member }: { member: Member }) {
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [flashMessage, setFlashMessage] = useState('');
  const summaryQuery = useGetSavingsSummary({
    query: { enabled: true, queryKey: getGetSavingsSummaryQueryKey() },
  });
  const entriesQuery = useListSavingsEntries({
    query: { enabled: true, queryKey: getListSavingsEntriesQueryKey() },
  });
  const logout = useLogout();
  const createEntry = useCreateSavingsEntry();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        queryClient.removeQueries({ queryKey: getGetCurrentMemberQueryKey() });
        queryClient.removeQueries({ queryKey: getGetSavingsSummaryQueryKey() });
        queryClient.removeQueries({ queryKey: getListSavingsEntriesQueryKey() });
      },
    });
  };

  const addEntry = (data: SavingsEntryInput) => {
    createEntry.mutate(
      { data },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetSavingsSummaryQueryKey() });
          queryClient.invalidateQueries({ queryKey: getListSavingsEntriesQueryKey() });
          setIsAddOpen(false);
          setFlashMessage('A beautiful little win, saved.');
          window.setTimeout(() => setFlashMessage(''), 4000);
        },
      },
    );
  };

  const summary = summaryQuery.data;
  const entries = entriesQuery.data ?? [];

  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[250px] flex-col bg-sidebar px-6 py-7 text-sidebar-foreground transition-transform duration-300 lg:translate-x-0 ${isNavOpen ? 'translate-x-0' : '-translate-x-full'}`} data-testid="sidebar">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground">
            <Heart size={18} fill="currentColor" strokeWidth={1.7} />
          </div>
          <div>
            <p className="serif-display text-xl leading-none">Our Wedding Fund</p>
            <p className="mono-label mt-1 text-[8px] text-[#aaa8b2]">Sneha + Honest</p>
          </div>
        </div>
        <div className="mt-16">
          <p className="mono-label mb-4 text-[10px] text-[#aaa8b2]">The plan</p>
          <div className="flex items-center gap-3 rounded-xl bg-sidebar-accent px-3 py-3 text-sm">
            <Target size={17} className="text-sidebar-primary" />
            <span>Our wedding fund</span>
          </div>
        </div>
        <div className="mt-auto">
          <div className="mb-5 rounded-2xl border border-sidebar-border bg-sidebar-accent/60 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="mono-label text-[9px] text-[#aaa8b2]">The big day</span>
              <CalendarDays size={15} className="text-sidebar-primary" />
            </div>
            <p className="serif-display text-3xl">14.07.26</p>
             <p className="mt-1 text-xs text-[#aaa8b2]">{summary ? (summary.daysUntilWedding > 0 ? `${summary.daysUntilWedding} days to go` : 'The day has arrived') : '—'}</p>
          </div>
          <div className="flex items-center gap-3 border-t border-sidebar-border pt-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#cf8394] text-sm font-bold text-[#272638]">{initials(member.name)}</div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium" data-testid="text-member-name">{member.name}</p>
              <p className="text-xs capitalize text-[#aaa8b2]">{member.role}</p>
            </div>
            <button onClick={handleLogout} disabled={logout.isPending} className="text-[#aaa8b2] transition hover:text-sidebar-primary" data-testid="button-logout" aria-label="Sign out">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
      {isNavOpen && <button aria-label="Close menu" onClick={() => setIsNavOpen(false)} className="fixed inset-0 z-30 bg-[#272638]/30 lg:hidden" data-testid="button-close-menu" />}
      <main className="min-h-[100dvh] lg:pl-[250px]">
        <header className="flex items-center justify-between px-5 py-5 sm:px-9 sm:py-7">
          <button onClick={() => setIsNavOpen(true)} className="flex h-10 w-10 items-center justify-center rounded-xl border border-border text-muted-foreground lg:hidden" data-testid="button-open-menu" aria-label="Open menu">
            <Menu size={19} />
          </button>
          <div className="hidden lg:block">
            <p className="mono-label text-[10px] text-muted-foreground">Tuesday · little by little</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex"><span className="h-2 w-2 rounded-full bg-accent" /> private space</div>
            <button onClick={() => setIsAddOpen(true)} className="group flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-[#f3cf58] focus:outline-none focus:ring-2 focus:ring-ring" data-testid="button-open-add-entry">
              <Plus size={17} strokeWidth={2.5} /><span className="hidden sm:inline">Add to our fund</span><span className="sm:hidden">Add</span>
            </button>
          </div>
        </header>
        <div className="mx-auto max-w-[1280px] px-5 pb-12 sm:px-9">
          <section className="animate-rise-in mb-7 grid gap-5 xl:grid-cols-[1.4fr_.85fr]">
            <FundHero summary={summary} isLoading={summaryQuery.isLoading} isError={summaryQuery.isError} onRetry={() => summaryQuery.refetch()} member={member} />
            <PhotoMemory />
          </section>
          <section className="mb-10 grid gap-4 sm:grid-cols-3" data-testid="summary-cards">
            <SummaryCard label="We have saved" value={money(summary?.totalSaved)} detail={summary ? `${summary.percentage.toFixed(1)}% of our target` : 'Loading your total'} icon={<WalletCards size={18} />} tone="yellow" />
            <SummaryCard label="Still to go" value={money(summary?.remaining)} detail={summary ? `${money(summary.monthlyNeeded)} each month` : 'A little at a time'} icon={<TrendingUp size={18} />} tone="rose" />
            <SummaryCard label="Our target" value={money(summary?.target)} detail="The celebration we are building" icon={<Target size={18} />} tone="teal" />
          </section>
          <section className="grid gap-6 xl:grid-cols-[1.35fr_.65fr]">
            <EntriesCard entries={entries} isLoading={entriesQuery.isLoading} isError={entriesQuery.isError} onRetry={() => entriesQuery.refetch()} />
            <SideNote summary={summary} />
          </section>
        </div>
      </main>
      {isAddOpen && <AddEntryDialog isPending={createEntry.isPending} error={createEntry.isError} onClose={() => setIsAddOpen(false)} onSubmit={addEntry} />}
      {flashMessage && <div className="animate-soft-pop fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full bg-[#272638] px-5 py-3 text-sm text-[#f4f0e5] shadow-xl" role="status" data-testid="status-save-success"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#e6b935] text-[#272638]"><Check size={14} strokeWidth={3} /></span>{flashMessage}</div>}
    </div>
  );
}

function FundHero({ summary, isLoading, isError, onRetry, member }: { summary?: SavingsSummary; isLoading: boolean; isError: boolean; onRetry: () => void; member: Member }) {
  const percentage = Math.min(Math.max(summary?.percentage ?? 0, 0), 100);
  return (
    <div className="relative min-h-[300px] overflow-hidden rounded-[2rem] bg-[#272638] p-7 text-[#f4f0e5] shadow-lg sm:p-10" data-testid="card-fund-progress">
      <div className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full border-[28px] border-[#e6b935]/10" />
      <div className="pointer-events-none absolute -bottom-28 right-24 h-72 w-72 rounded-full border border-[#cf8394]/20" />
      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="mono-label text-[10px] text-[#aaa8b2]">Our shared fund</p>
            <h1 className="serif-display mt-3 text-4xl leading-none sm:text-5xl">A little closer<br /><span className="italic text-[#e6b935]">to forever.</span></h1>
          </div>
          <div className="hidden h-12 w-12 items-center justify-center rounded-full border border-[#575668] sm:flex"><Heart size={20} className="text-[#cf8394]" /></div>
        </div>
        {isError ? (
          <div className="mt-12 flex items-center justify-between rounded-xl border border-[#575668] bg-[#343347] p-4 text-sm">
            <span>We couldn&apos;t read the fund just now.</span>
            <button onClick={onRetry} className="flex items-center gap-2 text-[#e6b935] hover:underline" data-testid="button-retry-summary"><RefreshCw size={15} /> Retry</button>
          </div>
        ) : (
          <div className="mt-12">
            <div className="mb-3 flex items-end justify-between">
              <p className="serif-display text-5xl sm:text-6xl" data-testid="text-total-saved">{isLoading ? '—' : money(summary?.totalSaved)}</p>
              <p className="mono-label pb-1 text-[10px] text-[#aaa8b2]" data-testid="text-percentage">{isLoading ? '...' : `${percentage.toFixed(1)}% there`}</p>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-[#575668]"><div className="progress-draw h-full rounded-full bg-[#e6b935]" style={{ width: `${percentage}%` }} /></div>
            <div className="mt-3 flex justify-between text-xs text-[#aaa8b2]"><span>Now</span><span>{isLoading ? '—' : money(summary?.target)}</span></div>
          </div>
        )}
        <div className="mt-7 flex items-center gap-2 text-xs text-[#aaa8b2]"><UserRound size={14} className="text-[#cf8394]" /> Welcome back, {member.name.split(' ')[0]}</div>
      </div>
    </div>
  );
}

function PhotoMemory() {
  return (
    <div className="photo-memory-card relative overflow-hidden rounded-[2rem] bg-[#f5e5dc] p-7 text-[#382d3c] shadow-sm sm:p-8" data-testid="card-photo-memory">
      <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-[#cf8394]/20 blur-2xl" />
      <div className="relative flex h-full flex-col">
        <div className="flex items-center justify-between">
          <p className="mono-label text-[10px] text-[#8d6570]">A little piece of us</p>
          <Heart size={18} className="text-[#ad6878]" fill="currentColor" />
        </div>
        <h2 className="serif-display mt-6 text-4xl leading-none">Our story,<br /><span className="italic text-[#ad6878]">in one frame.</span></h2>
        <div className="mt-7 flex flex-1 items-center justify-center">
          <div className="brush-photo-scene mx-auto" data-testid="photo-preview">
            <img src={ourStoryImage} alt="Sneha and Honest on their wedding day" className="brush-photo-image" />
            <span className="brush-stroke brush-stroke-one" />
            <span className="brush-stroke brush-stroke-two" />
          </div>
        </div>
        <p className="mt-6 text-sm leading-6 text-[#6f5d66]">A little reminder of the promise we are building toward, kept here for every visit.</p>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, detail, icon, tone }: { label: string; value: string; detail: string; icon: React.ReactNode; tone: 'yellow' | 'rose' | 'teal' }) {
  const colors = { yellow: 'bg-[#f8efc9] text-[#75601c]', rose: 'bg-[#f4e1e5] text-[#8e4c5c]', teal: 'bg-[#dceee9] text-[#34695f]' };
  return <div className="rounded-3xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md" data-testid={`card-summary-${label.toLowerCase().replaceAll(' ', '-')}`}><div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">{label}</span><span className={`flex h-9 w-9 items-center justify-center rounded-xl ${colors[tone]}`}>{icon}</span></div><p className="mt-5 text-2xl font-semibold tracking-tight">{value}</p><p className="mt-1 text-xs text-muted-foreground">{detail}</p></div>;
}

function EntriesCard({ entries, isLoading, isError, onRetry }: { entries: SavingsEntry[]; isLoading: boolean; isError: boolean; onRetry: () => void }) {
  return (
    <div className="rounded-[2rem] border border-border bg-card p-6 shadow-sm sm:p-8" data-testid="card-recent-entries">
      <div className="mb-7 flex items-end justify-between"><div><p className="mono-label text-[10px] text-muted-foreground">The paper trail</p><h2 className="serif-display mt-2 text-4xl">Recent additions</h2></div><span className="rounded-full bg-muted px-3 py-1.5 text-xs text-muted-foreground">{entries.length} {entries.length === 1 ? 'entry' : 'entries'}</span></div>
      {isLoading ? <div className="space-y-3">{[1, 2, 3].map((item) => <div className="h-16 animate-pulse rounded-2xl bg-muted" key={item} />)}</div> : isError ? <div className="rounded-2xl border border-dashed border-border p-8 text-center"><p className="text-sm text-muted-foreground">The additions are taking a moment to arrive.</p><button onClick={onRetry} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#8e4c5c]" data-testid="button-retry-entries"><RefreshCw size={15} /> Try again</button></div> : entries.length === 0 ? <EmptyEntries /> : <div className="space-y-2">{entries.map((entry, index) => <EntryRow entry={entry} index={index} key={entry.id} />)}</div>}
    </div>
  );
}

function EmptyEntries() {
  return <div className="rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-12 text-center" data-testid="state-empty-entries"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f8efc9] text-[#75601c]"><Sparkles size={22} /></div><h3 className="serif-display mt-5 text-2xl">The first page is blank.</h3><p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-muted-foreground">Add your first little win and start the story of this fund.</p></div>;
}

function EntryRow({ entry, index }: { entry: SavingsEntry; index: number }) {
  const Icon = categoryIcons[entry.category] ?? CircleDollarSign;
  return <div className="animate-rise-in group flex items-center gap-3 rounded-2xl px-2 py-3 transition hover:bg-muted/60" style={{ animationDelay: `${index * 70}ms` }} data-testid={`row-savings-entry-${entry.id}`}><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-[#8e4c5c]"><Icon size={18} /></div><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><p className="truncate text-sm font-semibold">{entry.summary}</p><span className="hidden rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground sm:inline">{categoryLabels[entry.category]}</span></div><p className="mt-1 text-xs text-muted-foreground">{shortDate(entry.occurredAt)} · shared by both of us</p></div><p className="font-semibold text-[#34695f]" data-testid={`text-entry-amount-${entry.id}`}>+{money(entry.amount)}</p><ChevronRight size={15} className="text-border transition group-hover:translate-x-0.5 group-hover:text-foreground" /></div>;
}

function SideNote({ summary }: { summary?: SavingsSummary }) {
  const dayHasArrived = summary?.daysUntilWedding === 0;
  return (
    <div className="flex flex-col justify-between rounded-[2rem] bg-[#dceee9] p-7 text-[#28534b] sm:p-8" data-testid="card-side-note">
      <div>
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#b8ddd3]"><Clock3 size={20} /></div>
        <h2 className="serif-display mt-8 text-4xl leading-none">
          {dayHasArrived ? (
            <>A beautiful<br /><span className="italic">beginning.</span></>
          ) : (
            <>The date is<br /><span className="italic">in sight.</span></>
          )}
        </h2>
        <p className="mt-5 text-sm leading-6 text-[#517a72]">
          {dayHasArrived
            ? 'The day you have been saving for is here. Every little win helped you get there.'
            : <>If we keep this rhythm, we&apos;ll have {money(summary?.monthlyNeeded)} to put aside each month. That&apos;s a promise we can keep.</>}
        </p>
      </div>
      <div className="mt-12 border-t border-[#a9d1c6] pt-5">
        <p className="mono-label text-[10px] text-[#517a72]">{dayHasArrived ? 'Fund still to go' : 'Next little milestone'}</p>
        <div className="mt-3 flex items-end justify-between">
          <p className="serif-display text-3xl">{money(summary?.remaining ? Math.min(summary.remaining, summary.target * .1) : 0)}</p>
          <span className="mb-1 text-xs text-[#517a72]">to go</span>
        </div>
      </div>
    </div>
  );
}

function AddEntryDialog({ isPending, error, onClose, onSubmit }: { isPending: boolean; error: boolean; onClose: () => void; onSubmit: (data: SavingsEntryInput) => void }) {
  const [amount, setAmount] = useState('');
  const [occurredAt, setOccurredAt] = useState(toDateTimeInputValue(new Date()));
  const [summary, setSummary] = useState('');
  const [category, setCategory] = useState<SavingsEntryInput['category']>(SavingsEntryCategory.salary);
  const canSubmit = Number(amount) > 0 && summary.trim().length > 0 && occurredAt;
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;
    onSubmit({ amount: Number(amount), occurredAt, summary: summary.trim(), category });
  };
   return <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#272638]/40 p-0 backdrop-blur-sm sm:items-center sm:p-5" role="dialog" aria-modal="true" aria-labelledby="add-entry-title" data-testid="dialog-add-entry"><div className="animate-soft-pop w-full max-w-lg rounded-t-[2rem] bg-[#f8f5ed] p-6 shadow-2xl sm:rounded-[2rem] sm:p-8"><div className="mb-7 flex items-start justify-between"><div><p className="mono-label text-[10px] text-[#8c8990]">A new little win</p><h2 id="add-entry-title" className="serif-display mt-2 text-4xl text-[#272638]">Add to our fund</h2></div><button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eee9dc] text-[#686675] transition hover:bg-[#e6b935]" data-testid="button-close-add-entry" aria-label="Close add entry"><X size={18} /></button></div><form onSubmit={handleSubmit} className="space-y-4" data-testid="form-add-entry"><label className="block"><span className="mono-label mb-2 block text-[10px] text-[#8c8990]">Amount</span><div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-[#8c8990]">₹</span><input data-testid="input-entry-amount" type="number" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="0" className="h-14 w-full rounded-xl border border-[#d1cdc2] bg-white px-4 pl-9 text-lg text-[#272638] outline-none focus:border-[#e6b935] focus:ring-2 focus:ring-[#e6b935]/20" /></div></label><div className="grid gap-4 sm:grid-cols-2"><label className="block"><span className="mono-label mb-2 block text-[10px] text-[#8c8990]">Date &amp; time</span><input data-testid="input-entry-date" type="datetime-local" value={occurredAt} onChange={(event) => setOccurredAt(event.target.value)} className="h-12 w-full rounded-xl border border-[#d1cdc2] bg-white px-4 text-sm text-[#272638] outline-none focus:border-[#e6b935]" /></label><label className="block"><span className="mono-label mb-2 block text-[10px] text-[#8c8990]">From</span><select data-testid="select-entry-category" value={category} onChange={(event) => setCategory(event.target.value as SavingsEntryInput['category'])} className="h-12 w-full rounded-xl border border-[#d1cdc2] bg-white px-4 text-sm text-[#272638] outline-none focus:border-[#e6b935]">{Object.entries(categoryLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label></div><label className="block"><span className="mono-label mb-2 block text-[10px] text-[#8c8990]">A note for us</span><input data-testid="input-entry-summary" value={summary} onChange={(event) => setSummary(event.target.value)} maxLength={240} placeholder="e.g. May salary set aside" className="h-14 w-full rounded-xl border border-[#d1cdc2] bg-white px-4 text-sm text-[#272638] outline-none focus:border-[#e6b935] focus:ring-2 focus:ring-[#e6b935]/20" /></label>{error && <p className="rounded-xl bg-[#f8e9eb] px-4 py-3 text-sm text-[#8e4c5c]" role="alert" data-testid="status-add-entry-error">Could not save this addition. Please try again.</p>}<button type="submit" disabled={!canSubmit || isPending} className="mt-3 flex h-14 w-full items-center justify-between rounded-xl bg-[#272638] px-5 font-semibold text-[#f4f0e5] transition hover:bg-[#343347] focus:outline-none focus:ring-2 focus:ring-[#e6b935] disabled:cursor-not-allowed disabled:opacity-50" data-testid="button-submit-entry"><span>{isPending ? 'Saving this moment...' : 'Save this little win'}</span>{isPending ? <RefreshCw size={17} className="animate-spin" /> : <Heart size={17} />}</button></form></div></div>;
}

function toDateTimeInputValue(date: Date) {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

function initials(name: string) {
  return name.split(' ').slice(0, 2).map((part) => part[0]).join('').toUpperCase();
}

function Router() {
  return <ErrorBoundary><Switch><Route path="/" component={AuthGate} /><Route component={NotFound} /></Switch></ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;