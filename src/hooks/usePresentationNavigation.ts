import { useState, useEffect, useCallback } from 'react';

export const usePresentationNavigation = (totalSlides: number) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const nextSlide = useCallback(() => {
        setCurrentSlide((prev) => Math.min(prev + 1, totalSlides - 1));
    }, [totalSlides]);

    const prevSlide = useCallback(() => {
        setCurrentSlide((prev) => Math.max(prev - 1, 0));
    }, []);

    const goToSlide = useCallback((index: number) => {
        setCurrentSlide(Math.max(0, Math.min(index, totalSlides - 1)));
    }, [totalSlides]);

    const toggleFullscreen = useCallback(() => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'ArrowRight':
                case ' ':
                    e.preventDefault();
                    nextSlide();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    prevSlide();
                    break;
                case 'Escape':
                    if (document.fullscreenElement) {
                        document.exitFullscreen();
                        setIsFullscreen(false);
                    }
                    break;
                case 'f':
                case 'F':
                    e.preventDefault();
                    toggleFullscreen();
                    break;
            }
        };

        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        window.addEventListener('keydown', handleKeyDown);
        document.addEventListener('fullscreenchange', handleFullscreenChange);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, [nextSlide, prevSlide, toggleFullscreen]);

    return {
        currentSlide,
        isFullscreen,
        nextSlide,
        prevSlide,
        goToSlide,
        toggleFullscreen,
    };
};
