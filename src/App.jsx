
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ProductProvider } from './context/ProductContext';
import { ThemeProvider } from './context/ThemeContext';
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import Contact from './pages/Contact';
import InteractiveBackground from './components/InteractiveBackground';
import './styles/variables.css';

function App() {
  return (
    <ThemeProvider>
      <ProductProvider>
        <InteractiveBackground />
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </Router>
      </ProductProvider>
    </ThemeProvider>
  );
}

export default App;
