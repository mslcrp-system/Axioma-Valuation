import { TrendingUp, Sparkles } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import type { ValuationInputs, ValuationResult } from '../../types/valuation';
import { calculateFutureScenario } from '../../utils/presentationHelpers';

interface FutureScenarioSlideProps {
    inputs: ValuationInputs;
    results: ValuationResult;
}

export function FutureScenarioSlide({ inputs, results }: FutureScenarioSlideProps) {
    const future = calculateFutureScenario(inputs, results);

    return (
        <div className="h-full flex flex-col justify-center px-12">
            <div className="flex items-center gap-4 mb-12">
                <Sparkles className="w-12 h-12 text-gold-500" />
                <h2 className="text-5xl font-bold text-white">Cenário Futuro</h2>
            </div>

            {/* Before/After Comparison */}
            <div className="grid grid-cols-2 gap-12 mb-12">
                {/* Before */}
                <div>
                    <p className="text-2xl text-chumbo-400 mb-4 text-center">Hoje</p>
                    <div className="bg-chumbo-800/50 p-8 rounded-xl border-2 border-chumbo-700 text-center">
                        <p className="text-5xl font-bold text-white mb-4">
                            {formatCurrency(results.enterpriseValue)}
                        </p>
                        <p className="text-xl text-chumbo-400">
                            {results.finalMultiple.toFixed(1)}x EBITDA
                        </p>
                    </div>
                </div>

                {/* After */}
                <div>
                    <p className="text-2xl text-gold-400 mb-4 text-center">Após Melhorias</p>
                    <div className="bg-gradient-to-br from-gold-500/20 to-gold-600/20 p-8 rounded-xl border-2 border-gold-500 text-center">
                        <p className="text-5xl font-bold text-gold-500 mb-4">
                            {formatCurrency(future.futureEV)}
                        </p>
                        <p className="text-xl text-gold-400">
                            {future.futureMultiple.toFixed(1)}x EBITDA
                        </p>
                    </div>
                </div>
            </div>

            {/* Improvement Highlight */}
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-8 rounded-xl border-2 border-green-500">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <TrendingUp className="w-12 h-12 text-green-400" />
                        <div>
                            <p className="text-2xl font-bold text-white">Valorização Projetada</p>
                            <p className="text-lg text-green-300">Com implementação do roadmap</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-6xl font-black text-green-400">
                            +{future.improvementPercent.toFixed(0)}%
                        </p>
                        <p className="text-2xl text-green-300 mt-2">
                            {formatCurrency(future.improvement)}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
