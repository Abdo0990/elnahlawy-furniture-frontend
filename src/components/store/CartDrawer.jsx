import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useCart } from '../../context/CartContext';
import api from '../../services/api';

const initialForm = {
  customerName: '',
  customerPhone: '',
  city: '',
  details: '',
  notes: '',
};

const egyptianMobilePattern = /^(?:01[0125]\d{8}|(?:\+20|20|0020)1[0125]\d{8})$/;

const validateOrderForm = (form, items) => {
  const errors = {};
  const normalizedPhone = form.customerPhone.replace(/[\s()-]/g, '');

  if (!form.customerName.trim()) errors.customerName = 'الاسم مطلوب';
  else if (form.customerName.trim().length < 3) errors.customerName = 'الاسم يجب أن يكون 3 أحرف على الأقل';
  else if (form.customerName.trim().length > 100) errors.customerName = 'الاسم يجب ألا يتجاوز 100 حرف';

  if (!normalizedPhone) errors.customerPhone = 'رقم الموبايل مطلوب';
  else if (!egyptianMobilePattern.test(normalizedPhone)) errors.customerPhone = 'أدخل رقم موبايل مصري صحيح مثل 01012345678';

  if (!form.city.trim()) errors.city = 'المدينة أو المحافظة مطلوبة';
  else if (form.city.trim().length > 100) errors.city = 'اسم المدينة طويل جداً';

  if (!form.details.trim()) errors.details = 'العنوان بالتفصيل مطلوب';
  else if (form.details.trim().length < 5) errors.details = 'يرجى كتابة عنوان أكثر تفصيلاً';
  else if (form.details.trim().length > 300) errors.details = 'العنوان يجب ألا يتجاوز 300 حرف';

  if (form.notes.trim().length > 500) errors.notes = 'الملاحظات يجب ألا تتجاوز 500 حرف';
  if (!items.length) errors.items = 'اختر منتجًا واحدًا على الأقل';

  return errors;
};

const serverFieldMap = {
  'address.city': 'city',
  'address.details': 'details',
};

const formatPrice = (value) =>
  new Intl.NumberFormat('ar-EG').format(Number(value || 0));

