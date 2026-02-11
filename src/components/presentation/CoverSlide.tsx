import { formatCurrency } from '../../utils/formatters';

interface CoverSlideProps {
    companyName: string;
    enterpriseValue: number;
    date: string;
}

export function CoverSlide({ companyName, enterpriseValue, date }: CoverSlideProps) {
    return (
        <div className="h-full flex flex-col items-center justify-center text-center px-12">
            {/* Logo/Brand */}
            <div className="mb-12">
                <h1 className="text-6xl font-black text-gold-500 mb-2">AXIOMA</h1>
                <p className="text-xl text-chumbo-400">Valuation & Advisory</p>
            </div>

            {/* Company Name */}
            <h2 className="text-5xl font-bold text-white mb-16">
                {companyName || 'Análise de Valuation'}
            </h2>

            {/* Main Value */}
            <div className="mb-12">
                <p className="text-2xl text-chumbo-400 mb-4">Enterprise Value</p>
                <p className="text-8xl font-black text-gold-500 animate-pulse">
                    {formatCurrency(enterpriseValue)}
                </p>
            </div>

            {/* Date */}
            <p className="text-lg text-chumbo-500 mt-auto">
                {date}
            </p>
        </div>
    );
}
