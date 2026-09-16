import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { getWhatsAppUrl } from '../../config/site';

function WhatsAppButton() {
  const href = getWhatsAppUrl('مرحبًا، أريد الاستفسار عن الأثاث المتاح');

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noreferrer"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -3, scale: 1.04 }}
      whileTap={{ scale: 0.94 }}
      className="focus-ring fixed bottom-5 left-5 z-30 grid size-14 place-items-center rounded-full bg-[#25D366] text-white shadow-xl shadow-black/20 sm:bottom-7 sm:left-7"
      aria-label="تواصل معنا عبر واتساب"
    >
      <MessageCircle size={27} strokeWidth={1.8} />
    </motion.a>
  );
}

export default WhatsAppButton;
