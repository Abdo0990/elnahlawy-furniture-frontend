import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import CartDrawer from '../store/CartDrawer';
import { useCart } from '../../context/CartContext';
import Footer from './Footer';
import Navbar from './Navbar';
import ScrollManager from './ScrollManager';
import WhatsAppButton from './WhatsAppButton';

function StoreLayout() {
  const { closeCart, isCartOpen, itemCount, openCart } = useCart();

  useEffect(() => {
    document.body.style.overflow = isCartOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCartOpen]);

  return (
    <div className="min-h-screen overflow-x-hidden">
      <ScrollManager />
      <Navbar cartCount={itemCount} onOpenCart={openCart} />
      <Outlet />
      <Footer />
      <WhatsAppButton />
      <CartDrawer isOpen={isCartOpen} onClose={closeCart} />
    </div>
  );
}

export default StoreLayout;
