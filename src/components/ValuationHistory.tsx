import { useState, useEffect } from 'react';
import { Folder, FileText, Trash2, ArrowRight, Clock, Building2 } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { valuationService, type Company, type Valuation } from '../services/valuationService';
import { formatCurrency } from '../utils/formatters';
import type { ValuationResult } from '../types/valuation';

interface ValuationHistoryProps {
    onLoadValuation: (inputs: any) => void;
    onClose: () => void;
}

export function ValuationHistory({ onLoadValuation, onClose }: ValuationHistoryProps) {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [valuations, setValuations] = useState<Record<string, Valuation[]>>({});
    const [loading, setLoading] = useState(true);
    const [expandedCompany, setExpandedCompany] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const comps = await valuationService.getCompanies();
            setCompanies(comps);

            // Load valuations for each company
            const vals: Record<string, Valuation[]> = {};
            for (const comp of comps) {
                const compVals = await valuationService.getValuations(comp.id);
                vals[comp.id] = compVals;
            }
            setValuations(vals);
        } catch (error) {
            console.error(error);
            alert('Erro ao carregar histórico.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteValuation = async (id: string, companyId: string) => {
        if (!confirm('Tem certeza que deseja excluir esta avaliação?')) return;

        try {
            await valuationService.deleteValuation(id);
            setValuations(prev => ({
                ...prev,
                [companyId]: prev[companyId].filter(v => v.id !== id)
            }));
        } catch (error) {
            console.error(error);
            alert('Erro ao excluir avaliação.');
        }
    };

    const handleDeleteCompany = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir esta empresa e todos os seus valuations?')) return;

        try {
            await valuationService.deleteCompany(id);
            setCompanies(prev => prev.filter(c => c.id !== id));
            const newValuations = { ...valuations };
            delete newValuations[id];
            setValuations(newValuations);
        } catch (error) {
            console.error(error);
            alert('Erro ao excluir empresa.');
        }
    };

    const toggleCompany = (companyId: string) => {
        setExpandedCompany(expandedCompany === companyId ? null : companyId);
    };

    const formatDate = (dateString: string) => {
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(dateString));
    };

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex justify-end">
            <div className="w-full max-w-md bg-chumbo-950 border-l border-chumbo-800 h-full overflow-y-auto p-6 animate-in slide-in-from-right shadow-2xl">

                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Folder className="w-5 h-5 text-gold-500" />
                            Meus Valuations
                        </h2>
                        <p className="text-sm text-chumbo-400">Histórico de avaliações salvas</p>
                    </div>
                    <Button onClick={onClose} className="bg-transparent hover:bg-chumbo-800 text-chumbo-400 hover:text-white">Fechar</Button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-500"></div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {companies.length === 0 && (
                            <div className="text-center py-10 text-chumbo-600">
                                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>Nenhuma empresa cadastrada.</p>
                            </div>
                        )}

                        {companies.map(company => (
                            <Card key={company.id} className="border-chumbo-800 bg-chumbo-900/40 overflow-hidden">
                                <div
                                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-chumbo-800/50 transition-colors"
                                    onClick={() => toggleCompany(company.id)}
                                >
                                    <div className="flex items-center gap-3">
                                        <Building2 className="w-4 h-4 text-chumbo-400" />
                                        <span className="font-medium text-chumbo-200">{company.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-chumbo-500 bg-chumbo-800 px-2 py-1 rounded-full">
                                            {valuations[company.id]?.length || 0}
                                        </span>
                                        <button
                                            className="p-1 text-chumbo-600 hover:text-red-500 transition-colors rounded hover:bg-red-900/10"
                                            title="Excluir Empresa"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteCompany(company.id);
                                            }}
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>

                                {expandedCompany === company.id && (
                                    <div className="border-t border-chumbo-800 bg-chumbo-900/20">
                                        {valuations[company.id]?.map(val => {
                                            // Cast inputs and results to correct types
                                            const results = val.results as unknown as ValuationResult;

                                            return (
                                                <div key={val.id} className="p-4 border-b border-chumbo-800/50 last:border-0 hover:bg-chumbo-800/30 transition-colors relative group">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="text-xs text-chumbo-500 flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {formatDate(val.created_at)}
                                                        </span>
                                                        <button
                                                            className="h-6 w-6 p-0 text-chumbo-600 hover:text-red-500 transition-colors flex items-center justify-center rounded"
                                                            title="Excluir Valuation"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteValuation(val.id, company.id);
                                                            }}
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    </div>

                                                    <div className="flex justify-between items-end">
                                                        <div>
                                                            <p className="text-lg font-bold text-white">
                                                                {formatCurrency(results.enterpriseValue)}
                                                            </p>
                                                            <p className="text-xs text-chumbo-400">
                                                                Múltiplo: {results.finalMultiple.toFixed(2)}x
                                                            </p>
                                                        </div>
                                                        <Button
                                                            className="bg-gold-500/10 text-gold-500 hover:bg-gold-500 hover:text-chumbo-950 border border-gold-500/30 text-xs px-2 py-1 h-auto font-medium"
                                                            onClick={() => {
                                                                onLoadValuation(val.inputs);
                                                                onClose();
                                                            }}
                                                        >
                                                            Carregar <ArrowRight className="w-3 h-3 ml-1" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {(!valuations[company.id] || valuations[company.id].length === 0) && (
                                            <p className="p-4 text-xs text-chumbo-500 italic">Nenhum valuation salvo.</p>
                                        )}
                                    </div>
                                )}
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
