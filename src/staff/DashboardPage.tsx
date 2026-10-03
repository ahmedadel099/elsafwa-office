import { useMemo, useState } from 'react';
import { AlarmClock, ArrowLeft, ClipboardList, Coins, FolderOpen, Inbox, Landmark, ShieldAlert, UserRoundSearch } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useUser } from '../app/AuthContext';
import { useDb } from '../data/hooks';
import { AUDIT_ACTIONS, BALL, can } from '../data/meta';
import { dashboardOf, scopeRequests, slaOf, isClosed } from '../data/selectors';
import type { BallInCourt } from '../data/types';
import { cn } from '../lib/cn';
import { formatMoney, formatNumber, formatRelative, formatToday, isoDate } from '../lib/format';
import { Link } from '../lib/router';
import { ButtonLink } from '../ui/Button';
import { toneDot } from '../ui/Badge';
import { Card, CardHeader } from '../ui/Card';
import { EmptyState } from '../ui/Feedback';
import { PageHeader, Stat } from '../ui/Layout';
import { Tabs } from '../ui/Tabs';
import { RequestListItem } from './requests/RequestListItem';

type WorkTab = 'mine' | 'overdue' | 'client' | 'unassigned';

function greeting(): string {
  return new Date().getHours() < 12 ? 'صباح الخير' : 'مساء الخير';
}

