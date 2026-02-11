import { TrendingUp } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import type { ValuationResult } from '../../types/valuation';

interface ValueGapSlideProps {
    results: ValuationResult;
}

export function ValueGapSlide({ results }: ValueGapSlideProps) {
    const gapPercentage = (results.valueGap / results.enterpriseValue) * 100;

    return (
        <div className="h-full flex flex-col justify-center px-12">
            <h2 className="text-5xl font-bold text-white mb-12">Potencial Oculto</h2>

            {/* Visual Comparison */}
            <div className="grid grid-cols-2 gap-12 mb-12">
                {/* Current */}
                <div className="text-center">
                    <p className="text-2xl text-chumbo-400 mb-4">Valor Atual</p>
                    <div className="bg-chumbo-800/50 p-8 rounded-xl border-2 border-chumbo-700">
                        <p className="text-5xl font-bold text-white">
                            {formatCurrency(results.enterpriseValue)}
                        </p>
                        <p className="text-xl text-chumbo-400 mt-2">
                            {results.finalMultiple.toFixed(1)}x EBITDA
                        </p>
                    </div>
                </div>

                {/* Potential */}
                <div className="text-center">
                    <p className="text-2xl text-gold-400 mb-4">Valor Potencial</p>
                    <div className="bg-gradient-to-br from-gold-500/20 to-gold-600/20 p-8 rounded-xl border-2 border-gold-500">
                        <p className="text-5xl font-bold text-gold-500">
                            {formatCurrency(results.enterpriseValue + results.valueGap)}
                        </p>
                        <p className="text-xl text-gold-400 mt-2">
                            {results.potentialMultiple.toFixed(1)}x EBITDA
                        </p>
                    </div>
                </div>
            </div>

            {/* Value Gap Highlight */}
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 p-8 rounded-xl border-2 border-green-500 text-center">
                <div className="flex items-center justify-center gap-4 mb-4">
                    <TrendingUp className="w-12 h-12 text-green-400" />
                    <p className="text-3xl font-bold text-white">Dinheiro na Mesa</p>
                </div>
                <p className="text-7xl font-black text-green-400 mb-2">
                    {formatCurrency(results.valueGap)}
                </p>
                <p className="text-2xl text-green-300">
                    +{gapPercentage.toFixed(0)}% de valorização potencial
                </p>
            </div>
        </div>
    );
}
