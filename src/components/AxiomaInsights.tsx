import { useState } from 'react';
import { Sparkles, Brain, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { generateValuationReport } from '../lib/gemini';

interface AxiomaInsightsProps {
    inputs: any;
    results: any;
}

export function AxiomaInsights({ inputs, results }: AxiomaInsightsProps) {
    const [report, setReport] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerateReport = async () => {
        setLoading(true);
        setError(null);
        try {
            const text = await generateValuationReport(inputs, results);
            setReport(text);
        } catch (err: any) {
            setError(err.message || 'Erro ao gerar relatório.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="border-gold-500/30 dark:border-gold-500/30 border-gold-600/20 bg-white dark:bg-gradient-to-br dark:from-chumbo-900 dark:to-chumbo-950 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-gray-200 dark:border-chumbo-800/50">
                <CardTitle className="flex items-center gap-2 text-gold-400">
                    <Sparkles className="w-5 h-5" />
                    Axioma Insights (IA)
                </CardTitle>
                {!report && !loading && (
                    <Button
                        onClick={handleGenerateReport}
                        className="bg-gold-500 hover:bg-gold-600 text-chumbo-950 font-bold flex items-center gap-2"
                    >
                        <Brain className="w-4 h-4" />
                        Gerar Análise Estratégica
                    </Button>
                )}
            </CardHeader>

            <CardContent className="pt-6">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-10 space-y-4 animate-in fade-in">
                        <Loader2 className="w-8 h-8 text-gold-500 animate-spin" />
                        <p className="text-chumbo-400 text-sm animate-pulse">
                            A Inteligência Artificial está analisando seus números...
                        </p>
                    </div>
                ) : error ? (
                    <div className="flex items-center gap-2 text-red-400 bg-red-950/20 p-4 rounded-lg border border-red-900/50">
                        <AlertTriangle className="w-5 h-5" />
                        <p>{error}</p>
                        <Button onClick={handleGenerateReport} className="ml-auto text-red-400 hover:text-red-300 hover:bg-red-900/30 bg-transparent h-auto px-3 py-1 text-xs border border-transparent hover:border-red-900/50">
                            Tentar novamente
                        </Button>
                    </div>
                ) : report ? (
                    <div className="prose prose-gray dark:prose-invert prose-gold max-w-none animate-in slide-in-from-bottom-2 fade-in duration-500">
                        <div className="whitespace-pre-wrap text-gray-800 dark:text-chumbo-100 text-sm leading-relaxed">
                            {report}
                        </div>
                        <div className="mt-6 flex justify-end">
                            <Button
                                onClick={() => setReport(null)}
                                className="border border-gray-300 dark:border-chumbo-700 text-gray-700 dark:text-chumbo-400 hover:bg-gray-100 dark:hover:bg-chumbo-800 hover:text-gray-900 dark:hover:text-white text-xs bg-transparent h-auto px-3 py-2"
                            >
                                Nova Análise
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-chumbo-400 mb-4 max-w-md mx-auto">
                            Descubra o que os números dizem. Nossa IA analisa a governança, dependência e crescimento para te dar um plano de ação claro.
                        </p>
                        <div className="flex justify-center gap-4 text-xs text-chumbo-500">
                            <span className="flex items-center gap-1"><ArrowRight className="w-3 h-3 text-gold-500" /> Identifica Riscos ocultos</span>
                            <span className="flex items-center gap-1"><ArrowRight className="w-3 h-3 text-gold-500" /> Sugere Melhorias</span>
                            <span className="flex items-center gap-1"><ArrowRight className="w-3 h-3 text-gold-500" /> Calcula Potencial</span>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
