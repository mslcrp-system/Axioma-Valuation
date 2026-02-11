import { describe, it, expect } from 'vitest';
import { useValuation } from '../useValuation';
import { renderHook } from '@testing-library/react';

describe('useValuation', () => {
    describe('Basic Calculations', () => {
        it('should calculate annual EBITDA correctly', () => {
            const { result } = renderHook(() => useValuation({
                monthlyEbitda: 10000,
                sectorMultiple: 4,
                annualGrowth: 10,
                ownerDependency: 0,
                governanceScore: 5,
                netDebt: 0,
            }));

            expect(result.current.annualEbitda).toBe(120000);
        });

        it('should calculate base value correctly', () => {
            const { result } = renderHook(() => useValuation({
                monthlyEbitda: 10000,
                sectorMultiple: 4,
                annualGrowth: 10,
                ownerDependency: 0,
                governanceScore: 5,
                netDebt: 0,
            }));

            expect(result.current.baseValue).toBe(480000); // 120000 * 4
        });
    });

    describe('Dependency Penalty', () => {
        it('should apply no penalty for low dependency (< 20%)', () => {
            const { result } = renderHook(() => useValuation({
                monthlyEbitda: 10000,
                sectorMultiple: 4,
                annualGrowth: 5, // baseline growth
                ownerDependency: 10,
                governanceScore: 5,
                netDebt: 0,
            }));

            expect(result.current.dependencyPenalty).toBe(0);
        });

        it('should apply significant penalty for high dependency (50%)', () => {
            const { result } = renderHook(() => useValuation({
                monthlyEbitda: 10000,
                sectorMultiple: 4,
                annualGrowth: 5,
                ownerDependency: 50,
                governanceScore: 5,
                netDebt: 0,
            }));

            expect(result.current.dependencyPenalty).toBeGreaterThan(0);
            expect(result.current.dependencyPenalty).toBeGreaterThan(50000); // Should be significant
        });

        it('should apply maximum penalty for extreme dependency (90%)', () => {
            const { result } = renderHook(() => useValuation({
                monthlyEbitda: 10000,
                sectorMultiple: 4,
                annualGrowth: 5,
                ownerDependency: 90,
                governanceScore: 5,
                netDebt: 0,
            }));

            expect(result.current.dependencyPenalty).toBeGreaterThan(100000);
        });
    });

    describe('Governance Premium', () => {
        it('should apply no premium for low governance (< 5)', () => {
            const { result } = renderHook(() => useValuation({
                monthlyEbitda: 10000,
                sectorMultiple: 4,
                annualGrowth: 5,
                ownerDependency: 0,
                governanceScore: 4,
                netDebt: 0,
            }));

            expect(result.current.governancePremium).toBe(0);
        });

        it('should apply premium for good governance (> 5)', () => {
            const { result } = renderHook(() => useValuation({
                monthlyEbitda: 10000,
                sectorMultiple: 4,
                annualGrowth: 5,
                ownerDependency: 0,
                governanceScore: 8,
                netDebt: 0,
            }));

            expect(result.current.governancePremium).toBeGreaterThan(0);
        });

        it('should apply maximum premium for excellent governance (10)', () => {
            const { result } = renderHook(() => useValuation({
                monthlyEbitda: 10000,
                sectorMultiple: 4,
                annualGrowth: 5,
                ownerDependency: 0,
                governanceScore: 10,
                netDebt: 0,
            }));

            expect(result.current.governancePremium).toBeGreaterThan(50000);
        });
    });

    describe('Growth Premium', () => {
        it('should apply no premium for baseline growth (5%)', () => {
            const { result } = renderHook(() => useValuation({
                monthlyEbitda: 10000,
                sectorMultiple: 4,
                annualGrowth: 5,
                ownerDependency: 0,
                governanceScore: 5,
                netDebt: 0,
            }));

            expect(result.current.growthPremium).toBe(0);
        });

        it('should apply premium for above-baseline growth', () => {
            const { result } = renderHook(() => useValuation({
                monthlyEbitda: 10000,
                sectorMultiple: 4,
                annualGrowth: 15,
                ownerDependency: 0,
                governanceScore: 8,
                netDebt: 0,
            }));

            expect(result.current.growthPremium).toBeGreaterThan(0);
        });

        it('should dampen growth premium with high dependency', () => {
            const lowDependency = renderHook(() => useValuation({
                monthlyEbitda: 10000,
                sectorMultiple: 4,
                annualGrowth: 20,
                ownerDependency: 10,
                governanceScore: 8,
                netDebt: 0,
            }));

            const highDependency = renderHook(() => useValuation({
                monthlyEbitda: 10000,
                sectorMultiple: 4,
                annualGrowth: 20,
                ownerDependency: 80,
                governanceScore: 8,
                netDebt: 0,
            }));

            expect(lowDependency.result.current.growthPremium).toBeGreaterThan(
                highDependency.result.current.growthPremium
            );
        });
    });

    describe('Enterprise Value and Equity Value', () => {
        it('should calculate enterprise value correctly', () => {
            const { result } = renderHook(() => useValuation({
                monthlyEbitda: 10000,
                sectorMultiple: 4,
                annualGrowth: 10,
                ownerDependency: 20,
                governanceScore: 7,
                netDebt: 0,
            }));

            expect(result.current.enterpriseValue).toBeGreaterThan(0);
            expect(result.current.enterpriseValue).toBeGreaterThan(result.current.baseValue);
        });

        it('should calculate equity value by subtracting net debt', () => {
            const { result } = renderHook(() => useValuation({
                monthlyEbitda: 10000,
                sectorMultiple: 4,
                annualGrowth: 10,
                ownerDependency: 20,
                governanceScore: 7,
                netDebt: 50000,
            }));

            expect(result.current.equityValue).toBe(
                result.current.enterpriseValue - 50000
            );
        });

        it('should never return negative enterprise value', () => {
            const { result } = renderHook(() => useValuation({
                monthlyEbitda: 1000,
                sectorMultiple: 2,
                annualGrowth: 0,
                ownerDependency: 100,
                governanceScore: 0,
                netDebt: 0,
            }));

            expect(result.current.enterpriseValue).toBeGreaterThanOrEqual(0);
        });
    });

    describe('Final Multiple', () => {
        it('should calculate final multiple correctly', () => {
            const { result } = renderHook(() => useValuation({
                monthlyEbitda: 10000,
                sectorMultiple: 4,
                annualGrowth: 10,
                ownerDependency: 20,
                governanceScore: 7,
                netDebt: 0,
            }));

            const expectedMultiple = result.current.enterpriseValue / result.current.annualEbitda;
            expect(result.current.finalMultiple).toBeCloseTo(expectedMultiple, 2);
        });

        it('should handle zero EBITDA gracefully', () => {
            const { result } = renderHook(() => useValuation({
                monthlyEbitda: 0,
                sectorMultiple: 4,
                annualGrowth: 10,
                ownerDependency: 20,
                governanceScore: 7,
                netDebt: 0,
            }));

            expect(result.current.finalMultiple).toBe(0);
        });
    });

    describe('Value Gap', () => {
        it('should calculate value gap for suboptimal conditions', () => {
            const { result } = renderHook(() => useValuation({
                monthlyEbitda: 10000,
                sectorMultiple: 4,
                annualGrowth: 15,
                ownerDependency: 70,
                governanceScore: 4,
                netDebt: 0,
            }));

            expect(result.current.valueGap).toBeGreaterThan(0);
            expect(result.current.potentialMultiple).toBeGreaterThan(result.current.finalMultiple);
        });

        it('should have minimal value gap for optimal conditions', () => {
            const { result } = renderHook(() => useValuation({
                monthlyEbitda: 10000,
                sectorMultiple: 4,
                annualGrowth: 15,
                ownerDependency: 10,
                governanceScore: 9,
                netDebt: 0,
            }));

            // Value gap should be small when conditions are near-optimal
            const gapPercentage = (result.current.valueGap / result.current.enterpriseValue) * 100;
            expect(gapPercentage).toBeLessThan(20);
        });
    });
});
