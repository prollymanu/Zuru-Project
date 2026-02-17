import { useEffect, useRef, useCallback } from 'react';

const useIdleTimer = (timeoutInMinutes, onIdle) => {
    const timeout = timeoutInMinutes * 60 * 1000;
    const timerRef = useRef(null);

    const resetTimer = useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            onIdle();
        }, timeout);
    }, [timeout, onIdle]);

    useEffect(() => {
        const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

        const handleActivity = () => {
            resetTimer();
        };

        // Initialize timer
        resetTimer();

        events.forEach(event => {
            window.addEventListener(event, handleActivity);
        });

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            events.forEach(event => {
                window.removeEventListener(event, handleActivity);
            });
        };
    }, [resetTimer]);

    return null;
};

export default useIdleTimer;
