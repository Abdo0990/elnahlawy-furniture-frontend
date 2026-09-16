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

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  const handleChange = ({ target: { name, value } }) => {
    setForm((current) => ({ ...current, [name]: value }));
  };

  const submitOrder = async (event) => {
    event.preventDefault();
    if (!items.length) return;

    setIsSubmitting(true);
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
      clearCart();
      toast.success('تم تسجيل طلبك بنجاح');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeDrawer = () => {
    setWhatsappUrl('');
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

                <form onSubmit={submitOrder} className="space-y-4 p-5 sm:p-7">
                  <div className="flex items-center justify-between text-lg font-extrabold text-charcoal">
                    <span>الإجمالي</span><span>{formatPrice(total)} ج.م</span>
                  </div>
                  <p className="text-xs leading-5 text-stone-500">سيتم تأكيد التفاصيل وموعد التسليم معك عبر واتساب.</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input name="customerName" value={form.customerName} onChange={handleChange} minLength={3} required placeholder="الاسم بالكامل" className="form-field" />
                    <input name="customerPhone" value={form.customerPhone} onChange={handleChange} required inputMode="tel" placeholder="رقم الموبايل" className="form-field" />
                    <input name="city" value={form.city} onChange={handleChange} required placeholder="المدينة / المحافظة" className="form-field" />
                    <input name="details" value={form.details} onChange={handleChange} required placeholder="العنوان بالتفصيل" className="form-field" />
                  </div>
                  <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} placeholder="ملاحظات إضافية (اختياري)" className="form-field resize-none" />
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
