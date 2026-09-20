import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, PackageOpen, Palette, RotateCcw, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { PRODUCT_FILTER_CATEGORIES } from '../../constants/productCategories';
import api from '../../services/api';
import ProductCard from './ProductCard';
import ProductDetailsModal from './ProductDetailsModal';

function ProductSkeleton() {
  return (
    <div className="overflow-hidden rounded-[1.4rem] bg-white">
      <div className="aspect-[4/3] animate-pulse bg-stone-200" />
      <div className="space-y-3 p-5"><div className="h-3 w-16 animate-pulse rounded bg-stone-200" /><div className="h-5 w-2/3 animate-pulse rounded bg-stone-200" /><div className="h-9 animate-pulse rounded bg-stone-100" /></div>
    </div>
  );
}

function ProductCatalog() {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState('الكل');
  const [search, setSearch] = useState('');
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, numberOfPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedProductId, setSelectedProductId] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setKeyword(search.trim());
      setPage(1);
    }, 450);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setIsLoading(true);
    setError('');

    api.get('/products', {
      signal: controller.signal,
      params: {
        page,
        limit: 12,
        ...(category !== 'الكل' && { category }),
        ...(keyword && { keyword }),
      },
    })
      .then((response) => {
        if (!active) return;
        setProducts(response.data.data);
        setPagination(response.data.pagination);
      })
      .catch((requestError) => {
        if (active && requestError.originalError?.code !== 'ERR_CANCELED') {
          setError(requestError.message);
        }
      })
      .finally(() => active && setIsLoading(false));

    return () => {
      active = false;
      controller.abort();
    };
  }, [category, keyword, page, reloadKey]);

  const selectCategory = (value) => {
    setCategory(value);
    setPage(1);
  };

  return (
    <section id="products" className="scroll-mt-20 py-20 sm:scroll-mt-[7.25rem] sm:py-28">
      <div className="container-shell">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
          <span className="text-xs font-extrabold tracking-[0.18em] text-walnut">مختارات النحلاوي</span>
          <h2 className="mt-3 text-3xl font-extrabold text-charcoal sm:text-4xl">قطع تُكمل حكاية بيتك</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-stone-600">تصفّح مجموعتنا المختارة بعناية، واختر ما يناسب مساحتك وذوقك.</p>
        </motion.div>

        <div className="mt-10 flex flex-col items-center justify-between gap-5 lg:flex-row">
          <div className="scrollbar-none flex w-full min-w-0 items-center gap-2 overflow-x-auto px-1 py-2 whitespace-nowrap lg:flex-1">
            {PRODUCT_FILTER_CATEGORIES.map((item) => (
              <motion.button layout key={item} type="button" whileTap={{ scale: 0.96 }} onClick={() => selectCategory(item)} className={`focus-ring shrink-0 rounded-full px-5 py-2.5 text-sm font-bold transition-all duration-200 ${category === item ? 'bg-charcoal text-white shadow-lg shadow-charcoal/15' : 'border border-stone-300 bg-white/70 text-stone-600 hover:border-walnut hover:text-walnut'}`}>
                {item}
              </motion.button>
            ))}
          </div>
          <label className="relative w-full max-w-sm lg:w-80 lg:shrink-0">
            <span className="sr-only">ابحث في المنتجات</span>
            <Search className="absolute top-1/2 right-4 -translate-y-1/2 text-stone-400" size={18} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ابحث بالاسم أو نوع الخشب..." className="focus-ring w-full rounded-full border border-stone-300 bg-white py-3 pr-11 pl-5 text-sm placeholder:text-stone-400" />
          </label>
        </div>

        <AnimatePresence>
          {category === 'ركن' && (
            <motion.aside
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="mt-7 flex items-start gap-4 rounded-2xl border border-brass/30 bg-gradient-to-l from-brass/15 to-white px-5 py-4 shadow-sm sm:items-center sm:px-6">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-walnut text-white shadow-md">
                  <Palette size={21} />
                </span>
                <div>
                  <h3 className="font-extrabold text-charcoal">ركنتك تتنفذ على ذوقك</h3>
                  <p className="mt-1 text-sm leading-7 text-stone-600">
                    بننفذ أي ركنة بالألوان والمقاسات المطلوبة، بأسعار تبدأ من{' '}
                    <strong className="whitespace-nowrap text-walnut">٢٬٥٠٠ ج.م</strong>
                  </p>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {error ? (
          <div className="mt-12 rounded-3xl border border-red-200 bg-red-50 px-6 py-12 text-center">
            <p className="font-bold text-red-800">تعذر تحميل المنتجات</p>
            <p className="mt-2 text-sm text-red-600">{error}</p>
            <button type="button" onClick={() => setReloadKey((value) => value + 1)} className="focus-ring mt-5 inline-flex items-center gap-2 rounded-full bg-charcoal px-5 py-2.5 text-sm font-bold text-white"><RotateCcw size={16} /> حاول مجددًا</button>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={`${category}-${keyword}-${page}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {isLoading
                ? Array.from({ length: 8 }, (_, index) => <ProductSkeleton key={index} />)
                : products.map((product) => <ProductCard key={product._id} product={product} onView={setSelectedProductId} />)}
            </motion.div>
          </AnimatePresence>
        )}

        {!isLoading && !error && products.length === 0 && (
          <div className="py-16 text-center text-stone-500"><PackageOpen className="mx-auto mb-4 text-stone-400" size={44} strokeWidth={1.3} /><p className="font-bold text-charcoal">لا توجد منتجات مطابقة حاليًا</p><p className="mt-2 text-sm">جرّب قسمًا آخر أو غيّر كلمات البحث.</p></div>
        )}

        {!isLoading && !error && pagination.numberOfPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-3">
            <button type="button" disabled={!pagination.prev} onClick={() => setPage((value) => value - 1)} className="focus-ring grid size-10 place-items-center rounded-full border border-stone-300 bg-white disabled:opacity-35" aria-label="الصفحة السابقة"><ChevronRight size={18} /></button>
            <span className="text-sm text-stone-600">صفحة <strong className="text-charcoal">{pagination.page}</strong> من {pagination.numberOfPages}</span>
            <button type="button" disabled={!pagination.next} onClick={() => setPage((value) => value + 1)} className="focus-ring grid size-10 place-items-center rounded-full border border-stone-300 bg-white disabled:opacity-35" aria-label="الصفحة التالية"><ChevronLeft size={18} /></button>
          </div>
        )}
      </div>

      <ProductDetailsModal productId={selectedProductId} onClose={() => setSelectedProductId(null)} />
    </section>
  );
}

export default ProductCatalog;
