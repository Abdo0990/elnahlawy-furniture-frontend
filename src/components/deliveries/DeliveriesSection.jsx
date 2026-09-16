import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ChevronLeft, ChevronRight, Images, MapPin, RotateCcw, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { formatDate } from '../../utils/formatters';

function DeliveryLightbox({ delivery, onClose }) {
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => setActiveImage(0), [delivery]);
  useEffect(() => {
    if (!delivery) return;
    const onKeyDown = (event) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [delivery, onClose]);

  return (
    <AnimatePresence>
      {delivery && (
        <div className="fixed inset-0 z-50 grid place-items-center p-3 sm:p-6" role="dialog" aria-modal="true">
          <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/85 backdrop-blur-sm" aria-label="إغلاق الصور" />
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }} className="relative w-full max-w-5xl overflow-hidden rounded-3xl bg-charcoal p-3 text-white shadow-2xl sm:p-5">
            <button type="button" onClick={onClose} className="absolute top-5 left-5 z-10 grid size-10 place-items-center rounded-full bg-black/55" aria-label="إغلاق"><X size={20} /></button>
            <div className="aspect-[16/10] max-h-[70vh] overflow-hidden rounded-2xl bg-black">
              <img src={delivery.images[activeImage]} alt={delivery.title} className="size-full object-contain" />
            </div>
            <div className="mt-4 flex items-center justify-between gap-4 px-1">
              <div><h3 className="font-extrabold">{delivery.title}</h3><p className="mt-1 flex items-center gap-1 text-xs text-stone-400"><MapPin size={13} />{delivery.location}</p></div>
              <div className="flex max-w-[45%] gap-2 overflow-x-auto">
                {delivery.images.map((image, index) => (
                  <button key={image} type="button" onClick={() => setActiveImage(index)} className={`size-12 shrink-0 overflow-hidden rounded-lg border-2 ${activeImage === index ? 'border-brass' : 'border-transparent'}`}><img src={image} alt="" className="size-full object-cover" /></button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function DeliveriesSection({ standalone = false }) {
  const [deliveries, setDeliveries] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, numberOfPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setIsLoading(true);
    setError('');

    api.get('/deliveries', {
      signal: controller.signal,
      params: { page, limit: standalone ? 12 : 6, sort: '-deliveredAt' },
    })
      .then((response) => {
        if (!active) return;
        setDeliveries(response.data.data);
        setPagination(response.data.pagination);
      })
      .catch((requestError) => {
        if (active && requestError.originalError?.code !== 'ERR_CANCELED') setError(requestError.message);
      })
      .finally(() => active && setIsLoading(false));

    return () => {
      active = false;
      controller.abort();
    };
  }, [page, reloadKey, standalone]);

  return (
    <section id="deliveries" className={`scroll-mt-20 bg-charcoal text-white ${standalone ? 'min-h-[70vh] py-16 sm:py-20' : 'py-20 sm:py-28'}`}>
      <div className="container-shell">
        {standalone && (
          <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm text-stone-400 transition-colors hover:text-brass-light">
            <ChevronRight size={17} /> العودة للرئيسية
          </Link>
        )}
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="text-xs font-extrabold tracking-[0.18em] text-brass-light">من بيوت عملائنا</span>
            <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">ثقة تُرى في كل تسليم</h2>
          </motion.div>
          <p className="max-w-md text-sm leading-7 text-stone-400">صور حقيقية من تسليماتنا، لأن جودة الشغل تظهر في مكانها الطبيعي: بيتك.</p>
        </div>

        {error ? (
          <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 py-10 text-center">
            <p className="text-stone-300">{error}</p>
            <button type="button" onClick={() => setReloadKey((value) => value + 1)} className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-brass-light"><RotateCcw size={15} /> حاول مجددًا</button>
          </div>
        ) : (
          <div className="mt-10 grid auto-rows-[15rem] gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading
              ? Array.from({ length: standalone ? 9 : 6 }, (_, index) => <div key={index} className="animate-pulse rounded-3xl bg-white/10" />)
              : deliveries.map((delivery, index) => (
                  <motion.button
                    type="button"
                    key={delivery._id}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: (index % 3) * 0.08 }}
                    onClick={() => setSelected(delivery)}
                    className={`focus-ring group relative overflow-hidden rounded-3xl bg-stone-800 text-right ${index === 0 ? 'sm:row-span-2' : ''}`}
                  >
                    {delivery.images?.[0] ? <img src={delivery.images[0]} alt={delivery.title} loading="lazy" className="size-full object-cover transition-transform duration-700 group-hover:scale-105" /> : <span className="grid size-full place-content-center text-stone-500">لا توجد صورة</span>}
                    <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                    <span className="absolute inset-x-0 bottom-0 block p-5">
                      <span className="flex items-end justify-between gap-3">
                        <span><strong className="block text-sm sm:text-base">{delivery.title}</strong><small className="mt-1 flex items-center gap-1 text-stone-300"><MapPin size={13} />{delivery.location} · {formatDate(delivery.deliveredAt)}</small></span>
                        {delivery.images?.length > 1 && <small className="flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 backdrop-blur"><Images size={13} />{delivery.images.length}</small>}
                      </span>
                    </span>
                  </motion.button>
                ))}
          </div>
        )}

        {!isLoading && !error && deliveries.length === 0 && <p className="py-14 text-center text-stone-400">سيتم إضافة صور التسليمات قريبًا.</p>}

        {!standalone && !isLoading && !error && deliveries.length > 0 && (
          <div className="mt-10 text-center">
            <Link to="/deliveries" className="focus-ring inline-flex items-center gap-2 rounded-full border border-brass/50 px-6 py-3 text-sm font-bold text-brass-light transition-colors hover:bg-brass hover:text-charcoal">
              عرض كل التسليمات <ArrowLeft size={17} />
            </Link>
          </div>
        )}

        {standalone && !isLoading && !error && pagination.numberOfPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-3">
            <button type="button" disabled={!pagination.prev} onClick={() => { setPage((value) => value - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="focus-ring grid size-10 place-items-center rounded-full border border-white/15 bg-white/5 disabled:opacity-30" aria-label="الصفحة السابقة"><ChevronRight size={18} /></button>
            <span className="text-sm text-stone-400">صفحة <strong className="text-white">{pagination.page}</strong> من {pagination.numberOfPages}</span>
            <button type="button" disabled={!pagination.next} onClick={() => { setPage((value) => value + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="focus-ring grid size-10 place-items-center rounded-full border border-white/15 bg-white/5 disabled:opacity-30" aria-label="الصفحة التالية"><ChevronLeft size={18} /></button>
          </div>
        )}
      </div>
      <DeliveryLightbox delivery={selected} onClose={() => setSelected(null)} />
    </section>
  );
}

export default DeliveriesSection;
