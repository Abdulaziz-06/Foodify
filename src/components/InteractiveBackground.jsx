import React, { useMemo, useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import styles from './InteractiveBackground.module.css';

/**
 * Animated Snowflake Component
 */
const Snowflake = () => {
    const style = useMemo(() => ({
        left: `${Math.random() * 100}%`,
        animationDuration: `${Math.random() * 8 + 7}s`,
        animationDelay: `${Math.random() * 5}s`,
        fontSize: `${Math.random() * 5 + 8}px`,
        opacity: Math.random() * 0.3 + 0.1,
    }), []);

    return <div className={styles.snowflake} style={style}>*</div>;
};

/**
 * Interactive Background Component
 */
const InteractiveBackground = () => {
    const { theme } = useTheme();

    // generating 120 snowflakes 
    const snowflakes = useMemo(() => Array.from({ length: 120 }, (_, i) => i), []);

    // Pre-calculated layers for the reactive ripple rings.
    const circles = useMemo(() => Array.from({ length: 14 }, (_, i) => i), []);

    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    /**
     * Mouse Interaction Listener for rings effects
     */
    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    /**
     * Dynamic Ripple Styling
     */
    const getCircleStyle = (index, baseSize) => {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const distance = Math.sqrt(
            Math.pow(mousePos.x - centerX, 2) +
            Math.pow(mousePos.y - centerY, 2)
        );

        const radius = baseSize / 2;
        const distanceFromRipple = Math.abs(distance - radius);

        // If the mouse is within 100px of a ring, it "paints" and glows.
        const isNear = distanceFromRipple < 100;

        return {
            width: `${baseSize}px`,
            height: `${baseSize}px`,
            opacity: isNear ?
                Math.max(0.06, 0.18 - (index * 0.009)) :
                Math.max(0.025, 0.14 - (index * 0.009)),
            transform: isNear ? 'scale(1.05)' : 'scale(1)',
        };
    };

    return (
        <div className={styles.container} data-theme={theme}>
            {/* Structural Foundation Layer */}
            <div className={styles.dotGrid} />

            {/* Reactive Ripple Layer */}
            <div className={styles.rippleContainer}>
                {circles.map(i => (
                    <div
                        key={i}
                        className={styles.circle}
                        style={getCircleStyle(i, 280 + i * 160)}
                    />
                ))}
            </div>

            {/* Denser Atmospheric Layer (Snowfall) */}
            <div className={styles.snowflakesContainer}>
                {snowflakes.map(id => (
                    <Snowflake key={id} />
                ))}
            </div>

            {/* Depth & Focus Layer */}
            <div className={styles.vignette} />
        </div>
    );
};

export default InteractiveBackground;
