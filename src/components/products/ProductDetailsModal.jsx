import { AnimatePresence, motion } from 'framer-motion';
import { Maximize2, MessageCircle, ShoppingBag, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useCart } from '../../context/CartContext';
import { getWhatsAppShareUrl } from '../../config/site';
import useBodyScrollLock from '../../hooks/useBodyScrollLock';
import api from '../../services/api';
import { formatPrice } from '../../utils/formatters';

function ProductDetailsModal({ productId, onClose }) {
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useBodyScrollLock(Boolean(productId));

  useEffect(() => {
    if (!productId) return;
    const controller = new AbortController();
    let active = true;
    setIsLoading(true);
    setActiveImage(0);

    api.get(`/products/${productId}`, { signal: controller.signal })
      .then((response) => active && setProduct(response.data.data))
      .catch((error) => {
        if (active && error.originalError?.code !== 'ERR_CANCELED') toast.error(error.message);
      })
      .finally(() => active && setIsLoading(false));

    return () => {
      active = false;
      controller.abort();
    };
  }, [productId]);

  useEffect(() => {
    if (!productId) return;
    const onKeyDown = (event) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [productId, onClose]);

  const shareUrl = product
    ? getWhatsAppShareUrl([
        `شاهد ${product.name} من معرض النحلاوي للأثاث`,
        `الفئة: ${product.category}`,
        `السعر: ${formatPrice(product.price)} ج.م`,
        product.images?.[0] ? `الصورة: ${product.images[0]}` : '',
        `المتجر: ${window.location.origin}/#products`,
      ].filter(Boolean).join('\n'))
    : '#';

  return (
    <AnimatePresence>
      {productId && (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto p-3 sm:p-6" role="dialog" aria-modal="true">
          <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/70 backdrop-blur-sm" aria-label="إغلاق التفاصيل" />
          <motion.div initial={{ opacity: 0, y: 30, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20 }} className="relative my-auto w-full max-w-5xl overflow-hidden rounded-3xl bg-cream shadow-2xl">
            <button type="button" onClick={onClose} className="focus-ring absolute top-4 left-4 z-10 grid size-10 place-items-center rounded-full bg-white/90 text-charcoal shadow-md" aria-label="إغلاق"><X size={20} /></button>

            {isLoading || !product ? (
              <div className="grid min-h-[28rem] place-content-center"><span className="loading-ring" /></div>
            ) : (
              <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
                <div className="bg-stone-200 p-3 sm:p-5">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-stone-200">
                    {product.images?.[activeImage] ? (
                      <>
                        <img src={product.images[activeImage]} alt="" aria-hidden="true" className="absolute inset-0 size-full scale-110 object-cover opacity-20 blur-2xl" />
                        <img src={product.images[activeImage]} alt={product.name} className="relative size-full object-contain" />
                      </>
                    ) : <div className="grid size-full place-content-center text-stone-500">لا توجد صورة</div>}
                    <Maximize2 className="absolute bottom-4 left-4 text-white drop-shadow" size={20} />
                  </div>
                  {product.images?.length > 1 && (
                    <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                      {product.images.map((image, index) => (
                        <button key={image} type="button" onClick={() => setActiveImage(index)} className={`size-16 shrink-0 overflow-hidden rounded-xl border-2 ${activeImage === index ? 'border-walnut' : 'border-transparent'}`}>
                          <img src={image} alt={`${product.name} ${index + 1}`} className="size-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col justify-center p-6 sm:p-9">
                  <span className="text-xs font-extrabold text-walnut">{product.category}</span>
                  <h2 className="mt-2 text-2xl font-extrabold text-charcoal sm:text-3xl">{product.name}</h2>
                  <p className="mt-5 whitespace-pre-line break-words text-sm leading-8 text-stone-600">{product.description}</p>
                  <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl bg-white p-3"><dt className="text-xs text-stone-500">نوع الخشب</dt><dd className="mt-1 whitespace-pre-line break-words font-bold leading-6 text-charcoal">{product.woodType}</dd></div>
                    <div className="rounded-xl bg-white p-3"><dt className="text-xs text-stone-500">المقاسات</dt><dd className="mt-1 whitespace-pre-line break-words font-bold leading-6 text-charcoal">{product.dimensions || 'حسب الطلب'}</dd></div>
                  </dl>
                  <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-stone-200 pt-6">
                    <div><span className="block text-xs text-stone-500">السعر</span><strong className="text-2xl text-walnut">{formatPrice(product.price)} <small className="text-sm">ج.م</small></strong></div>
                    <div className="flex flex-wrap gap-2">
                      <a href={shareUrl} target="_blank" rel="noreferrer" className="focus-ring inline-flex items-center gap-2 rounded-full border border-[#128C7E]/30 bg-[#128C7E]/10 px-5 py-3.5 text-sm font-bold text-[#0d766a] transition-colors hover:bg-[#128C7E] hover:text-white">
                        <MessageCircle size={18} /> مشاركة
                      </a>
                      <button type="button" disabled={!product.isAvailable} onClick={() => { addItem(product); onClose(); }} className="focus-ring inline-flex items-center gap-2 rounded-full bg-charcoal px-6 py-3.5 text-sm font-bold text-white hover:bg-walnut-dark disabled:bg-stone-300">
                        <ShoppingBag size={18} /> {product.isAvailable ? 'أضف للطلب' : 'غير متاح حاليًا'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default ProductDetailsModal;
