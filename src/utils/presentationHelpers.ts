import type { ValuationInputs, ValuationResult } from '../types/valuation';

export const generateRecommendations = (inputs: ValuationInputs, results: ValuationResult) => {
    const recommendations: Array<{ title: string; impact: string; priority: number }> = [];

    // High dependency issue
    if (inputs.ownerDependency > 50) {
        recommendations.push({
            title: 'Reduzir Dependência do Dono',
            impact: `+${((results.dependencyPenalty / results.enterpriseValue) * 100).toFixed(0)}% no valuation`,
            priority: 1,
        });
    }

    // Low governance issue
    if (inputs.governanceScore < 6) {
        recommendations.push({
            title: 'Melhorar Governança Corporativa',
            impact: 'Até +15% de prêmio no valuation',
            priority: inputs.ownerDependency > 50 ? 2 : 1,
        });
    }

    // Growth opportunity
    if (inputs.annualGrowth < 10) {
        recommendations.push({
            title: 'Acelerar Crescimento',
            impact: 'Cada 5% de crescimento adiciona ~10% ao valor',
            priority: 3,
        });
    }

    // Debt optimization
    if (inputs.netDebt > results.annualEbitda * 2) {
        recommendations.push({
            title: 'Otimizar Estrutura de Capital',
            impact: `Reduzir dívida aumenta equity value em ${((inputs.netDebt / results.enterpriseValue) * 100).toFixed(0)}%`,
            priority: 2,
        });
    }

    return recommendations.sort((a, b) => a.priority - b.priority).slice(0, 3);
};

export const calculateFutureScenario = (inputs: ValuationInputs, results: ValuationResult) => {
    // Simulate improvements
    const improvedInputs = {
        ...inputs,
        ownerDependency: Math.max(20, inputs.ownerDependency - 30), // Reduce dependency
        governanceScore: Math.min(10, inputs.governanceScore + 3), // Improve governance
        annualGrowth: Math.min(25, inputs.annualGrowth + 5), // Increase growth
    };

    // Recalculate with improved inputs (simplified version)
    const baseValue = results.annualEbitda * inputs.sectorMultiple;

    // Reduced penalty
    const newPenaltyFactor = improvedInputs.ownerDependency > 20
        ? Math.pow((improvedInputs.ownerDependency - 20) / 80, 1.5) * 0.5
        : 0;
    const newPenalty = baseValue * newPenaltyFactor;

    // Improved governance premium
    const newGovPremium = improvedInputs.governanceScore > 5
        ? baseValue * ((improvedInputs.governanceScore - 5) / 5) * 0.15
        : 0;

    // Better growth realization
    const growthDiff = Math.max(0, improvedInputs.annualGrowth - 5);
    const newGrowthPremium = results.annualEbitda * growthDiff * 0.10 * 0.8; // 80% realization

    const futureEV = baseValue + newGrowthPremium - newPenalty + newGovPremium;
    const futureMultiple = futureEV / results.annualEbitda;

    return {
        futureEV,
        futureMultiple,
        improvement: futureEV - results.enterpriseValue,
        improvementPercent: ((futureEV - results.enterpriseValue) / results.enterpriseValue) * 100,
    };
};
