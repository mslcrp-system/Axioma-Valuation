export interface ValuationInputs {
    monthlyEbitda: number;
    sectorMultiple: number;
    annualGrowth: number; // Percentage 0-100+
    ownerDependency: number; // Percentage 0-100
    governanceScore: number; // 0-10
    netDebt: number;
}

export interface ValuationResult {
    annualEbitda: number;
    baseValue: number;
    dependencyPenalty: number;
    governancePremium: number;
    growthPremium: number;
    enterpriseValue: number;
    equityValue: number;
    finalMultiple: number;
    valueGap: number;
    potentialMultiple: number;
}