function CartDrawer({ isOpen, onClose }) {
  const {
    items,
    itemCount,
    total,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  const handleChange = ({ target: { name, value } }) => {
    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: undefined }));
  };

  const submitOrder = async (event) => {
    event.preventDefault();
    if (!items.length) return;

    const validationErrors = validateOrderForm(form, items);
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      toast.error(Object.values(validationErrors)[0]);
      return;
    }

    setIsSubmitting(true);
    setFieldErrors({});
    try {
      const response = await api.post('/orders', {
        customerName: form.customerName.trim(),
        customerPhone: form.customerPhone.trim(),
        address: {
          city: form.city.trim(),
          details: form.details.trim(),
        },
        items: items.map((item) => ({
          product: item._id,
          quantity: item.quantity,
        })),
        notes: form.notes.trim(),
      });

      setWhatsappUrl(response.data.data.whatsappUrl);
      setForm(initialForm);
      setFieldErrors({});
      clearCart();
      toast.success('تم تسجيل طلبك بنجاح');
    } catch (error) {
      if (error.errors?.length) {
        const serverErrors = {};
        error.errors.forEach(({ field, message }) => {
          const mappedField = serverFieldMap[field] || field;
          if (!serverErrors[mappedField]) serverErrors[mappedField] = message;
        });
        setFieldErrors(serverErrors);
      }
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeDrawer = () => {
    setWhatsappUrl('');
    setFieldErrors({});
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="طلبك">
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
            aria-label="إغلاق الطلب"
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="absolute inset-y-0 right-0 flex w-full max-w-lg flex-col bg-cream shadow-2xl"
          >
            <div className="flex h-20 shrink-0 items-center justify-between border-b border-stone-200 px-5 sm:px-7">
              <div>
                <h2 className="text-lg font-extrabold text-charcoal">طلبك</h2>
                <p className="text-xs text-stone-500">{itemCount} منتجات</p>
              </div>
              <button type="button" onClick={closeDrawer} className="focus-ring grid size-10 place-items-center rounded-full text-stone-600 hover:bg-stone-200/70" aria-label="إغلاق">
                <X size={21} />
              </button>
            </div>

            {whatsappUrl ? (
              <div className="grid flex-1 place-content-center px-6 text-center">
                <span className="mx-auto grid size-20 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                  <CheckCircle2 size={38} strokeWidth={1.6} />
                </span>
                <h3 className="mt-6 text-xl font-extrabold text-charcoal">تم تسجيل طلبك</h3>
                <p className="mt-3 max-w-sm text-sm leading-7 text-stone-600">
                  اضغط الزر التالي لإرسال تفاصيل الطلب إلى المعرض عبر واتساب وتأكيده.
                </p>
                <a href={whatsappUrl} className="focus-ring mt-7 rounded-full bg-[#128C7E] px-8 py-3.5 font-bold text-white hover:bg-[#0d766a]">
                  متابعة عبر واتساب
                </a>
              </div>
            ) : items.length === 0 ? (
              <div className="grid flex-1 place-content-center px-6 text-center">
                <span className="mx-auto grid size-16 place-items-center rounded-full bg-walnut/10 text-walnut">
                  <ShoppingBag size={28} strokeWidth={1.5} />
                </span>
                <h3 className="mt-5 font-bold text-charcoal">طلبك فارغ حاليًا</h3>
                <p className="mt-2 text-sm leading-6 text-stone-500">اختر القطع التي تناسب بيتك وسنجهز لك الطلب.</p>
                <button type="button" onClick={onClose} className="focus-ring mx-auto mt-6 rounded-full bg-charcoal px-6 py-3 text-sm font-bold text-white hover:bg-walnut-dark">
                  تصفح المنتجات
                </button>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                <div className="space-y-4 border-b border-stone-200 p-5 sm:p-7">
                  {items.map((item) => (
                    <article key={item._id} className="flex gap-3 rounded-2xl bg-white p-3 shadow-sm">
                      <div className="size-20 shrink-0 overflow-hidden rounded-xl bg-stone-200">
                        {item.images?.[0] && <img src={item.images[0]} alt={item.name} className="size-full object-cover" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="truncate text-sm font-bold text-charcoal">{item.name}</h3>
                          <button type="button" onClick={() => removeItem(item._id)} className="text-stone-400 hover:text-red-600" aria-label={`حذف ${item.name}`}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <p className="mt-1 text-sm font-bold text-walnut">{formatPrice(item.price)} ج.م</p>
                        <div className="mt-2 flex w-fit items-center rounded-full border border-stone-200">
                          <button type="button" onClick={() => updateQuantity(item._id, item.quantity - 1)} disabled={item.quantity === 1} className="grid size-7 place-items-center disabled:opacity-30" aria-label="تقليل الكمية"><Minus size={13} /></button>
                          <span className="min-w-7 text-center text-xs font-bold">{item.quantity}</span>
                          <button type="button" onClick={() => updateQuantity(item._id, item.quantity + 1)} className="grid size-7 place-items-center" aria-label="زيادة الكمية"><Plus size={13} /></button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                <form onSubmit={submitOrder} noValidate className="space-y-4 p-5 sm:p-7">
                  <div className="flex items-center justify-between text-lg font-extrabold text-charcoal">
                    <span>الإجمالي</span><span>{formatPrice(total)} ج.م</span>
                  </div>
                  <p className="text-xs leading-5 text-stone-500">سيتم تأكيد التفاصيل وموعد التسليم معك عبر واتساب.</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block">
                      <span className="sr-only">الاسم بالكامل</span>
                      <input name="customerName" value={form.customerName} onChange={handleChange} maxLength={100} aria-invalid={Boolean(fieldErrors.customerName)} placeholder="الاسم بالكامل" className={`form-field ${fieldErrors.customerName ? 'border-red-400' : ''}`} />
                      {fieldErrors.customerName && <small className="mt-1 block px-1 text-[0.68rem] text-red-600">{fieldErrors.customerName}</small>}
                    </label>
                    <label className="block">
                      <span className="sr-only">رقم الموبايل</span>
                      <input name="customerPhone" value={form.customerPhone} onChange={handleChange} inputMode="tel" maxLength={18} aria-invalid={Boolean(fieldErrors.customerPhone)} placeholder="رقم الموبايل" className={`form-field ${fieldErrors.customerPhone ? 'border-red-400' : ''}`} />
                      {fieldErrors.customerPhone && <small className="mt-1 block px-1 text-[0.68rem] text-red-600">{fieldErrors.customerPhone}</small>}
                    </label>
                    <label className="block">
                      <span className="sr-only">المدينة أو المحافظة</span>
                      <input name="city" value={form.city} onChange={handleChange} maxLength={100} aria-invalid={Boolean(fieldErrors.city)} placeholder="المدينة / المحافظة" className={`form-field ${fieldErrors.city ? 'border-red-400' : ''}`} />
                      {fieldErrors.city && <small className="mt-1 block px-1 text-[0.68rem] text-red-600">{fieldErrors.city}</small>}
                    </label>
                    <label className="block">
                      <span className="sr-only">العنوان بالتفصيل</span>
                      <input name="details" value={form.details} onChange={handleChange} maxLength={300} aria-invalid={Boolean(fieldErrors.details)} placeholder="العنوان بالتفصيل" className={`form-field ${fieldErrors.details ? 'border-red-400' : ''}`} />
                      {fieldErrors.details && <small className="mt-1 block px-1 text-[0.68rem] text-red-600">{fieldErrors.details}</small>}
                    </label>
                  </div>
                  <label className="block">
                    <span className="sr-only">ملاحظات إضافية</span>
                    <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} maxLength={500} aria-invalid={Boolean(fieldErrors.notes)} placeholder="ملاحظات إضافية (اختياري)" className={`form-field resize-none ${fieldErrors.notes ? 'border-red-400' : ''}`} />
                    {fieldErrors.notes && <small className="mt-1 block px-1 text-[0.68rem] text-red-600">{fieldErrors.notes}</small>}
                  </label>
                  <button disabled={isSubmitting} className="focus-ring w-full rounded-full bg-charcoal px-6 py-3.5 font-bold text-white transition-colors hover:bg-walnut-dark disabled:cursor-wait disabled:opacity-60">
                    {isSubmitting ? 'جارٍ تسجيل الطلب...' : 'تأكيد الطلب عبر واتساب'}
                  </button>
                </form>
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

export default CartDrawer;
