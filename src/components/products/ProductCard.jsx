import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/formatters';

function ProductCard({ product, onView }) {
  const { addItem } = useCart();
  const image = product.images?.[0];

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      className="group overflow-hidden rounded-[1.4rem] border border-stone-200/80 bg-white shadow-sm transition-shadow hover:shadow-xl hover:shadow-walnut/10"
    >
      <button type="button" onClick={() => onView(product._id)} className="block w-full text-right">
        <div className="relative aspect-[4/3] overflow-hidden bg-cream-deep">
          {image ? (
            <img src={image} alt={product.name} loading="lazy" className="size-full object-cover transition-transform duration-700 group-hover:scale-105" />
          ) : (
            <div className="grid size-full place-content-center text-sm text-stone-500">لا توجد صورة</div>
          )}
          <span className={`absolute top-3 right-3 rounded-full px-3 py-1 text-[0.68rem] font-bold backdrop-blur-md ${product.isAvailable ? 'bg-emerald-700/90 text-white' : 'bg-charcoal/85 text-white'}`}>
            {product.isAvailable ? 'متاح' : 'غير متاح حاليًا'}
          </span>
          <span className="absolute bottom-3 left-3 grid size-10 translate-y-2 place-items-center rounded-full bg-white text-charcoal opacity-0 shadow-lg transition-all group-hover:translate-y-0 group-hover:opacity-100" aria-hidden="true">
            <ArrowLeft size={17} />
          </span>
        </div>
      </button>

      <div className="p-4 sm:p-5">
        <p className="text-[0.68rem] font-bold tracking-wide text-walnut">{product.category}</p>
        <button type="button" onClick={() => onView(product._id)} className="mt-1.5 block w-full truncate text-right text-base font-extrabold text-charcoal hover:text-walnut">
          {product.name}
        </button>
        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="font-extrabold text-walnut">{formatPrice(product.price)} <span className="text-xs">ج.م</span></p>
          <motion.button
            type="button"
            whileTap={{ scale: 0.93 }}
            disabled={!product.isAvailable}
            onClick={() => addItem(product)}
            className="focus-ring inline-flex items-center gap-2 rounded-full bg-charcoal px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-walnut-dark disabled:cursor-not-allowed disabled:bg-stone-300"
          >
            <ShoppingBag size={15} /> أضف للطلب
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
}

export default ProductCard;
