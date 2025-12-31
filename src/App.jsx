
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ProductProvider } from './context/ProductContext';
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import './styles/variables.css';

function App() {
  return (
    <ProductProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetails />} />
        </Routes>
      </Router>
    </ProductProvider>
  );
}

export default App;
