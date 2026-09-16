import { Edit3, PackageOpen, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import ProductFormModal from '../../components/admin/ProductFormModal';
import api from '../../services/api';
import { formatPrice } from '../../utils/formatters';

function ProductsManagementPage() {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, numberOfPages: 1 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [keyword, setKeyword] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => { setKeyword(search.trim()); setPage(1); }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    api.get('/products', { params: { page, limit: 10, ...(keyword && { keyword }) } })
      .then((response) => { if (active) { setProducts(response.data.data); setPagination(response.data.pagination); } })
      .catch((error) => active && toast.error(error.message))
      .finally(() => active && setIsLoading(false));
    return () => { active = false; };
  }, [keyword, page, reloadKey]);

  const openCreate = () => { setEditingProduct(null); setIsFormOpen(true); };
  const openEdit = (product) => { setEditingProduct(product); setIsFormOpen(true); };
  const deleteProduct = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/products/${deletingProduct._id}`);
      toast.success('تم حذف المنتج');
      setDeletingProduct(null);
      setReloadKey((value) => value + 1);
    } catch (error) { toast.error(error.message); }
    finally { setIsDeleting(false); }
  };

  return (
    <>
      <AdminPageHeader eyebrow="إدارة الكتالوج" title="المنتجات" description="أضف قطع الأثاث وحدّث تفاصيلها وتوفرها." action={<button type="button" onClick={openCreate} className="inline-flex items-center justify-center gap-2 rounded-xl bg-charcoal px-5 py-3 text-sm font-bold text-white hover:bg-walnut-dark"><Plus size={18} /> منتج جديد</button>} />
      <div className="rounded-2xl border border-stone-200 bg-white shadow-sm">
        <div className="border-b border-stone-200 p-4"><label className="relative block max-w-sm"><Search className="absolute top-1/2 right-4 -translate-y-1/2 text-stone-400" size={17} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث عن منتج..." className="form-field pr-10" /></label></div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-right text-sm">
            <thead className="bg-stone-50 text-xs text-stone-500"><tr><th className="px-5 py-4">المنتج</th><th className="px-5 py-4">القسم</th><th className="px-5 py-4">السعر</th><th className="px-5 py-4">التوفر</th><th className="px-5 py-4">الإجراءات</th></tr></thead>
            <tbody className="divide-y divide-stone-100">
              {isLoading ? Array.from({ length: 5 }, (_, index) => <tr key={index}>{Array.from({ length: 5 }, (_, cell) => <td key={cell} className="px-5 py-4"><div className="h-5 animate-pulse rounded bg-stone-100" /></td>)}</tr>) : products.map((product) => <tr key={product._id} className="hover:bg-stone-50/70"><td className="px-5 py-4"><div className="flex items-center gap-3"><div className="size-12 overflow-hidden rounded-xl bg-stone-100">{product.images?.[0] && <img src={product.images[0]} alt="" className="size-full object-cover" />}</div><div><strong className="block max-w-[14rem] truncate">{product.name}</strong><small className="text-stone-500">{product.woodType}</small></div></div></td><td className="px-5 py-4 text-stone-600">{product.category}</td><td className="px-5 py-4 font-bold">{formatPrice(product.price)} ج.م</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${product.isAvailable ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-200 text-stone-600'}`}>{product.isAvailable ? 'متاح' : 'غير متاح'}</span></td><td className="px-5 py-4"><div className="flex gap-2"><button type="button" onClick={() => openEdit(product)} className="grid size-9 place-items-center rounded-lg bg-walnut/10 text-walnut hover:bg-walnut hover:text-white" aria-label="تعديل"><Edit3 size={16} /></button><button type="button" onClick={() => setDeletingProduct(product)} className="grid size-9 place-items-center rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white" aria-label="حذف"><Trash2 size={16} /></button></div></td></tr>)}
            </tbody>
          </table>
        </div>
        {!isLoading && products.length === 0 && <div className="py-14 text-center text-stone-500"><PackageOpen className="mx-auto mb-3" size={34} /><p>لا توجد منتجات.</p></div>}
        {pagination.numberOfPages > 1 && <div className="flex items-center justify-between border-t border-stone-200 px-5 py-4 text-sm"><button disabled={!pagination.prev} onClick={() => setPage((value) => value - 1)} className="rounded-lg border px-4 py-2 disabled:opacity-30">السابق</button><span>{pagination.page} / {pagination.numberOfPages}</span><button disabled={!pagination.next} onClick={() => setPage((value) => value + 1)} className="rounded-lg border px-4 py-2 disabled:opacity-30">التالي</button></div>}
      </div>
      <ProductFormModal isOpen={isFormOpen} product={editingProduct} onClose={() => setIsFormOpen(false)} onSaved={() => setReloadKey((value) => value + 1)} />
      <ConfirmDialog isOpen={Boolean(deletingProduct)} title="حذف المنتج؟" message={`سيتم حذف ${deletingProduct?.name || 'المنتج'} وصوره نهائيًا.`} isLoading={isDeleting} onCancel={() => setDeletingProduct(null)} onConfirm={deleteProduct} />
    </>
  );
}

export default ProductsManagementPage;
