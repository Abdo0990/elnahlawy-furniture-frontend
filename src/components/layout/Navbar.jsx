import { AnimatePresence, motion } from 'framer-motion';
import { MapPin, Menu, Phone, ShoppingBag, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/elnahlawy-logo.jpg';
import { SITE } from '../../config/site';

const navigation = [
  { label: 'الرئيسية', href: '/' },
  { label: 'منتجاتنا', href: '/#products' },
  { label: 'تسليماتنا', href: '/deliveries' },
  { label: 'تواصل معنا', href: '/#contact' },
];

function Navbar({ cartCount, onOpenCart }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-charcoal/95 text-cream shadow-lg shadow-black/5 backdrop-blur-xl">
      <div className="hidden border-b border-white/10 bg-black/15 sm:block">
        <div className="container-shell flex h-9 items-center justify-between text-[0.68rem] text-stone-300">
          <a href={SITE.mapUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 transition-colors hover:text-brass-light">
            <MapPin size={13} className="text-brass" /> {SITE.address}
          </a>
          <div className="flex items-center gap-3" dir="ltr">
            <Phone size={13} className="text-brass" />
            {SITE.phones.map((phone) => <a key={phone.display} href={phone.href} className="transition-colors hover:text-brass-light">{phone.display}</a>)}
          </div>
        </div>
      </div>
      <nav className="container-shell flex h-20 items-center justify-between" aria-label="التنقل الرئيسي">
        <Link to="/" className="focus-ring flex items-center gap-3 rounded-lg" aria-label="معرض النحلاوي - الرئيسية">
          <img src={logo} alt="شعار معرض النحلاوي للأثاث" className="size-14 rounded-full border-2 border-brass/40 bg-white object-cover shadow-md" />
          <span className="hidden lg:block"><strong className="block text-base text-white">معرض النحلاوي</strong><small className="text-[0.6rem] tracking-[0.12em] text-brass-light">للتجارة والتوزيع</small></span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navigation.map((item) => (
            <Link key={item.label} to={item.href} className="focus-ring relative rounded-sm py-2 text-sm font-medium text-stone-300 transition-colors after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-left after:scale-x-0 after:bg-brass after:transition-transform hover:text-white hover:after:scale-x-100">{item.label}</Link>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <motion.button
            type="button"
            whileTap={{ scale: 0.92 }}
            onClick={onOpenCart}
            className="focus-ring relative grid size-11 place-items-center rounded-full text-cream transition-colors hover:bg-white/10"
            aria-label={`فتح الطلب، ${cartCount} منتجات`}
          >
            <ShoppingBag size={21} strokeWidth={1.7} />
            {cartCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-0.5 -left-0.5 grid size-5 place-items-center rounded-full bg-brass text-[0.65rem] font-bold text-charcoal"
              >
                {cartCount}
              </motion.span>
            )}
          </motion.button>

          <button
            type="button"
            onClick={() => setIsMenuOpen((value) => !value)}
            className="focus-ring grid size-11 place-items-center rounded-full transition-colors hover:bg-white/10 md:hidden"
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
          >
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/10 md:hidden"
          >
            <div className="container-shell flex flex-col py-3">
              {navigation.map((item) => (
                <Link key={item.label} to={item.href} onClick={() => setIsMenuOpen(false)} className="focus-ring rounded-lg px-3 py-3 text-sm text-stone-200 transition-colors hover:bg-white/5 hover:text-brass-light">{item.label}</Link>
              ))}
              <div className="mt-2 border-t border-white/10 px-3 pt-4 text-xs text-stone-400">
                <a href={SITE.mapUrl} target="_blank" rel="noreferrer" className="flex items-start gap-2 leading-6"><MapPin size={15} className="mt-1 shrink-0 text-brass" />{SITE.address}</a>
                <div className="mt-2 flex items-center gap-3" dir="ltr">{SITE.phones.map((phone) => <a key={phone.display} href={phone.href} className="text-brass-light">{phone.display}</a>)}</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export default Navbar;
