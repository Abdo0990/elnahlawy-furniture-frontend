import { useEffect } from 'react';
import DeliveriesSection from '../components/deliveries/DeliveriesSection';

function DeliveriesPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main>
      <DeliveriesSection standalone />
    </main>
  );
}

export default DeliveriesPage;
