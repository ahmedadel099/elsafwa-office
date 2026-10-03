import { Compass } from 'lucide-react';
import { ButtonLink } from '../ui/Button';
import { EmptyState } from '../ui/Feedback';

export function NotFound() {
  return <EmptyState icon={Compass} title="الصفحة غير موجودة أو ليست ضمن صلاحياتك" action={<ButtonLink to="/app">لوحة المتابعة</ButtonLink>} />;
}
