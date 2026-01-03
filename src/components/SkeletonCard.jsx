import React from 'react';
import styles from './SkeletonCard.module.css';

const SkeletonCard = () => {
    return (
        <div className={styles.skeletonCard}>
            <div className={styles.imageSkeleton} />
            <div className={styles.infoSkeleton}>
                <div className={styles.categorySkeleton} />
                <div className={styles.titleSkeleton} />
                <div className={styles.footerSkeleton}>
                    <div className={styles.brandSkeleton} />
                    <div className={styles.btnSkeleton} />
                </div>
            </div>
        </div>
    );
};

export default SkeletonCard;
