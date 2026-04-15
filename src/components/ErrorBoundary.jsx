import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';
import styles from './ErrorBoundary.module.css';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className={styles.wrapper}>
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={styles.container}
                    >
                        <div className={styles.icon}>
                            <AlertCircle size={64} color="var(--accent)" />
                        </div>
                        <h1 className={styles.title}>Oops! Something went wrong.</h1>
                        <p className={styles.message}>
                            An unexpected error occurred in the application. We've been notified and are looking into it.
                        </p>
                        
                        <div className={styles.actions}>
                            <button 
                                onClick={() => window.location.reload()} 
                                className={styles.retryBtn}
                            >
                                <RefreshCcw size={18} /> Reload Application
                            </button>
                            <a href="/" className={styles.homeLink}>
                                <Home size={18} /> Back to Home
                            </a>
                        </div>

                        {import.meta.env.DEV && (
                            <details className={styles.debug}>
                                <summary>Debug Information</summary>
                                <pre>{this.state.error?.toString()}</pre>
                            </details>
                        )}
                    </motion.div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
