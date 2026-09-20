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
  const [existingImages, setExistingImages] = useState([]);
  const [isDraggingImages, setIsDraggingImages] = useState(false);
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
    setExistingImages(product?.images || []);
    setIsDraggingImages(false);
  }, [isOpen, product]);

  const addFiles = (selectedFiles) => {
    const selected = Array.from(selectedFiles || []);
    const allowedImages = selected.filter((file) => /^image\/(jpeg|png|webp)$/.test(file.type));
    const validSizeImages = allowedImages.filter((file) => file.size <= 5 * 1024 * 1024);

    if (allowedImages.length !== selected.length) toast.error('يسمح فقط بصور JPG أو PNG أو WebP');
    if (validSizeImages.length !== allowedImages.length) toast.error('حجم الصورة الواحدة يجب ألا يتجاوز 5MB');

    const knownFiles = new Set(files.map((file) => `${file.name}-${file.size}-${file.lastModified}`));
    const uniqueFiles = validSizeImages.filter((file) => {
      const key = `${file.name}-${file.size}-${file.lastModified}`;
      if (knownFiles.has(key)) return false;
      knownFiles.add(key);
      return true;
    });

    const availableSlots = Math.max(0, 5 - existingImages.length - files.length);
    if (uniqueFiles.length > availableSlots) {
      toast.error(availableSlots > 0 ? `تمت إضافة ${availableSlots} صور فقط لأن الحد الأقصى 5 صور` : 'وصلت للحد الأقصى وهو 5 صور');
    }

    if (availableSlots > 0) setFiles((currentFiles) => [...currentFiles, ...uniqueFiles.slice(0, availableSlots)]);
  };

  const selectFiles = (event) => {
    addFiles(event.target.files);
    event.target.value = '';
  };

  const dropFiles = (event) => {
    event.preventDefault();
    setIsDraggingImages(false);
    addFiles(event.dataTransfer.files);
  };

  const leaveDropZone = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setIsDraggingImages(false);
  };

  const removeNewImage = (indexToRemove) => {
    setFiles((currentFiles) => currentFiles.filter((_, index) => index !== indexToRemove));
  };

  const removeExistingImage = (imageToRemove) => {
    setExistingImages((currentImages) => currentImages.filter((image) => image !== imageToRemove));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (existingImages.length + files.length === 0) return toast.error('يجب الاحتفاظ بصورة واحدة أو إضافة صورة جديدة على الأقل');
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, String(value)));
    if (product) data.append('retainedImages', JSON.stringify(existingImages));
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
          <label onDragEnter={(event) => { event.preventDefault(); setIsDraggingImages(true); }} onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = 'copy'; setIsDraggingImages(true); }} onDragLeave={leaveDropZone} onDrop={dropFiles} className={`flex cursor-pointer items-center justify-between rounded-2xl border-2 border-dashed p-5 transition-all duration-200 ${isDraggingImages ? 'scale-[1.01] border-gold bg-gold/10 shadow-lg shadow-gold/10' : 'border-stone-300 bg-stone-50 hover:border-walnut hover:bg-walnut/5'}`}><span><strong className="block text-sm">{isDraggingImages ? 'اترك الصور هنا لإضافتها' : `اسحب الصور هنا أو اضغط للاختيار ${product ? '(اختياري)' : '*'}`}</strong><small className="mt-1 block text-stone-500">JPG أو PNG أو WebP — حتى 5 صور، 5MB للصورة</small></span><span className={`grid size-11 shrink-0 place-items-center rounded-xl transition ${isDraggingImages ? 'bg-gold text-charcoal' : 'bg-walnut/10 text-walnut'}`}><ImagePlus /></span><input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={selectFiles} className="sr-only" /></label>
          {(existingImages.length > 0 || previews.length > 0) && <div><div className="mb-2 flex items-center justify-between gap-3"><p className="text-xs font-bold text-stone-600">الصور الحالية والجديدة</p><span dir="ltr" className="rounded-full bg-walnut/10 px-2.5 py-1 text-xs font-bold text-walnut">{existingImages.length + previews.length} / 5</span></div><div className="flex gap-3 overflow-x-auto pb-2">
            {existingImages.map((image, index) => <div key={image} className="group relative shrink-0"><img src={image} alt={`صورة المنتج ${index + 1}`} className="size-20 rounded-xl border border-stone-200 object-cover" /><button type="button" onClick={() => removeExistingImage(image)} className="absolute -left-1.5 -top-1.5 grid size-7 place-items-center rounded-full border-2 border-white bg-red-600 text-white shadow-md transition hover:scale-110 hover:bg-red-700" aria-label={`حذف الصورة ${index + 1}`} title="حذف الصورة"><X size={14} strokeWidth={3} /></button></div>)}
            {previews.map((preview, index) => <div key={preview.url} className="group relative shrink-0"><img src={preview.url} alt={preview.name} className="size-20 rounded-xl border-2 border-gold/50 object-cover" /><span className="absolute bottom-1 right-1 rounded bg-charcoal/75 px-1.5 py-0.5 text-[9px] font-bold text-white">جديدة</span><button type="button" onClick={() => removeNewImage(index)} className="absolute -left-1.5 -top-1.5 grid size-7 place-items-center rounded-full border-2 border-white bg-red-600 text-white shadow-md transition hover:scale-110 hover:bg-red-700" aria-label={`إزالة الصورة الجديدة ${index + 1}`} title="إزالة الصورة"><X size={14} strokeWidth={3} /></button></div>)}
          </div></div>}
          <label className="flex items-center gap-3 text-sm font-bold"><input type="checkbox" checked={form.isAvailable} onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })} className="size-4 accent-walnut" /> المنتج متاح للطلب</label>
          <div className="flex justify-end gap-3 border-t border-stone-200 pt-5"><button type="button" onClick={onClose} className="rounded-xl border border-stone-300 px-5 py-3 text-sm font-bold">إلغاء</button><button disabled={isSubmitting} className="rounded-xl bg-charcoal px-6 py-3 text-sm font-bold text-white disabled:opacity-60">{isSubmitting ? 'جارٍ الحفظ...' : 'حفظ المنتج'}</button></div>
        </form></motion.div></div>}
    </AnimatePresence>
  );
}

export default ProductFormModal;
