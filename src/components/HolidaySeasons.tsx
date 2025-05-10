import React, {useEffect, useState} from 'react';
import styles from './HolidaySeasons.module.css'

type HolidaySeasonsProps = {
    children: React.ReactElement;
}

type Snowflake = {
    id: number;
    top: string;
    left: string;
    fontSize: string;
    color: string;
    animationDuration: string;
    animationDelay: string;
    filter: string;
};

export function HolidaySeasons(data: HolidaySeasonsProps) : React.ReactElement {
    const [snowflakes, setSnowflakes] = useState<Snowflake[]>([]);
    const [currentSeason,] = useState(() => {
        // Detect Christmas in the week before and after the 25th of December
        // Detect Halloween in the week before and after the 31st of October
        // Detect Easter in the week before and after the 1st of April
        const date = new Date();
        const christmasStart = new Date(date.getFullYear(), 11, 18);
        const christmasEnd = new Date(date.getFullYear(), 0, 1);
        const halloweenStart = new Date(date.getFullYear(), 9, 24);
        const halloweenEnd = new Date(date.getFullYear(), 10, 7);
        const easterStart = new Date(date.getFullYear(), 3, 25);
        const easterEnd = new Date(date.getFullYear(), 4, 1);

        if ((date >= christmasStart && date <= christmasEnd) || window.location.search.includes('christmas')) {
            return 'christmas';
        } else if ((date >= halloweenStart && date <= halloweenEnd) || window.location.search.includes('halloween')) {
            return 'halloween';
        } else if ((date >= easterStart && date <= easterEnd) || window.location.search.includes('easter')) {
            return 'easter';
        } else {
            return null;
        }
    })

    if (!currentSeason) {
        return data.children
    }

    useEffect(() => {
        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // If the user prefers reduced motion, don't show the snowflakes
        if (prefersReducedMotion) {
            return;
        }

        const numFlakes = 50;
        const colors = ['#ffffff', '#d4f1f9', '#e8f8ff'];

        const generatedFlakes = Array.from({ length: numFlakes }, (_, i) => ({
            id: i,
            top: '-10vh',
            left: `${Math.random() * 100}vw`,
            fontSize: `${Math.random() * 10 + 6}px`,
            color: colors[Math.floor(Math.random() * colors.length)],
            animationDuration: `${Math.random() * 3 + 6}s`,
            animationDelay: `${Math.random() * 5}s`,
            filter: currentSeason === 'christmas' ? 'brightness(5) drop-shadow(0 0 5px #ffffff50)' : currentSeason === 'halloween' ? 'brightness(1) drop-shadow(0 0 5px #ff8c0050)' : 'brightness(1) drop-shadow(0 0 5px #ff69b4aa)',
        }));

        setSnowflakes(generatedFlakes);
    }, []);

    return (
        <>
            <div className={styles.snowfall}>
                {snowflakes.map((flake) => (
                    <div
                        key={flake.id}
                        className={styles.snowflake}
                        style={{
                            top: flake.top,
                            left: flake.left,
                            fontSize: flake.fontSize,
                            color: flake.color,
                            animationDuration: flake.animationDuration,
                            animationDelay: flake.animationDelay,
                            filter: flake.filter,
                        }}
                    >
                        {currentSeason === 'christmas' ? <>&#10052;</> : currentSeason === 'halloween' ? <>&#127875;</> : <>&#128048;</>}
                    </div>
                ))}
            </div>
            <div className={styles.content}>
                {data.children}
            </div>
        </>
    );
}
