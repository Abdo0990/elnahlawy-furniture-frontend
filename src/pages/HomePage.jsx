import DeliveriesSection from '../components/deliveries/DeliveriesSection';
import Hero from '../components/home/Hero';
import ProductCatalog from '../components/products/ProductCatalog';

function HomePage() {
  return (
    <main>
      <Hero />
      <ProductCatalog />
      <DeliveriesSection />
    </main>
  );
}

export default HomePage;
