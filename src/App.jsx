
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ProductProvider } from './context/ProductContext';
import { ThemeProvider } from './context/ThemeContext';
import { CartProvider } from './context/CartContext';
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import Contact from './pages/Contact';
import InteractiveBackground from './components/InteractiveBackground';
import ScrollToTop from './components/ScrollToTop';
import Footer from './components/Footer';
import CartSidebar from './components/CartSidebar';
import ErrorBoundary from './components/ErrorBoundary';
import NotFound from './pages/NotFound';
import './styles/variables.css';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ProductProvider>
          <CartProvider>
            <InteractiveBackground />
            <CartSidebar />
            <Router>
              <ScrollToTop />
              <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/product/:id" element={<ProductDetails />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <Footer />
              </div>
            </Router>
          </CartProvider>
        </ProductProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
