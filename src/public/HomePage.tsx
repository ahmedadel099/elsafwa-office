import { useState, type FormEvent } from 'react';
import {
  ArrowLeft,
  Building2,
  Car,
  ClipboardCheck,
  Clock,
  FileCheck2,
  FileSearch,
  HandCoins,
  Lock,
  MapPin,
  MessageCircle,
  Phone,
  Plug,
  ReceiptText,
  Search,
  Store,
  Handshake,
  type LucideIcon,
} from 'lucide-react';
import { SERVICE_CATEGORIES } from '../data/catalog';
import { useDb } from '../data/hooks';
import { digitsOnly, formatPhone } from '../lib/format';
import { Link, navigate } from '../lib/router';
import { Button, ButtonLink } from '../ui/Button';
import { Field, Input } from '../ui/Field';
import { OFFICE_DISCLAIMER } from './PublicLayout';

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  'البناء والتصالح': Building2,
  المرافق: Plug,
  'تراخيص المحال والأنشطة': Store,
  'الشركات والضرائب والتأمينات': Handshake,
  'الأحوال المدنية والمرور': Car,
};

const STEPS = [
  { icon: MessageCircle, title: 'تواصل أو زُر الفرع', text: 'نسمع طلبك ونحدد الخدمة والجهة المختصة والمستندات المطلوبة بدقة.' },
  { icon: FileSearch, title: 'نراجع الأوراق ونفتح ملفًا', text: 'تستلم رقم معاملة وإيصالًا بكل مبلغ، وأصولك تُسجَّل باسمك حتى تُرد.' },
  { icon: ClipboardCheck, title: 'نقدّم ونتابع مع الجهة', text: 'نتولى التقديم والمعاينات والمتابعة، وتعرف كل خطوة من صفحة التتبع.' },
  { icon: FileCheck2, title: 'تستلم المستند النهائي', text: 'نسلّمك الترخيص أو المستند مع الإيصالات الحكومية الرسمية.' },
];

const PROMISES = [
  { icon: ReceiptText, title: 'إيصال لكل مبلغ', text: 'أتعابنا واضحة ومكتوبة، وكل دفعة بإيصال مرقّم.' },
  { icon: HandCoins, title: 'الرسوم الحكومية بإيصالاتها', text: 'نسدد الرسوم للجهة باسمك ونسلّمك الإيصال الرسمي، ونرد أي فائض.' },
  { icon: Lock, title: 'بياناتك محمية', text: 'لا يطّلع على ملفك إلا الموظف المسؤول، وكل اطلاع مسجّل.' },
  { icon: Search, title: 'متابعة برقم المعاملة', text: 'اعرف موقف طلبك في أي وقت برقم المعاملة ورمز يصل لموبايلك.' },
];

const FAQ = [
  { q: 'هل الصفوة جهة حكومية؟', a: 'لا. الصفوة مكتب خاص يساعدك في تجهيز الأوراق والتقديم والمتابعة. القرار في الطلب يرجع للجهة المختصة وحدها.' },
  { q: 'كيف أعرف الأوراق المطلوبة لخدمتي؟', a: 'ستجد في دليل الخدمات قائمة المستندات لكل خدمة، ويمكنك طباعتها. ونراجعها معك قبل فتح الملف لأن بعض الحالات تحتاج أوراقًا إضافية.' },
  { q: 'ما الفرق بين الأتعاب والرسوم الحكومية؟', a: 'الأتعاب مقابل خدمة المكتب ومحددة مسبقًا. الرسوم الحكومية تحددها الجهة وتُسدد لها بإيصال رسمي باسمك، ونسلمك أصله.' },
  { q: 'هل يلزم عمل توكيل للمكتب؟', a: 'بعض الجهات تقبل التقديم من المكتب بتوكيل رسمي، وبعضها يشترط حضورك شخصيًا لخطوات معينة. نوضح لك ذلك من البداية لكل خدمة.' },
];

