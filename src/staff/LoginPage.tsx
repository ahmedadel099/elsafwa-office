import { useState, type FormEvent } from 'react';
import { ArrowRight, KeyRound, LockKeyhole, Mail, ShieldCheck, Smartphone } from 'lucide-react';
import { useAuth } from '../app/AuthContext';
import { DemoBanner } from '../app/DemoBanner';
import { useDb } from '../data/hooks';
import { ROLE } from '../data/meta';
import { DEMO_MFA_CODE, DEMO_PASSWORD } from '../data/seed';
import { digitsOnly } from '../lib/format';
import { Link, navigate } from '../lib/router';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Feedback';
import { Field, Input } from '../ui/Field';
import { Avatar } from '../ui/Layout';
import { Logo } from '../ui/Logo';

const QUICK_ACCOUNTS = ['usr-admin', 'usr-mgr-mq', 'usr-eslam', 'usr-karim'];

export function LoginPage() {
  const { login, verifyMfa, cancelMfa, demoLogin, pendingMfa, notice } = useAuth();
  const db = useDb();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const enter = () => {
    if (!window.location.hash.startsWith('#/app')) navigate('/app', { replace: true });
  };

  const onLogin = (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    const result = login(email, password);
    if (result.status === 'error') setError(result.message);
    if (result.status === 'ok') enter();
  };

  const onVerify = (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (verifyMfa(code)) enter();
    else setError('رمز التحقق غير صحيح. أدخل الرمز الظاهر في تطبيق المصادقة.');
  };

  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <DemoBanner />
      <div className="grid flex-1 lg:grid-cols-[1fr_minmax(0,34rem)]">
        <section className="relative hidden overflow-hidden bg-brand lg:flex lg:flex-col lg:justify-between lg:p-12" aria-hidden>
          <div className="absolute -start-24 -top-24 size-96 rounded-full bg-on-brand/5" />
          <div className="absolute -bottom-32 -end-20 size-[28rem] rounded-full bg-on-brand/5" />
          <div className="relative flex items-center gap-3 text-on-brand">
            <span className="flex size-11 items-center justify-center rounded-xl bg-on-brand/10 text-xl font-bold">ص</span>
            <span className="text-lg font-semibold">الصفوة للخدمات الحكومية والإلكترونية</span>
          </div>
          <div className="relative max-w-md text-on-brand">
            <p className="text-3xl leading-snug font-semibold">كل معاملة لها ملف، وكل خطوة لها صاحب وتاريخ.</p>
            <p className="mt-4 text-on-brand/75">منظومة داخلية لموظفي المكتب: تسجيل المعاملات، متابعة الخطوات مع الجهات، المستندات، والخزينة — مع سجل نشاط لا يقبل التعديل.</p>
          </div>
          <ul className="relative grid gap-3 text-sm text-on-brand/85">
            <li className="flex items-center gap-2">
              <ShieldCheck className="size-4" /> تحقق ثنائي للحسابات الحساسة
            </li>
            <li className="flex items-center gap-2">
              <LockKeyhole className="size-4" /> صلاحيات حسب الدور والفرع
            </li>
            <li className="flex items-center gap-2">
              <KeyRound className="size-4" /> إنهاء الجلسة تلقائيًا بعد 15 دقيقة بدون نشاط
            </li>
          </ul>
        </section>

        <section className="flex items-center justify-center px-4 py-10 sm:px-8">
          <div className="w-full max-w-sm">
            <div className="mb-8 lg:hidden">
              <Logo />
            </div>

            {!pendingMfa ? (
              <>
                <h1 className="text-2xl font-semibold text-ink">دخول الموظفين</h1>
                <p className="mt-1 text-sm text-ink-3">استخدم البريد الإلكتروني الذي سجّله لك المدير العام.</p>

                {(notice || error) && (
                  <Alert tone={error ? 'danger' : 'warning'} className="mt-5">
                    {error ?? notice}
                  </Alert>
                )}

                <form onSubmit={onLogin} className="mt-6 space-y-4" noValidate>
                  <Field label="البريد الإلكتروني" required>
                    <Input type="email" autoComplete="username" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} leading={<Mail className="size-4" />} />
                  </Field>
                  <Field label="كلمة المرور" required>
                    <Input type="password" autoComplete="current-password" dir="ltr" value={password} onChange={(e) => setPassword(e.target.value)} leading={<LockKeyhole className="size-4" />} />
                  </Field>
                  <Button type="submit" className="w-full" size="lg">
                    تسجيل الدخول
                  </Button>
                </form>

                <p className="mt-3 text-xs text-ink-3">
                  لا يوجد تسجيل ذاتي: حسابات الموظفين يضيفها المدير العام فقط. نسيت كلمة المرور؟ تواصل مع المدير لإرسال رابط إعادة التعيين.
                </p>

                <div className="mt-8 rounded-xl border border-dashed border-line-strong bg-surface p-4">
                  <p className="text-sm font-semibold text-ink">دخول سريع لنسخة العرض</p>
                  <p className="mt-0.5 text-xs text-ink-3">
                    أو استخدم أي بريد بالأسفل مع كلمة المرور <span className="ltr-nums font-semibold text-ink-2">{DEMO_PASSWORD}</span>
                  </p>
                  <ul className="mt-3 space-y-1.5">
                    {QUICK_ACCOUNTS.map((id) => {
                      const profile = db.profiles.find((p) => p.id === id);
                      if (!profile) return null;
                      return (
                        <li key={id}>
                          <button
                            type="button"
                            onClick={() => {
                              demoLogin(id);
                              enter();
                            }}
                            className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-start transition-colors hover:bg-surface-3"
                          >
                            <Avatar name={profile.full_name} size="sm" />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-medium text-ink">{ROLE[profile.role].label}</span>
                              <span className="ltr-nums block truncate text-xs text-ink-3">{profile.email}</span>
                            </span>
                            <ArrowRight className="size-4 text-ink-3 ltr:rotate-180" aria-hidden />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </>
            ) : (
              <>
                <span className="flex size-12 items-center justify-center rounded-xl bg-brand-soft text-brand-ink">
                  <Smartphone className="size-6" aria-hidden />
                </span>
                <h1 className="mt-4 text-2xl font-semibold text-ink">التحقق بخطوتين</h1>
                <p className="mt-1 text-sm text-ink-3">
                  أدخل الرمز المكوّن من 6 أرقام من تطبيق المصادقة على موبايلك لحساب <span className="ltr-nums text-ink-2">{pendingMfa.email}</span>.
                </p>
                {error && (
                  <Alert tone="danger" className="mt-5">
                    {error}
                  </Alert>
                )}
                <form onSubmit={onVerify} className="mt-6 space-y-4">
                  <Field label="رمز التحقق" hint={`نسخة العرض: الرمز هو ${DEMO_MFA_CODE}`}>
                    <Input
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      dir="ltr"
                      maxLength={6}
                      value={code}
                      onChange={(e) => setCode(digitsOnly(e.target.value).slice(0, 6))}
                      className="text-center text-lg tracking-[0.5em]"
                      autoFocus
                    />
                  </Field>
                  <Button type="submit" className="w-full" size="lg" disabled={code.length !== 6}>
                    تأكيد
                  </Button>
                  <Button variant="ghost" className="w-full" onClick={cancelMfa}>
                    رجوع
                  </Button>
                </form>
              </>
            )}

            <p className="mt-8 text-center text-sm">
              <Link to="/" className="text-ink-3 hover:text-ink hover:underline">
                العودة لموقع العملاء
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
