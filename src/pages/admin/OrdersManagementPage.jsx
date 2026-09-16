import { ClipboardList, Phone, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import SelectMenu from '../../components/ui/SelectMenu';
import api from '../../services/api';
import { formatDateTime, formatPrice } from '../../utils/formatters';

const statuses = ['معلق', 'تم التواصل', 'قيد التنفيذ', 'تم التسليم', 'ملغي'];
const statusTabs = [
  { value: 'الكل', label: 'كل الطلبات' },
  ...statuses.map((status) => ({ value: status, label: status })),
];
const statusStyles = {
  'معلق': 'bg-amber-100 text-amber-800',
  'تم التواصل': 'bg-blue-100 text-blue-800',
  'قيد التنفيذ': 'bg-violet-100 text-violet-800',
  'تم التسليم': 'bg-emerald-100 text-emerald-800',
  'ملغي': 'bg-red-100 text-red-700',
};

function OrdersManagementPage() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, numberOfPages: 1 });
  const [statusCounts, setStatusCounts] = useState({ total: 0, counts: {} });
  const [statusFilter, setStatusFilter] = useState('الكل');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [countsReloadKey, setCountsReloadKey] = useState(0);
  const [updatingId, setUpdatingId] = useState('');
  const [deletingOrder, setDeletingOrder] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let active = true;
    setIsLoading(true);

    api.get('/orders', {
      params: {
        page,
        limit: 10,
        sort: '-createdAt',
        ...(statusFilter !== 'الكل' && { status: statusFilter }),
      },
    })
      .then((response) => {
        if (!active) return;
        setOrders(response.data.data);
        setPagination(response.data.pagination);
      })
      .catch((error) => active && toast.error(error.message))
      .finally(() => active && setIsLoading(false));

    return () => {
      active = false;
    };
  }, [page, reloadKey, statusFilter]);

  useEffect(() => {
    let active = true;
    api.get('/orders/status-counts')
      .then((response) => active && setStatusCounts(response.data.data))
      .catch((error) => active && toast.error(error.message));
    return () => {
      active = false;
    };
  }, [countsReloadKey]);

  const selectStatusFilter = (status) => {
    setStatusFilter(status);
    setPage(1);
  };

  const updateStatus = async (order, status) => {
    const previousStatus = order.status;
    setUpdatingId(order._id);
    setOrders((current) => current.map((item) =>
      item._id === order._id ? { ...item, status } : item,
    ));

    try {
      await api.put(`/orders/${order._id}/status`, { status });
      toast.success('تم تحديث حالة الطلب');
      setReloadKey((value) => value + 1);
      setCountsReloadKey((value) => value + 1);
    } catch (error) {
      setOrders((current) => current.map((item) =>
        item._id === order._id ? { ...item, status: previousStatus } : item,
      ));
      toast.error(error.message);
    } finally {
      setUpdatingId('');
    }
  };

  const deleteOrder = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/orders/${deletingOrder._id}`);
      toast.success('تم حذف الطلب');
      setDeletingOrder(null);
      if (orders.length === 1 && page > 1) {
        setPage((value) => value - 1);
      } else {
        setReloadKey((value) => value + 1);
      }
      setCountsReloadKey((value) => value + 1);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <AdminPageHeader
        eyebrow="متابعة العملاء"
        title="الطلبات"
        description="تابع الطلبات وحدّث حالتها بعد التواصل مع العميل."
      />

      <div className="mb-5">
        <p className="mb-2 text-xs font-bold text-stone-500">فلترة حسب حالة الطلب</p>
        <div className="scrollbar-none flex items-center gap-2 overflow-x-auto px-1 py-2 whitespace-nowrap">
          {statusTabs.map((tab) => {
            const count = tab.value === 'الكل'
              ? statusCounts.total
              : statusCounts.counts?.[tab.value] || 0;
            const isActive = statusFilter === tab.value;

            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => selectStatusFilter(tab.value)}
                className={`focus-ring flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-xs font-bold transition-all duration-200 ${isActive ? 'bg-charcoal text-white shadow-lg shadow-charcoal/15' : 'border border-stone-200 bg-white text-stone-600 hover:border-walnut hover:text-walnut'}`}
              >
                {tab.label}
                <span className={`grid min-w-6 place-items-center rounded-full px-1.5 py-0.5 text-[0.65rem] ${isActive ? 'bg-white/15 text-white' : 'bg-stone-100 text-stone-600'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-right text-sm">
            <thead className="bg-stone-50 text-xs text-stone-500">
              <tr>
                <th className="px-5 py-4">العميل</th>
                <th className="px-5 py-4">العنوان والمنتجات</th>
                <th className="px-5 py-4">الإجمالي</th>
                <th className="px-5 py-4">التاريخ</th>
                <th className="px-5 py-4">الحالة</th>
                <th className="px-5 py-4">حذف</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {isLoading
                ? Array.from({ length: 6 }, (_, index) => (
                    <tr key={index}>
                      {Array.from({ length: 6 }, (_, cell) => (
                        <td key={cell} className="px-5 py-5">
                          <div className="h-5 animate-pulse rounded bg-stone-100" />
                        </td>
                      ))}
                    </tr>
                  ))
                : orders.map((order) => (
                    <tr key={order._id} className="align-top hover:bg-stone-50/60">
                      <td className="px-5 py-4">
                        <strong className="block">{order.customerName}</strong>
                        <a href={`tel:${order.customerPhone}`} className="mt-1 flex items-center gap-1 text-xs text-walnut">
                          <Phone size={12} />{order.customerPhone}
                        </a>
                      </td>
                      <td className="px-5 py-4">
                        <details>
                          <summary className="cursor-pointer font-bold text-walnut">{order.items.length} قطع — عرض التفاصيل</summary>
                          <div className="mt-3 max-w-xs space-y-2 rounded-xl bg-stone-50 p-3 text-xs leading-5">
                            <p><strong>العنوان:</strong> {order.address.city}، {order.address.details}</p>
                            {order.items.map((item) => <p key={`${item.product}-${item.name}`}>{item.name} × {item.quantity}</p>)}
                            {order.notes && <p><strong>ملاحظات:</strong> {order.notes}</p>}
                          </div>
                        </details>
                      </td>
                      <td className="px-5 py-4 font-extrabold">{formatPrice(order.totalPrice)} ج.م</td>
                      <td className="px-5 py-4 text-xs text-stone-500">{formatDateTime(order.createdAt)}</td>
                      <td className="px-5 py-4">
                        <SelectMenu
                          disabled={updatingId === order._id}
                          value={order.status}
                          options={statuses}
                          onChange={(status) => updateStatus(order, status)}
                          buttonClassName={`min-w-40 rounded-full border-0 py-2 text-xs shadow-none ${statusStyles[order.status] || 'bg-stone-100'}`}
                        />
                      </td>
                      <td className="px-5 py-4">
                        <button type="button" onClick={() => setDeletingOrder(order)} className="grid size-9 place-items-center rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white" aria-label="حذف الطلب">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {!isLoading && orders.length === 0 && (
          <div className="py-16 text-center text-stone-500">
            <ClipboardList className="mx-auto mb-3" size={38} />
            <p>{statusFilter === 'الكل' ? 'لا توجد طلبات حتى الآن.' : `لا توجد طلبات بحالة «${statusFilter}».`}</p>
          </div>
        )}

        {!isLoading && pagination.numberOfPages > 1 && (
          <div className="flex items-center justify-between border-t border-stone-200 px-5 py-4 text-sm">
            <button disabled={!pagination.prev} onClick={() => setPage((value) => value - 1)} className="rounded-lg border px-4 py-2 disabled:opacity-30">السابق</button>
            <span>{pagination.page} / {pagination.numberOfPages}</span>
            <button disabled={!pagination.next} onClick={() => setPage((value) => value + 1)} className="rounded-lg border px-4 py-2 disabled:opacity-30">التالي</button>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={Boolean(deletingOrder)}
        title="حذف الطلب؟"
        message={`سيتم حذف طلب ${deletingOrder?.customerName || 'العميل'} من الأرشيف نهائيًا.`}
        isLoading={isDeleting}
        onCancel={() => setDeletingOrder(null)}
        onConfirm={deleteOrder}
      />
    </>
  );
}

export default OrdersManagementPage;