function QuickTrack() {
  const [ref, setRef] = useState('');
  const [phone, setPhone] = useState('');
  const submit = (event: FormEvent) => {
    event.preventDefault();
    navigate(`/track?ref=${encodeURIComponent(ref.trim().toUpperCase())}&phone=${encodeURIComponent(phone)}`);
  };
  return (
    <form onSubmit={submit} className="rounded-2xl border border-line bg-surface p-6 shadow-pop" aria-labelledby="quick-track-title">
      <p id="quick-track-title" className="text-lg font-semibold text-ink">
        تتبّع معاملتك
      </p>
      <p className="mt-1 text-sm text-ink-3">بالرقم المكتوب على إيصالك والموبايل المسجّل عندنا.</p>
      <div className="mt-5 space-y-4">
        <Field label="رقم المعاملة">
          <Input inputSize="lg" dir="ltr" placeholder="SFW-2026-00101" value={ref} onChange={(e) => setRef(e.target.value)} />
        </Field>
        <Field label="رقم الموبايل">
          <Input inputSize="lg" dir="ltr" inputMode="tel" placeholder="01xxxxxxxxx" value={phone} onChange={(e) => setPhone(digitsOnly(e.target.value).slice(0, 11))} />
        </Field>
        <Button type="submit" size="lg" className="w-full" disabled={!ref.trim() || phone.length < 11}>
          عرض موقف المعاملة
        </Button>
      </div>
      <p className="mt-4 flex items-center gap-2 text-xs text-ink-3">
        <Lock className="size-3.5" aria-hidden /> سيصلك رمز تحقق على الموبايل قبل عرض أي بيانات.
      </p>
    </form>
  );
}

