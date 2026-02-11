import { CheckCircle, Target } from 'lucide-react';
import type { ValuationInputs, ValuationResult } from '../../types/valuation';
import { generateRecommendations } from '../../utils/presentationHelpers';

interface RoadmapSlideProps {
    inputs: ValuationInputs;
    results: ValuationResult;
}

export function RoadmapSlide({ inputs, results }: RoadmapSlideProps) {
    const recommendations = generateRecommendations(inputs, results);

    return (
        <div className="h-full flex flex-col justify-center px-12">
            <h2 className="text-5xl font-bold text-white mb-12">Roadmap de Valorização</h2>

            <div className="space-y-6">
                {recommendations.map((rec, idx) => (
                    <div
                        key={idx}
                        className="bg-gradient-to-r from-chumbo-800/50 to-chumbo-800/30 p-6 rounded-xl border-l-4 border-gold-500"
                    >
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-12 h-12 bg-gold-500/20 rounded-full flex items-center justify-center border-2 border-gold-500">
                                <span className="text-2xl font-bold text-gold-500">{idx + 1}</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-2xl font-bold text-white mb-2">{rec.title}</h3>
                                <div className="flex items-center gap-2 text-green-400">
                                    <Target className="w-5 h-5" />
                                    <span className="text-lg font-semibold">{rec.impact}</span>
                                </div>
                            </div>
                            <CheckCircle className="w-8 h-8 text-chumbo-600" />
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-12 bg-blue-500/10 border border-blue-500/50 p-6 rounded-xl">
                <p className="text-xl text-blue-300 text-center">
                    💡 <strong>Timeline Sugerido:</strong> 6-12 meses para implementação completa
                </p>
            </div>
        </div>
    );
}
