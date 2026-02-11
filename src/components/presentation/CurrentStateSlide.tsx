import { formatCurrency } from '../../utils/formatters';
import type { ValuationResult, ValuationInputs } from '../../types/valuation';

interface CurrentStateSlideProps {
    inputs: ValuationInputs;
    results: ValuationResult;
}

export function CurrentStateSlide({ inputs, results }: CurrentStateSlideProps) {
    const components = [
        { label: 'Valor Base', value: results.baseValue, color: 'text-blue-400' },
        { label: 'Prêmio de Crescimento', value: results.growthPremium, color: 'text-green-400' },
        { label: 'Prêmio de Governança', value: results.governancePremium, color: 'text-green-400' },
        { label: 'Pênalti de Dependência', value: -results.dependencyPenalty, color: 'text-red-400' },
    ];

    return (
        <div className="h-full flex flex-col justify-center px-12">
            <h2 className="text-5xl font-bold text-white mb-12">Situação Atual</h2>

            {/* Enterprise Value */}
            <div className="mb-12 text-center">
                <p className="text-2xl text-chumbo-400 mb-4">Enterprise Value</p>
                <p className="text-7xl font-black text-gold-500">
                    {formatCurrency(results.enterpriseValue)}
                </p>
            </div>

            {/* Multiple Comparison */}
            <div className="grid grid-cols-2 gap-8 mb-12">
                <div className="bg-chumbo-800/50 p-6 rounded-xl border border-chumbo-700">
                    <p className="text-lg text-chumbo-400 mb-2">Múltiplo de Mercado</p>
                    <p className="text-4xl font-bold text-white">{inputs.sectorMultiple.toFixed(1)}x</p>
                </div>
                <div className="bg-chumbo-800/50 p-6 rounded-xl border border-chumbo-700">
                    <p className="text-lg text-chumbo-400 mb-2">Múltiplo Efetivo</p>
                    <p className="text-4xl font-bold text-gold-500">{results.finalMultiple.toFixed(1)}x</p>
                </div>
            </div>

            {/* Value Composition */}
            <div className="space-y-3">
                <p className="text-xl text-chumbo-300 mb-4">Composição do Valor:</p>
                {components.map((comp, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-chumbo-800/30 p-4 rounded-lg">
                        <span className="text-lg text-chumbo-300">{comp.label}</span>
                        <span className={`text-2xl font-bold ${comp.color}`}>
                            {comp.value >= 0 ? '+' : ''}{formatCurrency(comp.value)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