export function HomePage() {
  const db = useDb();
  const services = db.services.filter((s) => s.is_active);

  return (
    <>
      <section className="border-b border-line bg-surface">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:py-20">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1 text-[13px] font-medium text-brand-ink">
              <MapPin className="size-3.5" aria-hidden /> منيا القمح · العزيزية — الشرقية
            </p>
            <h1 className="mt-5 text-4xl leading-tight font-semibold text-ink sm:text-5xl sm:leading-tight">
              معاملتك الحكومية في أيدٍ أمينة،
              <span className="block text-brand-ink">وخطوة بخطوة أمام عينك.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-ink-2">
              نجهّز أوراقك، ونقدّمها للجهة المختصة، ونتابعها حتى تستلم الترخيص أو المستند — مع إيصال لكل مبلغ ورقم معاملة تتابع به من موبايلك.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink to="/apply" size="lg">
                ابدأ طلبك
              </ButtonLink>
              <ButtonLink to="/services" size="lg" variant="secondary">
                اعرف الأوراق المطلوبة
              </ButtonLink>
            </div>
            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-6 border-t border-line pt-6">
              <div>
                <dt className="text-[13px] text-ink-3">خدمة متاحة</dt>
                <dd className="text-2xl font-semibold text-ink tabular">{services.length}</dd>
              </div>
              <div>
                <dt className="text-[13px] text-ink-3">فروع</dt>
                <dd className="text-2xl font-semibold text-ink tabular">{db.branches.length}</dd>
              </div>
              <div>
                <dt className="text-[13px] text-ink-3">لكل معاملة</dt>
                <dd className="text-2xl font-semibold text-ink">رقم متابعة</dd>
              </div>
            </dl>
          </div>
          <QuickTrack />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6" aria-labelledby="services-title">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="services-title" className="text-2xl font-semibold text-ink">
              خدماتنا
            </h2>
            <p className="mt-1 text-ink-3">اختر الخدمة لتعرف الجهة المختصة والمستندات والخطوات والمدة المتوقعة.</p>
          </div>
          <Link to="/services" className="inline-flex items-center gap-1 text-sm font-medium text-brand-ink hover:underline">
            كل الخدمات <ArrowLeft className="size-4 ltr:rotate-180" aria-hidden />
          </Link>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICE_CATEGORIES.map((category) => {
            const Icon = CATEGORY_ICONS[category] ?? FileCheck2;
            const items = services.filter((s) => s.category === category);
            return (
              <div key={category} className="flex flex-col rounded-2xl border border-line bg-surface p-5 shadow-card">
                <span className="flex size-11 items-center justify-center rounded-xl bg-brand-soft text-brand-ink">
                  <Icon className="size-5" aria-hidden />
                </span>
                <h3 className="mt-4 font-semibold text-ink">{category}</h3>
                <ul className="mt-3 flex-1 space-y-1.5">
                  {items.map((s) => (
                    <li key={s.id}>
                      <Link to={`/services/${s.id}`} className="group flex items-center justify-between gap-2 rounded-md py-1 text-sm text-ink-2 hover:text-brand-ink">
                        {s.name}
                        <ArrowLeft className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100 ltr:rotate-180" aria-hidden />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
          <div className="flex flex-col justify-between rounded-2xl bg-brand p-5 text-on-brand">
            <div>
              <h3 className="font-semibold">خدمتك مش في القائمة؟</h3>
              <p className="mt-2 text-sm text-on-brand/80">كلّمنا ونقولك هل نقدر نساعدك، وإيه المطلوب بالظبط.</p>
            </div>
            {db.branches[0] && (
              <a href={`tel:${db.branches[0].phones[0]}`} className="mt-5 inline-flex h-10 w-fit items-center gap-2 rounded-lg bg-on-brand/10 px-4 text-sm font-medium hover:bg-on-brand/20">
                <Phone className="size-4" aria-hidden />
                <span className="ltr-nums">{formatPhone(db.branches[0].phones[0])}</span>
              </a>
            )}
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-surface" aria-labelledby="how-title">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 id="how-title" className="text-2xl font-semibold text-ink">
            كيف نعمل
          </h2>
          <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, index) => (
              <li key={step.title} className="relative">
                <span className="flex size-11 items-center justify-center rounded-xl border border-line bg-canvas text-brand-ink">
                  <step.icon className="size-5" aria-hidden />
                </span>
                <p className="mt-4 text-xs font-medium text-ink-3">الخطوة {index + 1}</p>
                <h3 className="mt-1 font-semibold text-ink">{step.title}</h3>
                <p className="mt-1 text-sm text-ink-2">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6" aria-labelledby="promise-title">
        <h2 id="promise-title" className="text-2xl font-semibold text-ink">
          التزامنا معك
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PROMISES.map((p) => (
            <div key={p.title} className="rounded-2xl border border-line bg-surface p-5">
              <p.icon className="size-6 text-accent" aria-hidden />
              <h3 className="mt-3 font-semibold text-ink">{p.title}</h3>
              <p className="mt-1 text-sm text-ink-2">{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="branches" className="scroll-mt-20 border-y border-line bg-surface" aria-labelledby="branches-title">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 id="branches-title" className="text-2xl font-semibold text-ink">
            الفروع والتواصل
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {db.branches.map((b) => (
              <div key={b.id} className="rounded-2xl border border-line bg-canvas p-6">
                <h3 className="text-lg font-semibold text-ink">{b.name}</h3>
                <ul className="mt-4 space-y-3 text-sm text-ink-2">
                  <li className="flex gap-3">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-brand-ink" aria-hidden />
                    {b.address}
                  </li>
                  <li className="flex gap-3">
                    <Clock className="mt-0.5 size-4 shrink-0 text-brand-ink" aria-hidden />
                    {b.hours}
                  </li>
                  <li className="flex flex-wrap gap-3">
                    <Phone className="mt-0.5 size-4 shrink-0 text-brand-ink" aria-hidden />
                    {b.phones.map((p) => (
                      <a key={p} href={`tel:${p}`} className="ltr-nums font-medium text-ink hover:underline">
                        {formatPhone(p)}
                      </a>
                    ))}
                  </li>
                </ul>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${b.address}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-brand-ink hover:underline"
                >
                  الاتجاهات على الخريطة <ArrowLeft className="size-4 ltr:rotate-180" aria-hidden />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6" aria-labelledby="faq-title">
        <h2 id="faq-title" className="text-2xl font-semibold text-ink">
          أسئلة شائعة
        </h2>
        <div className="mt-6 divide-y divide-line rounded-2xl border border-line bg-surface">
          {FAQ.map((item) => (
            <details key={item.q} className="group px-5 py-4">
              <summary className="cursor-pointer list-none font-medium text-ink marker:hidden">
                <span className="flex items-center justify-between gap-4">
                  {item.q}
                  <span className="text-xl leading-none text-ink-3 transition-transform group-open:rotate-45" aria-hidden>
                    +
                  </span>
                </span>
              </summary>
              <p className="mt-2 text-sm text-ink-2">{item.a}</p>
            </details>
          ))}
        </div>
        <p className="mt-8 rounded-xl bg-surface-3 p-4 text-[13px] text-ink-2">{OFFICE_DISCLAIMER}</p>
      </section>
    </>
  );
}
