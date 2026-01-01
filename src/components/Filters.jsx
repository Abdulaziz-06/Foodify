import React, { useState, useRef, useEffect } from 'react';
import { useProducts } from '../context/ProductContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';
import styles from './Filters.module.css';

const CustomDropdown = ({ label, value, options, onChange, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.id === value) || options.find(opt => opt.value === value);
    const displayValue = selectedOption ? selectedOption.name || selectedOption.label : placeholder;

    return (
        <div className={styles.dropdownWrapper} ref={dropdownRef}>
            <span className={styles.dropdownLabel}>{label}</span>
            <button
                className={`${styles.dropdownTrigger} ${isOpen ? styles.triggerActive : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                {displayValue}
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: "circOut" }}
                >
                    <ChevronDown size={18} />
                </motion.div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        key="dropdown-list"
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className={styles.dropdownList}
                    >
                        {options.map((option, index) => (
                            <button
                                key={`${option.id || option.value}-${index}`}
                                className={`${styles.dropdownItem} ${value === (option.id || option.value) ? styles.itemSelected : ''}`}
                                onClick={() => {
                                    onChange(option.id || option.value);
                                    setIsOpen(false);
                                }}
                            >
                                {option.name || option.label}
                                {value === (option.id || option.value) && <Check size={14} />}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const Filters = () => {
    const { categories, selectedCategory, setSelectedCategory, sortBy, setSortBy, setSearchQuery } = useProducts();

    const fallbackCategories = [
        { id: '', name: 'All Categories' },
        { id: 'en:snacks', name: 'Snacks' },
        { id: 'en:beverages', name: 'Beverages' },
        { id: 'en:dairies', name: 'Dairies' },
        { id: 'en:meats', name: 'Meats' },
        { id: 'en:plant-based-foods', name: 'Plant-based' }
    ];

    const displayCategories = categories && categories.length > 0
        ? [{ id: '', name: 'All Categories' }, ...categories]
        : fallbackCategories;

    const sortOptions = [
        { value: 'unique_scans_n', label: 'Popularity' },
        { value: 'product_name', label: 'Name (A-Z)' },
        { value: 'created_t', label: 'Newest First' }
    ];

    // Clear search when category changes
    const handleCategoryChange = (categoryId) => {
        setSelectedCategory(categoryId);
        setSearchQuery(''); // Clear search when category is selected
    };

    return (
        <div className={styles.filterContainer}>
            <CustomDropdown
                label="Category"
                value={selectedCategory}
                options={displayCategories}
                onChange={handleCategoryChange}
                placeholder="All Categories"
            />

            <div className={styles.divider} />

            <CustomDropdown
                label="Sort By"
                value={sortBy}
                options={sortOptions}
                onChange={setSortBy}
                placeholder="Sort Products"
            />
        </div>
    );
};

export default Filters;
