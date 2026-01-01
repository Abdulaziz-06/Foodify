import React from 'react';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';
import { Mail, MessageSquare, Instagram, Twitter, MapPin } from 'lucide-react';
import styles from './Contact.module.css';

const ContactItem = ({ icon: Icon, label, value, href }) => (
    <motion.a
        href={href}
        className={styles.contactItem}
        whileHover={{ x: 10 }}
        transition={{ type: 'spring', stiffness: 300 }}
    >
        <div className={styles.iconBox}>
            <Icon size={24} />
        </div>
        <div className={styles.itemInfo}>
            <label>{label}</label>
            <span>{value}</span>
        </div>
    </motion.a>
);

const Contact = () => {
    return (
        <div className={styles.pageWrapper}>
            <Navbar />

            <main className={styles.container}>
                <div className={styles.contentGrid}>
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={styles.textSection}
                    >
                        <h1 className={styles.title}>Let's talk <br /><span className={styles.accent}>Foodify.</span></h1>
                        <p className={styles.subtitle}>
                            Have questions about ingredients, nutrition data, or want to partner with us?
                            Reach out and our nutrition experts will get back to you.
                        </p>

                        <div className={styles.contactList}>
                            <ContactItem
                                icon={Mail}
                                label="Email Us"
                                value="hello@foodify.com"
                                href="mailto:hello@foodify.com"
                            />
                            <ContactItem
                                icon={MapPin}
                                label="Base"
                                value="Global Nutrition Hub"
                                href="#"
                            />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className={styles.socialGrid}
                    >
                        <div className={styles.glassCard}>
                            <h3 className={styles.cardTitle}>Social Channels</h3>
                            <div className={styles.socialLinks}>
                                <a href="#" className={styles.socialBtn}><Instagram /></a>
                                <a href="#" className={styles.socialBtn}><Twitter /></a>
                                <a href="#" className={styles.socialBtn}><MessageSquare /></a>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default Contact;
