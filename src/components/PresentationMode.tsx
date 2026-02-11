import { X, ChevronLeft, ChevronRight, Maximize } from 'lucide-react';
import { usePresentationNavigation } from '../hooks/usePresentationNavigation';
import type { ValuationInputs, ValuationResult } from '../types/valuation';
import { CoverSlide } from './presentation/CoverSlide';
import { CurrentStateSlide } from './presentation/CurrentStateSlide';
import { DiagnosisSlide } from './presentation/DiagnosisSlide';
import { ValueGapSlide } from './presentation/ValueGapSlide';
import { RoadmapSlide } from './presentation/RoadmapSlide';
import { FutureScenarioSlide } from './presentation/FutureScenarioSlide';
import { CallToActionSlide } from './presentation/CallToActionSlide';

interface PresentationModeProps {
    inputs: ValuationInputs;
    results: ValuationResult;
    companyName: string;
    onClose: () => void;
}

export function PresentationMode({ inputs, results, companyName, onClose }: PresentationModeProps) {
    const totalSlides = 7;
    const { currentSlide, isFullscreen, nextSlide, prevSlide, toggleFullscreen } = usePresentationNavigation(totalSlides);

    const slides = [
        <CoverSlide
            key={0}
            companyName={companyName}
            enterpriseValue={results.enterpriseValue}
            date={new Date().toLocaleDateString('pt-BR')}
        />,
        <CurrentStateSlide key={1} inputs={inputs} results={results} />,
        <DiagnosisSlide key={2} inputs={inputs} results={results} />,
        <ValueGapSlide key={3} results={results} />,
        <RoadmapSlide key={4} inputs={inputs} results={results} />,
        <FutureScenarioSlide key={5} inputs={inputs} results={results} />,
        <CallToActionSlide key={6} />,
    ];

    return (
        <div className="fixed inset-0 z-50 bg-gradient-to-br from-chumbo-950 via-chumbo-900 to-chumbo-950">
            {/* Navigation Controls */}
            <div className="absolute top-6 right-6 flex items-center gap-3 z-10">
                <button
                    onClick={toggleFullscreen}
                    className="p-3 bg-chumbo-800/80 hover:bg-chumbo-700 rounded-lg text-white transition-colors"
                    title={isFullscreen ? 'Sair do fullscreen (F)' : 'Fullscreen (F)'}
                >
                    <Maximize className="w-5 h-5" />
                </button>
                <button
                    onClick={onClose}
                    className="p-3 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 transition-colors"
                    title="Sair (ESC)"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Slide Content */}
            <div className="h-full w-full flex items-center justify-center p-8">
                <div className="w-full h-full max-w-7xl animate-fadeIn">
                    {slides[currentSlide]}
                </div>
            </div>

            {/* Bottom Navigation */}
            <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-6">
                <button
                    onClick={prevSlide}
                    disabled={currentSlide === 0}
                    className="p-3 bg-chumbo-800/80 hover:bg-chumbo-700 rounded-lg text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Anterior (←)"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>

                {/* Slide Indicators */}
                <div className="flex gap-2">
                    {Array.from({ length: totalSlides }).map((_, idx) => (
                        <div
                            key={idx}
                            className={`h-2 rounded-full transition-all ${idx === currentSlide
                                    ? 'w-8 bg-gold-500'
                                    : 'w-2 bg-chumbo-600 hover:bg-chumbo-500 cursor-pointer'
                                }`}
                            onClick={() => {
                                if (idx !== currentSlide) {
                                    // Allow clicking to jump to slide
                                    const event = new KeyboardEvent('keydown', {
                                        key: idx > currentSlide ? 'ArrowRight' : 'ArrowLeft'
                                    });
                                    for (let i = 0; i < Math.abs(idx - currentSlide); i++) {
                                        window.dispatchEvent(event);
                                    }
                                }
                            }}
                        />
                    ))}
                </div>

                <button
                    onClick={nextSlide}
                    disabled={currentSlide === totalSlides - 1}
                    className="p-3 bg-chumbo-800/80 hover:bg-chumbo-700 rounded-lg text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Próximo (→)"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>
            </div>

            {/* Keyboard Hints */}
            <div className="absolute bottom-6 left-6 text-xs text-chumbo-500">
                <p>← → Navegar | F Fullscreen | ESC Sair</p>
            </div>
        </div>
    );
}
