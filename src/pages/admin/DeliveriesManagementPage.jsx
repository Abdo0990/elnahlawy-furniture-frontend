import { Edit3, MapPin, Plus, Trash2, Truck } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import DeliveryFormModal from '../../components/admin/DeliveryFormModal';
import api from '../../services/api';
import { formatDate } from '../../utils/formatters';

function DeliveriesManagementPage() {
  const [deliveries, setDeliveries] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, numberOfPages: 1 });
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [editingDelivery, setEditingDelivery] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deletingDelivery, setDeletingDelivery] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    api.get('/deliveries', { params: { page, limit: 9, sort: '-deliveredAt' } })
      .then((response) => { if (active) { setDeliveries(response.data.data); setPagination(response.data.pagination); } })
      .catch((error) => active && toast.error(error.message))
      .finally(() => active && setIsLoading(false));
    return () => { active = false; };
  }, [page, reloadKey]);

  const openCreate = () => { setEditingDelivery(null); setIsFormOpen(true); };
  const openEdit = (delivery) => { setEditingDelivery(delivery); setIsFormOpen(true); };
  const deleteDelivery = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/deliveries/${deletingDelivery._id}`);
      toast.success('تم حذف التسليم');
      setDeletingDelivery(null);
      setReloadKey((value) => value + 1);
    } catch (error) { toast.error(error.message); }
    finally { setIsDeleting(false); }
  };

  return (
    <>
      <AdminPageHeader eyebrow="معرض أعمالنا" title="التسليمات" description="أضف صور التسليمات الحقيقية التي تظهر للعملاء في المتجر." action={<button type="button" onClick={openCreate} className="inline-flex items-center justify-center gap-2 rounded-xl bg-charcoal px-5 py-3 text-sm font-bold text-white hover:bg-walnut-dark"><Plus size={18} /> تسليم جديد</button>} />
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {isLoading ? Array.from({ length: 6 }, (_, index) => <div key={index} className="aspect-[4/3] animate-pulse rounded-2xl bg-white" />) : deliveries.map((delivery) => <article key={delivery._id} className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm"><div className="relative aspect-[16/10] bg-stone-200">{delivery.images?.[0] && <img src={delivery.images[0]} alt={delivery.title} className="size-full object-cover" />}<span className="absolute bottom-3 left-3 rounded-full bg-black/60 px-2.5 py-1 text-xs text-white backdrop-blur">{delivery.images?.length || 0} صور</span></div><div className="p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h2 className="truncate font-extrabold">{delivery.title}</h2><p className="mt-1 flex items-center gap-1 text-xs text-stone-500"><MapPin size={13} />{delivery.location} · {formatDate(delivery.deliveredAt)}</p></div><div className="flex shrink-0 gap-1"><button type="button" onClick={() => openEdit(delivery)} className="grid size-9 place-items-center rounded-lg bg-walnut/10 text-walnut" aria-label="تعديل"><Edit3 size={15} /></button><button type="button" onClick={() => setDeletingDelivery(delivery)} className="grid size-9 place-items-center rounded-lg bg-red-50 text-red-600" aria-label="حذف"><Trash2 size={15} /></button></div></div>{delivery.description && <p className="mt-3 line-clamp-2 text-xs leading-6 text-stone-500">{delivery.description}</p>}</div></article>)}
      </div>
      {!isLoading && deliveries.length === 0 && <div className="rounded-2xl bg-white py-16 text-center text-stone-500"><Truck className="mx-auto mb-3" size={38} /><p>لا توجد تسليمات حتى الآن.</p></div>}
      {pagination.numberOfPages > 1 && <div className="mt-7 flex items-center justify-center gap-4 text-sm"><button disabled={!pagination.prev} onClick={() => setPage((value) => value - 1)} className="rounded-lg border bg-white px-4 py-2 disabled:opacity-30">السابق</button><span>{pagination.page} / {pagination.numberOfPages}</span><button disabled={!pagination.next} onClick={() => setPage((value) => value + 1)} className="rounded-lg border bg-white px-4 py-2 disabled:opacity-30">التالي</button></div>}
      <DeliveryFormModal isOpen={isFormOpen} delivery={editingDelivery} onClose={() => setIsFormOpen(false)} onSaved={() => setReloadKey((value) => value + 1)} />
      <ConfirmDialog isOpen={Boolean(deletingDelivery)} title="حذف التسليم؟" message={`سيتم حذف ${deletingDelivery?.title || 'التسليم'} وصوره نهائيًا.`} isLoading={isDeleting} onCancel={() => setDeletingDelivery(null)} onConfirm={deleteDelivery} />
    </>
  );
}

export default DeliveriesManagementPage;
