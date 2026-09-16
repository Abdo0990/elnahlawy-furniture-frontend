import { AnimatePresence, motion } from 'framer-motion';
import { ImagePlus, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { PRODUCT_CATEGORIES } from '../../constants/productCategories';
import api from '../../services/api';
import SelectMenu from '../ui/SelectMenu';

const emptyForm = { name: '', description: '', price: '', category: 'غرف نوم', woodType: '', dimensions: '', isAvailable: true };

function ProductFormModal({ isOpen, product, onClose, onSaved }) {
  const [form, setForm] = useState(emptyForm);
  const [files, setFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const previews = useMemo(() => files.map((file) => ({ name: file.name, url: URL.createObjectURL(file) })), [files]);

  useEffect(() => () => previews.forEach((preview) => URL.revokeObjectURL(preview.url)), [previews]);
  useEffect(() => {
    if (!isOpen) return;
    setForm(product ? {
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      woodType: product.woodType,
      dimensions: product.dimensions || '',
      isAvailable: product.isAvailable,
    } : emptyForm);
    setFiles([]);
  }, [isOpen, product]);

  const selectFiles = (event) => {
    const selected = Array.from(event.target.files || []);
    if (selected.length > 5) return toast.error('الحد الأقصى 5 صور');
    setFiles(selected);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!product && files.length === 0) return toast.error('اختر صورة واحدة على الأقل');
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, String(value)));
    files.forEach((file) => data.append('images', file));
    setIsSubmitting(true);
    try {
      const response = product
        ? await api.put(`/products/${product._id}`, data)
        : await api.post('/products', data);
      toast.success(product ? 'تم تحديث المنتج' : 'تمت إضافة المنتج');
      onSaved(response.data.data);
      onClose();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && <div className="fixed inset-0 z-[60] overflow-y-auto p-3 sm:p-6" role="dialog" aria-modal="true"><motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/65 backdrop-blur-sm" aria-label="إغلاق" /><motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="relative mx-auto my-4 w-full max-w-3xl rounded-3xl bg-white shadow-2xl"><header className="flex items-center justify-between border-b border-stone-200 px-5 py-5 sm:px-7"><div><h2 className="text-xl font-extrabold">{product ? 'تعديل المنتج' : 'إضافة منتج جديد'}</h2><p className="mt-1 text-xs text-stone-500">الحقول المميزة مطلوبة</p></div><button type="button" onClick={onClose} className="grid size-10 place-items-center rounded-full bg-stone-100"><X size={19} /></button></header>
        <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-7">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="admin-label sm:col-span-2">اسم المنتج *<input required minLength={3} maxLength={100} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="form-field mt-2" /></label>
            <label className="admin-label">السعر بالجنيه *<input required min={0} type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="form-field mt-2" /></label>
            <div className="admin-label"><span>القسم *</span><SelectMenu value={form.category} options={PRODUCT_CATEGORIES} onChange={(category) => setForm({ ...form, category })} className="mt-2" /></div>
            <label className="admin-label">نوع الخشب *<input required value={form.woodType} onChange={(e) => setForm({ ...form, woodType: e.target.value })} className="form-field mt-2" /></label>
            <label className="admin-label">المقاسات<input value={form.dimensions} onChange={(e) => setForm({ ...form, dimensions: e.target.value })} className="form-field mt-2" placeholder="مثال: 200 × 180 سم" /></label>
            <label className="admin-label sm:col-span-2">الوصف *<textarea required minLength={10} rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="form-field mt-2 resize-none" /></label>
          </div>
          <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-5 hover:border-walnut"><span><strong className="block text-sm">صور المنتج {product ? '(اختياري)' : '*'}</strong><small className="mt-1 block text-stone-500">JPG أو PNG أو WebP — حتى 5 صور، 5MB للصورة</small></span><ImagePlus className="text-walnut" /><input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={selectFiles} className="sr-only" /></label>
          {files.length > 0 && <div><p className="mb-2 text-xs font-bold text-amber-700">{product && 'الصور الجديدة ستستبدل الصور الحالية بالكامل'}</p><div className="flex gap-2 overflow-x-auto">{previews.map((preview) => <img key={preview.url} src={preview.url} alt={preview.name} className="size-20 rounded-xl object-cover" />)}</div></div>}
          {product && files.length === 0 && product.images?.length > 0 && <div className="flex gap-2 overflow-x-auto">{product.images.map((image) => <img key={image} src={image} alt="" className="size-16 rounded-xl object-cover opacity-70" />)}</div>}
          <label className="flex items-center gap-3 text-sm font-bold"><input type="checkbox" checked={form.isAvailable} onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })} className="size-4 accent-walnut" /> المنتج متاح للطلب</label>
          <div className="flex justify-end gap-3 border-t border-stone-200 pt-5"><button type="button" onClick={onClose} className="rounded-xl border border-stone-300 px-5 py-3 text-sm font-bold">إلغاء</button><button disabled={isSubmitting} className="rounded-xl bg-charcoal px-6 py-3 text-sm font-bold text-white disabled:opacity-60">{isSubmitting ? 'جارٍ الحفظ...' : 'حفظ المنتج'}</button></div>
        </form></motion.div></div>}
    </AnimatePresence>
  );
}

export default ProductFormModal;
