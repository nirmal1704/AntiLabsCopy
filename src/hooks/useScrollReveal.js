import { useEffect, useRef, useState } from 'react';

/**
 * Hook that returns a ref and `visible` boolean.
 * `visible` becomes true once the element enters the viewport.
 */
export function useScrollReveal(options = {}) {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    observer.disconnect(); // Fire only once
                }
            },
            {
                threshold: options.threshold ?? 0.12,
                rootMargin: options.rootMargin ?? '0px 0px -40px 0px',
            }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return { ref, visible };
}
