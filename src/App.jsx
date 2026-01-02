
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ProductProvider } from './context/ProductContext';
import { ThemeProvider } from './context/ThemeContext';
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import Contact from './pages/Contact';
import InteractiveBackground from './components/InteractiveBackground';
import Footer from './components/Footer';
import './styles/variables.css';

function App() {
  return (
    <ThemeProvider>
      <ProductProvider>
        <InteractiveBackground />
        <Router>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative', zIndex: 1 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/contact" element={<Contact />} />
            </Routes>
            <Footer />
          </div>
        </Router>
      </ProductProvider>
    </ThemeProvider>
  );
}

export default App;
