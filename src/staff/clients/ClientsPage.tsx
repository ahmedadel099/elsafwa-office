import { useMemo, useState } from 'react';
import { Building2, SearchX, UserPlus, UserRound } from 'lucide-react';
import { useAuth, useUser } from '../../app/AuthContext';
import { Button } from '../../ui/Button';
import { ClientFormDialog } from './ClientFormDialog';
import { useDb } from '../../data/hooks';
import { financeOf, isClosed } from '../../data/selectors';
import { digitsOnly, formatMoney, formatPhone, formatShortDate } from '../../lib/format';
import { Link, navigate } from '../../lib/router';
import { Badge } from '../../ui/Badge';
import { Card } from '../../ui/Card';
import { EmptyState } from '../../ui/Feedback';
import { Input } from '../../ui/Field';
import { Avatar, PageHeader, Table, TableWrap, Td, Th, Tr } from '../../ui/Layout';

export function ClientsPage() {
  const user = useUser();
  const db = useDb();
  const { can } = useAuth();
  const [q, setQ] = useState('');
  const [adding, setAdding] = useState(false);

  const rows = useMemo(() => {
    const needle = q.trim();
    const digits = digitsOnly(needle);
    return db.clients
      .filter((c) => user.role === 'admin' || c.branch_id === user.branch_id)
      .filter((c) => !needle || c.full_name.includes(needle) || (c.business_name ?? '').includes(needle) || (digits.length >= 4 && (c.phone.includes(digits) || c.national_id === digits)))
      .map((c) => {
        const requests = db.requests.filter((r) => r.client_id === c.id);
        return {
          client: c,
          open: requests.filter((r) => !isClosed(r)).length,
          total: requests.length,
          due: requests.reduce((s, r) => s + financeOf(db, r.id).officeDue, 0),
          last: requests.map((r) => r.updated_at).sort().at(-1),
        };
      })
      .sort((a, b) => (b.last ?? '').localeCompare(a.last ?? ''));
  }, [db, q, user]);

  return (
    <>
      <PageHeader
        title="العملاء"
        description="ملف واحد لكل عميل يجمع معاملاته وتوكيلاته ومستحقاته"
        actions={
          can('clients.create') && (
            <Button icon={UserPlus} onClick={() => setAdding(true)}>
              إضافة عميل
            </Button>
          )
        }
      />
      <Card>
        <div className="border-b border-line p-3">
          <div className="w-full sm:w-80">
            <Input type="search" aria-label="بحث عن عميل" placeholder="الاسم أو الموبايل أو الرقم القومي كاملًا" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>
        {rows.length === 0 ? (
          <EmptyState icon={SearchX} title="لا يوجد عملاء مطابقون" />
        ) : (
          <TableWrap>
            <Table>
              <thead>
                <tr>
                  <Th>العميل</Th>
                  <Th>الموبايل</Th>
                  <Th>المعاملات</Th>
                  <Th>آخر نشاط</Th>
                  <Th className="text-end">مستحقات أتعاب</Th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ client, open, total, due, last }) => (
                  <Tr key={client.id} interactive onClick={() => navigate(`/app/clients/${client.id}`)}>
                    <Td>
                      <div className="flex items-center gap-3">
                        <Avatar name={client.full_name} />
                        <div>
                          <Link to={`/app/clients/${client.id}`} className="font-medium text-ink hover:underline" onClick={(e) => e.stopPropagation()}>
                            {client.business_name ?? client.full_name}
                          </Link>
                          <p className="flex items-center gap-1 text-xs text-ink-3">
                            {client.kind === 'business' ? <Building2 className="size-3" aria-hidden /> : <UserRound className="size-3" aria-hidden />}
                            {client.business_name ? client.full_name : 'فرد'}
                            {!client.national_id && (
                              <Badge tone="warning" size="sm" className="ms-1">
                                لم يُتحقق من الهوية
                              </Badge>
                            )}
                          </p>
                        </div>
                      </div>
                    </Td>
                    <Td className="ltr-nums">{formatPhone(client.phone)}</Td>
                    <Td>
                      <span className="tabular">{total}</span> <span className="text-xs text-ink-3">({open} مفتوحة)</span>
                    </Td>
                    <Td className="text-[13px]">{last ? formatShortDate(last) : '—'}</Td>
                    <Td className="text-end font-medium tabular">{due > 0 ? formatMoney(due) : <span className="text-ink-3">—</span>}</Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </TableWrap>
        )}
      </Card>
      {adding && <ClientFormDialog onClose={() => setAdding(false)} onSaved={(id) => navigate(`/app/clients/${id}`)} />}
    </>
  );
}
