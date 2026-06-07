import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLenis } from 'lenis/react';

/**
 * Scrolls the window to the top whenever the route pathname changes.
 * Place this once inside <BrowserRouter>, above all routes.
 */
export default function ScrollToTop() {
    const { pathname, search } = useLocation();
    const lenis = useLenis();

    useEffect(() => {
        if (lenis) {
            lenis.scrollTo(0, { immediate: true });
        } else {
            window.scrollTo({ top: 0, behavior: 'instant' });
        }
    }, [pathname, search, lenis]);

    return null;
}
