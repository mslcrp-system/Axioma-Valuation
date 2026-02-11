import { useMemo } from 'react';
import type { ValuationInputs, ValuationResult } from '../types/valuation';

export const useValuation = (inputs: ValuationInputs): ValuationResult => {
    return useMemo(() => {
        // 1. Base Calculations
        const annualEbitda = inputs.monthlyEbitda * 12;
        const baseValue = annualEbitda * inputs.sectorMultiple;

        // 2. Risk Adjustment (Dependency Penalty)
        // Logic Refinement: 50% dependency is a MAJOR risk. It should cut value significantly.
        // 0-20%: Safe zone.
        // 20-50%: Moderate to High risk.
        // 50-100%: Severe risk.
        let penaltyFactor = 0;
        if (inputs.ownerDependency > 20) {
            const dependencyRatio = (inputs.ownerDependency - 20) / 80; // normalized 0-1
            // Use power of 2 (quadratic) instead of 3 (cubic) or 1.2 to make it bite earlier.
            // At 50% (ratio 0.375):
            // Ratio^2 = 0.14. 
            // Ratio^1.5 = 0.23.
            // Let's use a clearer custom curve.
            // We want 50% dependency to hit ~15-20% penalty effectively.
            const maxPenaltyRate = 0.50; // Max 50% haircut
            penaltyFactor = Math.pow(dependencyRatio, 1.5) * maxPenaltyRate;
        }

        // 3. Growth Premium (With Realization Factor)
        // Logic: Growth is only valuable if it's sustainable (Governance) and transferable (Low Dependency).
        // If Dependency is high, Growth is "fake" or "at risk".
        const baselineGrowth = 5;
        const growthDiff = Math.max(0, inputs.annualGrowth - baselineGrowth);

        // Reduced base factor from 0.15 to 0.10 to be less aggressive essentially
        let rawGrowthFactor = growthDiff * 0.10;

        // Realization Factor (The "Quality" of the Growth)
        // 1. Dependency Impact: High dependency kills growth transferability.
        // Dependency 0% -> Factor 1.0
        // Dependency 50% -> Factor 0.5
        // Dependency 100% -> Factor 0.0
        const dependencyDampener = Math.max(0, 1 - (inputs.ownerDependency / 80)); // 80% dependency kills growth completely

        // 2. Governance Impact: Low governance makes growth risky/messy.
        // Governance 10 -> Factor 1.0
        // Governance 0 -> Factor 0.5 (Growth still has some value even in chaos, but less)
        const governanceDampener = 0.5 + (inputs.governanceScore / 20); // 0.5 to 1.0

        const growthRealization = dependencyDampener * governanceDampener;
        const finalGrowthFactor = rawGrowthFactor * growthRealization;

        const growthPremium = (annualEbitda * finalGrowthFactor);

        // 4. Governance Premium (Base)
        const maxPremiumRate = 0.15; // Reduced from 20% to avoid over-inflation
        const governanceRatio = Math.max(0, inputs.governanceScore - 5) / 5;
        const governancePremiumFactor = inputs.governanceScore > 5
            ? governanceRatio * maxPremiumRate
            : 0;

        const governancePremium = baseValue * governancePremiumFactor;
        const dependencyPenalty = (baseValue + growthPremium) * penaltyFactor; // Penalty applies to total potential

        // 5. Final Values
        const enterpriseValue = Math.max(0, baseValue + growthPremium - dependencyPenalty + governancePremium);
        const equityValue = enterpriseValue - inputs.netDebt;

        // 6. Value Gap Calculation
        // Potential: Low Dependency (20%), Good Governance (9), Sustained Growth
        // We calculate "What it COULD be"
        const potentialGovernanceFactor = ((9 - 5) / 5) * maxPremiumRate; // Benchmark: 9/10 score
        const potentialGrowthRealization = 1.0; // Perfect realization
        const potentialGrowthFactor = growthDiff * 0.10 * potentialGrowthRealization;

        const potentialValue = (annualEbitda * inputs.sectorMultiple)
            + (annualEbitda * potentialGrowthFactor)
            + (annualEbitda * inputs.sectorMultiple * potentialGovernanceFactor);

        const valueGap = Math.max(0, potentialValue - enterpriseValue);

        // Calculate effective multiple
        const finalMultiple = annualEbitda > 0 ? enterpriseValue / annualEbitda : 0;
        const potentialMultiple = annualEbitda > 0 ? potentialValue / annualEbitda : 0;

        return {
            annualEbitda,
            baseValue,
            dependencyPenalty,
            governancePremium,
            growthPremium,
            enterpriseValue,
            equityValue,
            finalMultiple,
            valueGap,
            potentialMultiple,
        };
    }, [inputs]);
};
