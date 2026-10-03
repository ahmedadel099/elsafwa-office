import { useMemo, useState } from 'react';
import { FileImage, FileText, FolderSearch } from 'lucide-react';
import { useUser } from '../app/AuthContext';
import { useDb } from '../data/hooks';
import { formatDateTime, formatFileSize } from '../lib/format';
import { Link } from '../lib/router';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { EmptyState } from '../ui/Feedback';
import { Input } from '../ui/Field';
import { PageHeader, Table, TableWrap, Td, Th } from '../ui/Layout';
import { Tabs } from '../ui/Tabs';

type View = 'all' | 'held' | 'returned';

/** Office-wide archive: every file across requests, and the originals the office currently holds. */
export function DocumentsPage() {
  const user = useUser();
  const db = useDb();
  const [view, setView] = useState<View>('all');
  const [q, setQ] = useState('');

  const rows = useMemo(() => {
    const requests = new Map(db.requests.filter((r) => user.role === 'admin' || r.branch_id === user.branch_id).map((r) => [r.id, r]));
    const clients = new Map(db.clients.map((c) => [c.id, c]));
    return db.documents
      .filter((d) => requests.has(d.request_id))
      .map((d) => {
        const request = requests.get(d.request_id)!;
        return { doc: d, request, client: clients.get(request.client_id) };
      })
      .filter(({ doc }) => (view === 'held' ? doc.original_held && !doc.returned_at : view === 'returned' ? Boolean(doc.returned_at) : true))
      .filter(({ doc, request, client }) => !q.trim() || doc.doc_type.includes(q.trim()) || request.ref.includes(q.trim().toUpperCase()) || (client?.full_name ?? '').includes(q.trim()))
      .sort((a, b) => b.doc.uploaded_at.localeCompare(a.doc.uploaded_at));
  }, [db, user, view, q]);

  const heldCount = db.documents.filter((d) => d.original_held && !d.returned_at && db.requests.some((r) => r.id === d.request_id && (user.role === 'admin' || r.branch_id === user.branch_id))).length;

  return (
    <>
      <PageHeader title="أرشيف المستندات" description="كل الملفات المرفوعة على المعاملات، والأصول المحفوظة لدى المكتب حتى ردّها لأصحابها" />
      <Card>
        <Tabs
          label="عرض المستندات"
          value={view}
          onChange={setView}
          className="px-3"
          items={[
            { id: 'all', label: 'كل المستندات' },
            { id: 'held', label: 'أصول لدى المكتب', count: heldCount },
            { id: 'returned', label: 'أصول تم ردّها' },
          ]}
        />
        <div className="border-b border-line p-3">
          <div className="w-full sm:w-80">
            <Input type="search" aria-label="بحث في المستندات" placeholder="نوع المستند، رقم المعاملة، أو اسم العميل" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>
        {rows.length === 0 ? (
          <EmptyState icon={FolderSearch} title="لا توجد مستندات هنا" />
        ) : (
          <TableWrap>
            <Table>
              <thead>
                <tr>
                  <Th>المستند</Th>
                  <Th>المعاملة</Th>
                  <Th>العميل</Th>
                  <Th>رُفع بواسطة</Th>
                  <Th>الأصل</Th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ doc, request, client }) => {
                  const Icon = doc.mime.startsWith('image/') ? FileImage : FileText;
                  return (
                    <tr key={doc.id}>
                      <Td>
                        <div className="flex items-center gap-3">
                          <Icon className="size-5 shrink-0 text-danger" aria-hidden />
                          <div>
                            <p className="font-medium text-ink">{doc.doc_type}</p>
                            <p className="text-xs text-ink-3">{formatFileSize(doc.size)}</p>
                          </div>
                        </div>
                      </Td>
                      <Td>
                        <Link to={`/app/requests/${request.id}`} className="ltr-nums font-medium whitespace-nowrap text-brand-ink hover:underline">
                          {request.ref}
                        </Link>
                      </Td>
                      <Td className="whitespace-nowrap">{client?.business_name ?? client?.full_name}</Td>
                      <Td className="text-[13px] whitespace-nowrap">
                        {db.profiles.find((p) => p.id === doc.uploaded_by)?.full_name}
                        <p className="text-xs text-ink-3">{formatDateTime(doc.uploaded_at)}</p>
                      </Td>
                      <Td>
                        {doc.original_held ? (
                          doc.returned_at ? (
                            <Badge tone="neutral" size="sm">
                              رُدّ {formatDateTime(doc.returned_at)}
                            </Badge>
                          ) : (
                            <Badge tone="accent" size="sm">
                              الأصل لدى المكتب
                            </Badge>
                          )
                        ) : (
                          <span className="text-[13px] text-ink-3">صورة فقط</span>
                        )}
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </TableWrap>
        )}
      </Card>
    </>
  );
}
