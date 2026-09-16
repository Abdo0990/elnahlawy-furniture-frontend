import { motion } from 'framer-motion';
import { ArrowLeft, BadgeCheck, ShieldCheck, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import heroImage from '../../assets/hero-luxury-living-room.png';

const features = [
  { icon: BadgeCheck, text: 'خامات مختارة' },
  { icon: ShieldCheck, text: 'جودة مضمونة' },
  { icon: Truck, text: 'توصيل آمن' },
];

function Hero() {
  return (
    <section className="relative isolate min-h-[calc(100svh-5rem)] overflow-hidden bg-charcoal text-white sm:min-h-[calc(100svh-7.25rem)]">
      <img
        src={heroImage}
        alt="غرفة معيشة فاخرة بأثاث خشبي من معرض النحلاوي"
        className="absolute inset-0 -z-20 size-full object-cover object-[38%_center] sm:object-center"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-l from-charcoal via-charcoal/85 to-charcoal/5" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-charcoal/75 via-transparent to-transparent" />

      <div className="container-shell flex min-h-[calc(100svh-5rem)] items-center py-16 sm:min-h-[calc(100svh-7.25rem)]">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl"
        >
          <p className="mb-5 flex items-center gap-3 text-xs font-bold tracking-[0.2em] text-brass-light sm:text-sm">
            <span className="h-px w-10 bg-brass" />
            أثاث يصنع للمكان ذاكرة
          </p>
          <h1 className="text-4xl leading-[1.35] font-extrabold sm:text-6xl lg:text-7xl">
            لأن بيتك يستحق
            <span className="block text-brass-light">تفاصيل استثنائية</span>
          </h1>
          <p className="mt-6 max-w-xl text-sm leading-8 text-stone-300 sm:text-base">
            تصميمات تجمع دفء الخشب وأناقة التفاصيل، مصنوعة بعناية لتعيش معك
            وتكمّل كل لحظة في بيتك.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <motion.a whileHover={{ x: -4 }} href="#products" className="focus-ring inline-flex items-center gap-3 rounded-full bg-brass px-7 py-3.5 text-sm font-extrabold text-charcoal transition-colors hover:bg-brass-light">
              اكتشف مجموعتنا <ArrowLeft size={18} />
            </motion.a>
            <Link to="/deliveries" className="focus-ring rounded-full border border-white/30 bg-white/5 px-7 py-3.5 text-sm font-bold backdrop-blur-sm transition-colors hover:bg-white/10">
              شاهد تسليماتنا
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap gap-x-7 gap-y-4 border-t border-white/15 pt-6">
            {features.map(({ icon: Icon, text }) => (
              <span key={text} className="flex items-center gap-2 text-xs text-stone-300 sm:text-sm">
                <Icon size={17} className="text-brass-light" /> {text}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default Hero;
