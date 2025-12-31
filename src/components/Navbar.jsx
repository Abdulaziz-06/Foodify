import React from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, Menu, ScanBarcode, X } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import styles from './Navbar.module.css';

const Navbar = () => {
    const { searchQuery, setSearchQuery } = useProducts();
    const navigate = useNavigate();
    const [showBarcodeSearch, setShowBarcodeSearch] = React.useState(false);
    const [barcode, setBarcode] = React.useState('');

    const handleBarcodeSubmit = (e) => {
        e.preventDefault();
        if (barcode.trim()) {
            navigate(`/product/${barcode.trim()}`);
            setShowBarcodeSearch(false);
            setBarcode('');
        }
    };

    return (
        <nav className={styles.navbar}>
            <div className={styles.navContent}>
                <Link to="/" className={styles.logo}>
                    Food<span>ify</span>
                </Link>

                <div className={styles.searchContainer}>
                    <Search className={styles.searchIcon} size={20} />
                    <input
                        type="text"
                        placeholder="Search products..."
                        className={styles.searchInput}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className={styles.navActions}>
                    {showBarcodeSearch ? (
                        <form onSubmit={handleBarcodeSubmit} className={styles.barcodeForm}>
                            <input
                                type="text"
                                placeholder="Enter Barcode..."
                                className={styles.barcodeInput}
                                value={barcode}
                                onChange={(e) => setBarcode(e.target.value)}
                                autoFocus
                            />
                            <button type="button" onClick={() => setShowBarcodeSearch(false)} className={styles.iconBtn}>
                                <X size={20} />
                            </button>
                        </form>
                    ) : (
                        <button
                            className={styles.iconBtn}
                            aria-label="Barcode Search"
                            onClick={() => setShowBarcodeSearch(true)}
                            title="Search by Barcode"
                        >
                            <ScanBarcode size={24} />
                        </button>
                    )}
                    <button className={styles.iconBtn} aria-label="Cart">
                        <ShoppingBag size={24} />
                    </button>
                    <button className={styles.iconBtn} aria-label="Menu">
                        <Menu size={24} />
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
