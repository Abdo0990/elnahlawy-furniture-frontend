import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

function ConfirmDialog({ isOpen, title, message, isLoading, onCancel, onConfirm }) {
  return (
    <AnimatePresence>
      {isOpen && <div className="fixed inset-0 z-[70] grid place-items-center p-4" role="alertdialog" aria-modal="true"><motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onCancel} className="absolute inset-0 bg-black/65 backdrop-blur-sm" aria-label="إلغاء" /><motion.div initial={{ opacity: 0, scale: 0.96, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} className="relative w-full max-w-sm rounded-3xl bg-white p-7 text-center shadow-2xl"><span className="mx-auto grid size-14 place-items-center rounded-full bg-red-100 text-red-600"><AlertTriangle size={26} /></span><h2 className="mt-5 text-lg font-extrabold">{title}</h2><p className="mt-2 text-sm leading-6 text-stone-500">{message}</p><div className="mt-6 grid grid-cols-2 gap-3"><button type="button" disabled={isLoading} onClick={onCancel} className="rounded-xl border border-stone-300 px-4 py-3 text-sm font-bold">إلغاء</button><button type="button" disabled={isLoading} onClick={onConfirm} className="rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-60">{isLoading ? 'جارٍ الحذف...' : 'تأكيد الحذف'}</button></div></motion.div></div>}
    </AnimatePresence>
  );
}

export default ConfirmDialog;
