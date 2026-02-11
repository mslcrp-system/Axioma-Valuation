export const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
};

export const formatPercentage = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'percent',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
    }).format(value / 100);
};

export const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
        maximumFractionDigits: 1,
    }).format(value);
}
