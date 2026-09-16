import { AnimatePresence, motion } from 'framer-motion';
import { ClipboardList, ExternalLink, LogOut, Menu, Package, Truck, X } from 'lucide-react';
import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/elnahlawy-logo.jpg';

const links = [
  { to: '/admin/products', label: 'المنتجات', icon: Package },
  { to: '/admin/orders', label: 'الطلبات', icon: ClipboardList },
  { to: '/admin/deliveries', label: 'التسليمات', icon: Truck },
];

function SidebarContent({ onNavigate }) {
  const { admin, logout } = useAuth();
  return (
    <div className="flex h-full flex-col bg-charcoal text-white">
      <div className="flex h-20 items-center border-b border-white/10 px-6">
        <img src={logo} alt="شعار النحلاوي" className="ml-3 size-12 rounded-xl bg-white object-cover" />
        <div><strong className="text-base">النحلاوي</strong><span className="block text-[0.62rem] tracking-[0.14em] text-brass-light">لوحة الإدارة</span></div>
      </div>
      <nav className="flex-1 space-y-2 p-4">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} onClick={onNavigate} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-colors ${isActive ? 'bg-brass text-charcoal' : 'text-stone-300 hover:bg-white/5 hover:text-white'}`}>
            <Icon size={19} /> {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-white/10 p-4">
        <div className="mb-3 px-3"><p className="truncate text-sm font-bold">{admin?.name}</p><p className="truncate text-xs text-stone-500">{admin?.email}</p></div>
        <a href="/" target="_blank" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-stone-300 hover:bg-white/5"><ExternalLink size={17} /> عرض المتجر</a>
        <button type="button" onClick={logout} className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-300 hover:bg-red-500/10"><LogOut size={17} /> تسجيل الخروج</button>
      </div>
    </div>
  );
}

function AdminLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return (
    <div className="min-h-screen bg-stone-100 text-charcoal lg:pr-64">
      <aside className="fixed inset-y-0 right-0 z-40 hidden w-64 lg:block"><SidebarContent /></aside>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-stone-200 bg-white/90 px-4 backdrop-blur lg:hidden">
        <strong>لوحة إدارة النحلاوي</strong>
        <button type="button" onClick={() => setIsMenuOpen(true)} className="grid size-10 place-items-center rounded-full bg-stone-100" aria-label="فتح القائمة"><Menu size={21} /></button>
      </header>
      <AnimatePresence>
        {isMenuOpen && <div className="fixed inset-0 z-50 lg:hidden"><motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMenuOpen(false)} className="absolute inset-0 bg-black/60" aria-label="إغلاق القائمة" /><motion.aside initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="absolute inset-y-0 right-0 w-72"><button type="button" onClick={() => setIsMenuOpen(false)} className="absolute top-5 left-4 z-10 text-white"><X size={21} /></button><SidebarContent onNavigate={() => setIsMenuOpen(false)} /></motion.aside></div>}
      </AnimatePresence>
      <main className="p-4 sm:p-6 lg:p-8"><Outlet /></main>
    </div>
  );
}

export default AdminLayout;