export function DashboardPage() {
  const user = useUser();
  const db = useDb();
  const metrics = useMemo(() => dashboardOf(db, user), [db, user]);
  const branch = db.branches.find((b) => b.id === user.branch_id);
  const manager = user.role === 'admin' || user.role === 'branch_manager';
  const [tab, setTab] = useState<WorkTab>(manager ? 'overdue' : 'mine');

  const open = scopeRequests(db, user).filter((r) => !isClosed(r));
  const lists: Record<WorkTab, typeof open> = {
    mine: open.filter((r) => r.assignee_id === user.id),
    overdue: [...metrics.overdue, ...metrics.dueSoon],
    client: open.filter((r) => r.status === 'awaiting_client' || r.status === 'ready'),
    unassigned: metrics.unassigned,
  };
  const sortBySla = (a: (typeof open)[number], b: (typeof open)[number]) => slaOf(a).days - slaOf(b).days;

  const tabs = [
    { id: 'mine' as const, label: 'معاملاتي', count: lists.mine.length },
    { id: 'overdue' as const, label: 'متأخرة أو قريبة', count: lists.overdue.length },
    { id: 'client' as const, label: 'بانتظار العميل', count: lists.client.length },
    ...(manager ? [{ id: 'unassigned' as const, label: 'بدون مسؤول', count: lists.unassigned.length }] : []),
  ];

  const collections = useMemo(() => {
    const ids = new Set(scopeRequests(db, user).map((r) => r.id));
    const days = Array.from({ length: 14 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (13 - i));
      return isoDate(d);
    });
    return days.map((day) => {
      const dayPayments = db.payments.filter((p) => ids.has(p.request_id) && !p.voided && isoDate(new Date(p.received_at)) === day);
      return {
        day: new Intl.DateTimeFormat('ar-EG-u-nu-latn', { day: 'numeric', month: 'short' }).format(new Date(day)),
        office: dayPayments.filter((p) => p.kind === 'office_fee').reduce((s, p) => s + p.amount, 0),
        trust: dayPayments.filter((p) => p.kind === 'gov_fee_deposit').reduce((s, p) => s + p.amount, 0),
      };
    });
  }, [db, user]);

  const recentActivity = db.audit
    .filter((a) => user.role === 'admin' || a.branch_id === user.branch_id)
    .slice(-6)
    .reverse();

  const ballOrder: BallInCourt[] = ['office', 'client', 'authority'];
  const openTotal = Math.max(1, metrics.openCount);

  return (
    <>
      <PageHeader
        title={`${greeting()}، ${user.full_name.split(' ')[0]}`}
        description={`${formatToday()} · ${user.role === 'admin' ? 'كل الفروع' : branch?.name}`}
        actions={
          <ButtonLink to="/app/requests" variant="secondary" icon={ClipboardList}>
            كل المعاملات
          </ButtonLink>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="معاملات مفتوحة" value={formatNumber(metrics.openCount)} icon={FolderOpen} hint={`${metrics.byBall.office} على المكتب · ${metrics.byBall.authority} لدى الجهات`} to="/app/requests" />
        <Stat label="متأخرة عن الموعد" value={formatNumber(metrics.overdue.length)} icon={AlarmClock} tone="danger" hint={`${metrics.dueSoon.length} موعدها خلال 3 أيام`} to="/app/requests?view=overdue" />
        <Stat label="بانتظار العميل" value={formatNumber(metrics.byBall.client)} icon={UserRoundSearch} tone="warning" hint="مستندات ناقصة أو جاهزة للاستلام" to="/app/requests?view=client" />
        <Stat label="تحصيل اليوم" value={formatMoney(metrics.collectedToday)} icon={Coins} tone="accent" hint={`مستحقات أتعاب: ${formatMoney(metrics.officeOutstanding)}`} to={can(user.role, 'treasury.view') ? '/app/treasury' : undefined} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title="قائمة العمل" description="المعاملات اللي محتاجة تحرك منك أو من الفريق" />
          <Tabs label="قوائم العمل" items={tabs} value={tab} onChange={setTab} className="px-3" />
          {lists[tab].length === 0 ? (
            <EmptyState icon={Inbox} title="لا توجد معاملات هنا" description="كل شيء تحت السيطرة في هذه القائمة." />
          ) : (
            <ul className="divide-y divide-line">
              {[...lists[tab]].sort(sortBySla).slice(0, 6).map((r) => (
                <RequestListItem key={r.id} request={r} />
              ))}
            </ul>
          )}
          {lists[tab].length > 6 && (
            <div className="border-t border-line px-5 py-3 text-sm">
              <Link to="/app/requests" className="font-medium text-brand-ink hover:underline">
                عرض الكل ({lists[tab].length})
              </Link>
            </div>
          )}
        </Card>

        <Card>
          <CardHeader title="أين المعاملات الآن؟" description="المعاملات المفتوحة حسب الطرف المطلوب منه التحرك" />
          <div className="p-5">
            <div className="flex h-3 overflow-hidden rounded-full bg-surface-3" role="img" aria-label="توزيع المعاملات المفتوحة">
              {ballOrder.map((ball) => (
                <div key={ball} className={cn(toneDot[BALL[ball].tone], 'h-full')} style={{ width: `${(metrics.byBall[ball] / openTotal) * 100}%` }} />
              ))}
            </div>
            <ul className="mt-5 space-y-3">
              {ballOrder.map((ball) => (
                <li key={ball} className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex items-center gap-2 text-ink-2">
                    <span className={cn('size-2.5 rounded-full', toneDot[BALL[ball].tone])} aria-hidden />
                    {BALL[ball].label}
                  </span>
                  <span className="font-semibold text-ink tabular">{metrics.byBall[ball]}</span>
                </li>
              ))}
            </ul>
            {metrics.overdue.length > 0 && (
              <div className="mt-5 rounded-lg bg-danger-soft p-3 text-sm text-danger">
                <p className="flex items-center gap-2 font-semibold">
                  <ShieldAlert className="size-4" aria-hidden />
                  {metrics.overdue.length} معاملة تجاوزت الموعد المتفق عليه
                </p>
                <p className="mt-1 text-ink-2">تواصل مع العميل لتحديث الموعد قبل ما يسأل.</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader
            title="التحصيل آخر 14 يوم"
            description="الأتعاب إيراد للمكتب، وأمانات الرسوم أموال العملاء لحين سدادها للجهات"
            actions={
              can(user.role, 'treasury.view') ? (
                <Link to="/app/treasury" className="inline-flex items-center gap-1 text-sm font-medium text-brand-ink hover:underline">
                  تقارير الخزينة <ArrowLeft className="size-4 ltr:rotate-180" aria-hidden />
                </Link>
              ) : undefined
            }
          />
          <div className="grid grid-cols-3 gap-4 border-b border-line px-5 py-4 text-sm">
            <div>
              <p className="text-ink-3">أتعاب هذا الشهر</p>
              <p className="mt-0.5 text-lg font-semibold text-ink tabular">{formatMoney(metrics.collectedMonthOffice)}</p>
            </div>
            <div>
              <p className="text-ink-3">أمانات رسوم هذا الشهر</p>
              <p className="mt-0.5 text-lg font-semibold text-ink tabular">{formatMoney(metrics.collectedMonthTrust)}</p>
            </div>
            <div>
              <p className="text-ink-3">أمانات بالخزينة لم تُصرف</p>
              <p className="mt-0.5 text-lg font-semibold text-accent tabular">{formatMoney(metrics.trustHeld)}</p>
            </div>
          </div>
          <div className="h-64 px-2 pt-4 pb-2" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={collections} margin={{ top: 4, right: 12, left: 12, bottom: 0 }}>
                <defs>
                  <linearGradient id="officeFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--brand)" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="var(--brand)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="trustFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.22} />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--line)" vertical={false} />
                <XAxis dataKey="day" reversed tick={{ fill: 'var(--ink-3)', fontSize: 12 }} tickLine={false} axisLine={false} interval={1} />
                <YAxis orientation="right" tick={{ fill: 'var(--ink-3)', fontSize: 12 }} tickLine={false} axisLine={false} width={48} tickFormatter={(v: number) => (v >= 1000 ? `${v / 1000}k` : String(v))} />
                <Tooltip
                  contentStyle={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 10, direction: 'rtl', fontSize: 13 }}
                  labelStyle={{ color: 'var(--ink)', fontWeight: 600 }}
                  formatter={(value, name) => [formatMoney(Number(value)), name === 'office' ? 'أتعاب' : 'أمانات رسوم']}
                />
                <Area type="monotone" dataKey="trust" stroke="var(--accent)" strokeWidth={2} fill="url(#trustFill)" />
                <Area type="monotone" dataKey="office" stroke="var(--brand)" strokeWidth={2} fill="url(#officeFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-5 px-5 pb-4 text-[13px] text-ink-3">
            <span className="flex items-center gap-2">
              <span className="h-0.5 w-4 rounded bg-brand" aria-hidden /> أتعاب الخدمة
            </span>
            <span className="flex items-center gap-2">
              <span className="h-0.5 w-4 rounded bg-accent" aria-hidden /> أمانات رسوم حكومية
            </span>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="آخر النشاط"
            actions={
              can(user.role, 'audit.view') ? (
                <Link to="/app/audit" className="text-sm font-medium text-brand-ink hover:underline">
                  سجل النشاط
                </Link>
              ) : undefined
            }
          />
          <ol className="divide-y divide-line">
            {recentActivity.map((event) => (
              <li key={event.id} className="px-5 py-3">
                <p className="text-sm text-ink">
                  <span className="font-medium">{event.actor_name}</span> <span className="text-ink-3">· {AUDIT_ACTIONS[event.action] ?? event.action}</span>
                </p>
                <p className="mt-0.5 truncate text-[13px] text-ink-3">{event.summary}</p>
                <p className="mt-0.5 text-xs text-ink-3">{formatRelative(event.at)}</p>
              </li>
            ))}
          </ol>
        </Card>
      </div>

      {manager && (
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader title="حجم العمل على الفريق" description="المعاملات المفتوحة المسندة لكل موظف" />
            <ul className="space-y-4 p-5">
              {metrics.workload.map(({ profile, open: count }) => (
                <li key={profile.id}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-ink-2">{profile.full_name}</span>
                    <span className="font-semibold text-ink tabular">{count}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-3">
                    <div className="h-full rounded-full bg-brand" style={{ width: `${Math.min(100, (count / Math.max(1, ...metrics.workload.map((w) => w.open))) * 100)}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <CardHeader title="الفروع" description="المعاملات المفتوحة والتحصيل هذا الشهر" />
            <ul className="divide-y divide-line">
              {metrics.branches.map(({ branch: b, open: count, collectedMonth }) => (
                <li key={b.id} className="flex items-center gap-4 px-5 py-4">
                  <span className="flex size-10 items-center justify-center rounded-lg bg-surface-3 text-ink-2">
                    <Landmark className="size-5" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-ink">{b.name}</p>
                    <p className="text-[13px] text-ink-3">{count} معاملة مفتوحة</p>
                  </div>
                  <p className="font-semibold text-ink tabular">{formatMoney(collectedMonth)}</p>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </>
  );
}
