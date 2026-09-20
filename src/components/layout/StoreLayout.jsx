import { Outlet } from 'react-router-dom';
import CartDrawer from '../store/CartDrawer';
import { useCart } from '../../context/CartContext';
import useBodyScrollLock from '../../hooks/useBodyScrollLock';
import Footer from './Footer';
import Navbar from './Navbar';
import ScrollManager from './ScrollManager';
import WhatsAppButton from './WhatsAppButton';

function StoreLayout() {
  const { closeCart, isCartOpen, itemCount, openCart } = useCart();

  useBodyScrollLock(isCartOpen);

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
