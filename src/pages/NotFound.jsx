import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, Home, ArrowLeft } from 'lucide-react';
import Navbar from '../components/Navbar';
import styles from './NotFound.module.css';

const NotFound = () => {
    return (
        <div className={styles.pageWrapper}>
            <Navbar />
            <main className={styles.container}>
                <div className={styles.content}>
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={styles.errorLabel}
                    >
                        404
                    </motion.div>
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className={styles.title}
                    >
                        Lost in the Aisle?
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className={styles.message}
                    >
                        We couldn't find the product or page you're looking for. It might have been moved, deleted, or never existed in our food database.
                    </motion.p>
                    
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className={styles.actions}
                    >
                        <Link to="/" className={styles.primaryBtn}>
                            <Home size={20} /> Back to Home
                        </Link>
                        <button onClick={() => window.history.back()} className={styles.secondaryBtn}>
                            <ArrowLeft size={20} /> Previous Page
                        </button>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className={styles.searchHint}
                    >
                        <Search size={16} />
                        <span>Tip: Try searching for a barcode or generic food name on the home page.</span>
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default NotFound;
