import React, { useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
import styles from './InteractiveBackground.module.css';

const Snowflake = ({ id }) => {
    const style = useMemo(() => ({
        left: `${Math.random() * 100}%`,
        animationDuration: `${Math.random() * 8 + 7}s`,
        animationDelay: `${Math.random() * 5}s`,
        fontSize: `${Math.random() * 5 + 8}px`,
        opacity: Math.random() * 0.3 + 0.1,
    }), []);

    return (
        <div className={styles.snowflake} style={style}>
            *
        </div>
    );
};

const InteractiveBackground = () => {
    const { theme } = useTheme();
    const snowflakes = useMemo(() => Array.from({ length: 30 }, (_, i) => i), []);

    // Premium static concentric circles matching screenshot exactly
    const circles = useMemo(() => Array.from({ length: 14 }, (_, i) => i), []);

    return (
        <div className={styles.container} data-theme={theme}>
            {/* Background Dot Grid */}
            <div className={styles.dotGrid} />

            {/* Static Centered Ripples - Exact Spacing & Stroke */}
            <div className={styles.rippleContainer}>
                {circles.map(i => (
                    <div
                        key={i}
                        className={styles.circle}
                        style={{
                            width: `${280 + i * 160}px`,
                            height: `${280 + i * 160}px`,
                            opacity: Math.max(0.015, 0.14 - (i * 0.009)),
                        }}
                    />
                ))}
            </div>

            {/* Subtle Snowflakes (Festive override, no Santa/Deer) */}
            <div className={styles.snowflakesContainer}>
                {snowflakes.map(id => (
                    <Snowflake key={id} />
                ))}
            </div>

            {/* Smooth Vignette */}
            <div className={styles.vignette} />
        </div>
    );
};

export default InteractiveBackground;
