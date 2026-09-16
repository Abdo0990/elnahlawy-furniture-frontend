import { motion } from 'framer-motion';
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import heroImage from '../../assets/hero-luxury-living-room.png';
import logo from '../../assets/elnahlawy-logo.jpg';

function AdminLoginPage() {
  const { isAuthenticated, isAuthLoading, login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const destination = location.state?.from || '/admin/products';

  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) navigate(destination, { replace: true });
  }, [destination, isAuthenticated, isAuthLoading, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await login(form);
      toast.success('مرحبًا بك في لوحة الإدارة');
      navigate(destination, { replace: true });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="grid min-h-screen bg-charcoal lg:grid-cols-2">
      <section className="relative hidden overflow-hidden lg:block">
        <img src={heroImage} alt="" className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/25 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-12 text-white"><p className="text-sm text-brass-light">معرض النحلاوي للأثاث</p><h1 className="mt-3 max-w-lg text-4xl leading-[1.4] font-extrabold">إدارة سهلة لكل تفاصيل المعرض</h1></div>
      </section>
      <section className="relative grid place-items-center px-5 py-12 sm:px-10">
        <Link to="/" className="absolute top-6 right-6 flex items-center gap-2 text-sm text-stone-400 hover:text-white"><ArrowRight size={17} /> العودة للمتجر</Link>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-9">
          <div className="mb-8"><img src={logo} alt="شعار معرض النحلاوي" className="size-20 rounded-2xl border border-stone-200 bg-white object-cover shadow-sm" /><h2 className="mt-5 text-2xl font-extrabold">تسجيل دخول الإدارة</h2><p className="mt-2 text-sm text-stone-500">أدخل بيانات حساب المدير للمتابعة.</p></div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block"><span className="mb-2 block text-sm font-bold">البريد الإلكتروني</span><span className="relative block"><Mail className="absolute top-1/2 right-4 -translate-y-1/2 text-stone-400" size={18} /><input type="email" required autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="form-field py-3.5 pr-11" placeholder="admin@example.com" dir="ltr" /></span></label>
            <label className="block"><span className="mb-2 block text-sm font-bold">كلمة المرور</span><span className="relative block"><LockKeyhole className="absolute top-1/2 right-4 -translate-y-1/2 text-stone-400" size={18} /><input type={showPassword ? 'text' : 'password'} required autoComplete="current-password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="form-field py-3.5 pr-11 pl-11" placeholder="••••••••" dir="ltr" /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute top-1/2 left-4 -translate-y-1/2 text-stone-400" aria-label="إظهار أو إخفاء كلمة المرور">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></span></label>
            <button disabled={isSubmitting} className="focus-ring w-full rounded-xl bg-charcoal py-3.5 font-extrabold text-white transition-colors hover:bg-walnut-dark disabled:opacity-60">{isSubmitting ? 'جارٍ تسجيل الدخول...' : 'دخول لوحة الإدارة'}</button>
          </form>
        </motion.div>
      </section>
    </main>
  );
}

export default AdminLoginPage;
