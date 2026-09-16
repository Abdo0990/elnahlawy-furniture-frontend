import { ExternalLink, MapPin, MessageCircle, Navigation, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from '../../assets/elnahlawy-logo.jpg';
import { getWhatsAppUrl, SITE } from '../../config/site';

function Footer() {
  return (
    <footer id="contact" className="bg-charcoal text-stone-300">
      <div className="container-shell grid gap-10 py-14 sm:grid-cols-2 md:grid-cols-[1.05fr_0.65fr_1.3fr] md:gap-7 lg:gap-12">
        <div>
          <Link to="/" className="flex w-fit items-center gap-4">
            <img src={logo} alt="شعار معرض النحلاوي للأثاث" className="size-24 rounded-2xl bg-white object-cover shadow-lg" />
            <span>
              <strong className="block text-xl text-white">معرض النحلاوي</strong>
              <small className="mt-1 block text-brass-light">للتجارة والتوزيع منذ 1995</small>
            </span>
          </Link>
          <p className="mt-5 max-w-md text-sm leading-7 text-stone-400">
            نصنع تفاصيل بيتك بذوق راقٍ وجودة تدوم، من اختيار الخامات وحتى التسليم.
          </p>
        </div>

        <div>
          <h2 className="font-bold text-white">روابط سريعة</h2>
          <div className="mt-4 flex flex-col gap-3 text-sm">
            <a className="transition-colors hover:text-brass-light" href="/#products">منتجاتنا</a>
            <Link className="transition-colors hover:text-brass-light" to="/deliveries">تسليمات العملاء</Link>
            <Link className="transition-colors hover:text-brass-light" to="/admin/login">دخول الإدارة</Link>
          </div>
        </div>

        <section className="sm:col-span-2 md:col-span-1">
          <div className="flex items-center gap-3">
            <span className="text-brass">
              <MapPin size={19} />
            </span>
            <div>
              <p className="text-[0.65rem] font-bold tracking-[0.14em] text-brass-light">زورونا في المعرض</p>
              <h2 className="mt-0.5 font-extrabold text-white">العنوان والتواصل</h2>
            </div>
          </div>

          <a href={SITE.mapUrl} target="_blank" rel="noreferrer" className="group mt-5 flex items-start gap-3 transition-colors hover:text-white">
            <MapPin className="mt-0.5 shrink-0 text-brass" size={18} />
            <span className="min-w-0 text-sm leading-7 text-stone-200">
              {SITE.address}
              <small className="mt-1 flex items-center gap-1.5 font-bold text-brass-light transition-colors group-hover:text-white">
                <Navigation size={13} /> فتح الموقع على Google Maps
              </small>
            </span>
          </a>

          <div className="mt-5 grid grid-cols-2 gap-2" dir="ltr">
            {SITE.phones.map((phone) => (
              <a key={phone.display} href={phone.href} className="focus-ring flex min-w-0 items-center justify-center gap-2 rounded-xl border border-white/10 px-2 py-2.5 text-xs font-semibold text-stone-200 transition-all hover:border-brass/50 hover:text-white">
                <Phone size={14} className="shrink-0 text-brass" />
                <span>{phone.display}</span>
              </a>
            ))}
          </div>

          <div className="mt-2 grid grid-cols-2 gap-2">
            <a href={getWhatsAppUrl('مرحبًا، أريد الاستفسار عن الأثاث المتاح')} target="_blank" rel="noreferrer" className="focus-ring inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#128C7E] px-2 py-2.5 text-[0.68rem] font-extrabold text-white transition-all hover:-translate-y-0.5 hover:bg-[#0d766a] lg:text-xs">
              <MessageCircle size={16} /> تواصل عبر واتساب
            </a>
            <a href={SITE.facebookUrl} target="_blank" rel="noreferrer" className="focus-ring inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/15 px-2 py-2.5 text-[0.68rem] font-extrabold text-white transition-all hover:-translate-y-0.5 hover:border-brass/50 hover:text-brass-light lg:text-xs">
              <ExternalLink size={15} /> صفحتنا على فيسبوك
            </a>
          </div>
        </section>
      </div>

      <div className="border-t border-white/10 py-5 text-center text-xs text-stone-500">
        © {new Date().getFullYear()} {SITE.name}. جميع الحقوق محفوظة.
      </div>
    </footer>
  );
}

export default Footer;
