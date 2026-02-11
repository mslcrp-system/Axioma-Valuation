import { AlertTriangle, TrendingDown, Shield } from 'lucide-react';
import type { ValuationInputs, ValuationResult } from '../../types/valuation';
import { formatCurrency } from '../../utils/formatters';

interface DiagnosisSlideProps {
    inputs: ValuationInputs;
    results: ValuationResult;
}

export function DiagnosisSlide({ inputs, results }: DiagnosisSlideProps) {
    const issues = [];

    if (inputs.ownerDependency > 50) {
        issues.push({
            icon: AlertTriangle,
            title: 'Alta Dependência do Dono',
            description: `${inputs.ownerDependency}% da operação depende do proprietário`,
            impact: formatCurrency(results.dependencyPenalty),
            severity: 'critical',
        });
    }

    if (inputs.governanceScore < 6) {
        issues.push({
            icon: Shield,
            title: 'Governança Abaixo do Ideal',
            description: `Score atual: ${inputs.governanceScore}/10`,
            impact: 'Potencial de +15% com melhorias',
            severity: 'warning',
        });
    }

    if (inputs.annualGrowth < 10) {
        issues.push({
            icon: TrendingDown,
            title: 'Crescimento Limitado',
            description: `Taxa atual: ${inputs.annualGrowth}% ao ano`,
            impact: 'Oportunidade de aceleração',
            severity: 'info',
        });
    }

    return (
        <div className="h-full flex flex-col justify-center px-12">
            <h2 className="text-5xl font-bold text-white mb-12">Diagnóstico</h2>

            {issues.length === 0 ? (
                <div className="text-center">
                    <p className="text-3xl text-green-400 mb-4">✅ Empresa em Ótima Condição</p>
                    <p className="text-xl text-chumbo-400">Poucos pontos de melhoria identificados</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {issues.map((issue, idx) => {
                        const Icon = issue.icon;
                        const severityColors = {
                            critical: 'border-red-500 bg-red-500/10',
                            warning: 'border-yellow-500 bg-yellow-500/10',
                            info: 'border-blue-500 bg-blue-500/10',
                        };

                        return (
                            <div
                                key={idx}
                                className={`border-l-4 ${severityColors[issue.severity as keyof typeof severityColors]} p-6 rounded-r-xl`}
                            >
                                <div className="flex items-start gap-4">
                                    <Icon className="w-8 h-8 text-gold-500 flex-shrink-0 mt-1" />
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-bold text-white mb-2">{issue.title}</h3>
                                        <p className="text-lg text-chumbo-300 mb-3">{issue.description}</p>
                                        <p className="text-xl font-semibold text-red-400">
                                            Impacto: {issue.impact}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
