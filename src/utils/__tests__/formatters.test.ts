import { describe, it, expect } from 'vitest';
import { formatCurrency, formatPercentage, formatNumber } from '../formatters';

describe('formatters', () => {
    describe('formatCurrency', () => {
        it('should format positive numbers as BRL currency', () => {
            expect(formatCurrency(1000)).toBe('R$ 1.000,00');
            expect(formatCurrency(1500.50)).toBe('R$ 1.500,50');
        });

        it('should format zero correctly', () => {
            expect(formatCurrency(0)).toBe('R$ 0,00');
        });

        it('should format negative numbers correctly', () => {
            expect(formatCurrency(-500)).toBe('-R$ 500,00');
        });

        it('should format large numbers correctly', () => {
            expect(formatCurrency(1000000)).toBe('R$ 1.000.000,00');
        });
    });

    describe('formatPercentage', () => {
        it('should format percentages correctly', () => {
            expect(formatPercentage(10)).toBe('10,0%');
            expect(formatPercentage(50)).toBe('50,0%');
            expect(formatPercentage(100)).toBe('100,0%');
        });

        it('should format decimal percentages', () => {
            expect(formatPercentage(15.5)).toBe('15,5%');
        });

        it('should format zero correctly', () => {
            expect(formatPercentage(0)).toBe('0,0%');
        });
    });

    describe('formatNumber', () => {
        it('should format numbers with one decimal place', () => {
            expect(formatNumber(10.5)).toBe('10,5');
            expect(formatNumber(100.75)).toBe('100,8');
        });

        it('should format whole numbers', () => {
            expect(formatNumber(100)).toBe('100');
        });

        it('should format large numbers with thousand separators', () => {
            expect(formatNumber(1000)).toBe('1.000');
            expect(formatNumber(1000000)).toBe('1.000.000');
        });
    });
});
