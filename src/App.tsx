import { useState, useEffect } from 'react';
import { generatePDF } from './utils/pdfGenerator';
import { useValuation } from './hooks/useValuation';
import { Input } from './components/ui/Input';
import { Label } from './components/ui/Label';
import { Button } from './components/ui/Button';
import { Slider } from './components/ui/Slider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './components/ui/Card';
import { formatCurrency } from './utils/formatters';
import { Calculator, TrendingUp, AlertTriangle, ShieldCheck, DollarSign, Lightbulb, ArrowRight, LogOut, Save, Plus, Folder, Download, Moon, Sun, Clock, Presentation } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import { AuthForm } from './components/AuthForm';
import { FileUpload } from './components/FileUpload';
import { ValuationHistory } from './components/ValuationHistory';
import { AxiomaInsights } from './components/AxiomaInsights';
import { PresentationMode } from './components/PresentationMode';
import { valuationService, type Company } from './services/valuationService';

function App() {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [presentationMode, setPresentationMode] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    // Always start in dark mode
    document.documentElement.classList.add('dark');
    return 'dark';
  });

  // Apply theme to HTML element for Tailwind dark: classes
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Save Modal State
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [newCompanyName, setNewCompanyName] = useState('');
  const [isCreatingCompany, setIsCreatingCompany] = useState(false);

  const [inputs, setInputs] = useState({
    monthlyEbitda: 0,
    sectorMultiple: 4,
    annualGrowth: 10,
    ownerDependency: 90, // Default to high dependency to show impact
    governanceScore: 4,  // Default to low governance
    netDebt: 0,
  });

  const results = useValuation(inputs);

  // Load companies when modal opens
  useEffect(() => {
    if (showSaveModal && user) {
      valuationService.getCompanies().then(setCompanies).catch(console.error);
    }
  }, [showSaveModal, user]);

  const handleSave = async () => {
    try {
      setLoading(true);
      let companyId = selectedCompanyId;

      if (isCreatingCompany && newCompanyName) {
        const newCompany = await valuationService.createCompany(newCompanyName, 'General'); // Sector hardcoded for now
        companyId = newCompany.id;
      }

      if (!companyId) {
        alert('Selecione ou crie uma empresa para salvar.');
        return;
      }

      await valuationService.saveValuation(companyId, inputs, results);
      alert('Valuation salvo com sucesso!');
      setShowSaveModal(false);
      // Reset modal state
      setNewCompanyName('');
      setIsCreatingCompany(false);
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar valuation.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof inputs, value: number) => {
    setInputs((prev) => ({ ...prev, [field]: value }));
  };

  const applyScenario = (scenario: 'efficiency' | 'decentralization') => {
    if (scenario === 'efficiency') {
      // Scenario: Increase EBITDA by reducing costs (e.g., +5k/month)
      // Showing the multiplier effect
      setInputs(prev => ({ ...prev, monthlyEbitda: prev.monthlyEbitda + 5000 }));
    } else if (scenario === 'decentralization') {
      // Scenario: Reduce Dependency significantly
      setInputs(prev => ({ ...prev, ownerDependency: 40 }));
    }
  };

  const valuationMultiplier = inputs.sectorMultiple * 12;

  const handleExportPDF = () => {
    generatePDF('valuation-content', `Valuation_${newCompanyName || 'Empresa'}`);
  };

  const handleFileSelect = async (file: File, useAI: boolean = false) => {
    setParsing(true);
    try {
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {

        if (useAI) {
          // AI-powered parsing
          const { parseWithAI } = await import('./utils/aiExcelParser');
          const result = await parseWithAI(file);

          // Apply extracted data
          const updates: any = {};
          if (result.ebitda) {
            updates.monthlyEbitda = result.ebitda / 12; // Convert annual to monthly
          }
          if (result.netDebt) {
            updates.netDebt = result.netDebt;
          }
          if (result.growthRate) {
            updates.annualGrowth = result.growthRate;
          }

          setInputs(prev => ({ ...prev, ...updates }));

          // Show detailed feedback
          const fieldsFoundText = result.fieldsFound.length > 0
            ? `\n\nCampos identificados: ${result.fieldsFound.join(', ')}`
            : '';

          const confidenceText = result.confidence === 'high'
            ? '✅ Alta confiança'
            : result.confidence === 'medium'
              ? '⚠️ Confiança média'
              : '❓ Baixa confiança';

          alert(`🤖 Análise com IA concluída!\n\n${confidenceText}${fieldsFoundText}\n\n${result.rawResponse || 'Dados extraídos com sucesso.'}`);

        } else {
          // Traditional parsing (fallback)
          const { parseFinancialStatement } = await import('./utils/excelParser');
          const foundValue = await parseFinancialStatement(file);

          if (foundValue) {
            setInputs(prev => ({ ...prev, monthlyEbitda: foundValue / 12 }));
            alert(`✅ Sucesso! Encontramos EBITDA de ${formatCurrency(foundValue)} (Anual).\n\nEBITDA mensal ajustado para ${formatCurrency(foundValue / 12)}.\n\n💡 Dica: Use "Analisar com IA" para extrair mais dados automaticamente.`);
          } else {
            // Offer AI parsing as alternative
            const tryAI = confirm('❌ Não encontramos EBITDA com o método tradicional.\n\n🤖 Deseja tentar com Inteligência Artificial? (Mais lento, mas muito mais preciso)');
            if (tryAI) {
              handleFileSelect(file, true);
              return;
            }
            alert('Por favor, insira os dados manualmente.');
          }
        }
      } else {
        // PDF parser mock fallback for now
        setTimeout(() => {
          alert('Leitura de PDF ainda em desenvolvimento. Por favor, tente um arquivo Excel (.xlsx) ou insira manualmente.');
        }, 1000);
      }
    } catch (error) {
      console.error(error);
      alert(`❌ Erro ao processar arquivo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setParsing(false);
    }
  };

  const handleLoadValuation = (loadedInputs: any) => {
    setInputs(loadedInputs);
    alert('Valuation carregado com sucesso!');
    setShowHistoryModal(false);
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    // useEffect above will handle applying the class to HTML
  };

  if (!user) {
    return <AuthForm />;
  }

  return (
    <div className="min-h-screen font-sans relative transition-colors duration-300 bg-gray-50 dark:bg-gradient-to-br dark:from-chumbo-950 dark:via-chumbo-900 dark:to-chumbo-950 text-gray-900 dark:text-chumbo-50">

      {/* History Sidebar */}
      {showHistoryModal && (
        <ValuationHistory
          onLoadValuation={handleLoadValuation}
          onClose={() => setShowHistoryModal(false)}
        />
      )}

      {/* Presentation Mode */}
      {presentationMode && (
        <PresentationMode
          inputs={inputs}
          results={results}
          companyName={newCompanyName || 'Empresa'}
          onClose={() => setPresentationMode(false)}
        />
      )}

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md shadow-2xl">
            <CardHeader>
              <CardTitle className="text-white">Salvar Valuation</CardTitle>
              <CardDescription className="text-chumbo-400">Vincule este cálculo a uma empresa.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isCreatingCompany ? (
                <div className="space-y-2">
                  <Label>Selecione a Empresa</Label>
                  <select
                    className="w-full bg-white dark:bg-chumbo-950 border border-gray-300 dark:border-chumbo-800 rounded-lg p-3 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-gold-500 outline-none"
                    value={selectedCompanyId}
                    onChange={(e) => setSelectedCompanyId(e.target.value)}
                  >
                    <option value="">Selecione...</option>
                    {companies.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    className="w-full mt-2 border border-gray-300 dark:border-chumbo-700 bg-gray-100 dark:bg-chumbo-800 hover:bg-gray-200 dark:hover:bg-chumbo-700 text-gray-700 dark:text-chumbo-200"
                    onClick={() => setIsCreatingCompany(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" /> Nova Empresa
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Nome da Nova Empresa</Label>
                  <Input
                    value={newCompanyName}
                    onChange={(e) => setNewCompanyName(e.target.value)}
                    placeholder="Ex: Padaria do João"
                    className="bg-white dark:bg-chumbo-950 border-gray-300 dark:border-chumbo-800 text-gray-900 dark:text-white"
                  />
                  <Button
                    type="button"
                    className="w-full mt-2 text-sm text-chumbo-400 hover:text-white"
                    onClick={() => setIsCreatingCompany(false)}
                  >
                    Voltar para seleção
                  </Button>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  className="flex-1 bg-gray-200 dark:bg-chumbo-800 hover:bg-gray-300 dark:hover:bg-chumbo-700 text-gray-900 dark:text-white"
                  onClick={() => setShowSaveModal(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  className="flex-1 bg-gold-500 hover:bg-gold-600 text-chumbo-950 font-bold"
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="w-full max-w-[1600px] mx-auto p-4 lg:p-8 space-y-8" id="valuation-content">

        {/* Header - Optimized for Mobile */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative">

          <div className="flex items-center gap-4">
            <div className={`p-3 bg-gradient-to-br from-gold-500/20 to-gold-500/5 rounded-2xl border border-gold-500/20 shadow-lg ${theme === 'dark' ? 'shadow-gold-500/5' : 'shadow-gold-500/10'}`}>
              <Calculator className="w-8 h-8 text-gold-600" />
            </div>
            <div>
              <h1 className={`text-3xl font-bold bg-gradient-to-r ${theme === 'dark' ? 'from-white to-chumbo-400' : 'from-gray-900 to-gray-600'} bg-clip-text text-transparent`}>
                Axioma
              </h1>
              <p className="text-xs text-gold-600 tracking-wider font-semibold uppercase">Valuation Premium</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white/80 dark:bg-chumbo-900/50 border-gray-200 dark:border-chumbo-800/50 p-1.5 rounded-xl border backdrop-blur-sm shadow-lg">
            <button
              onClick={() => setShowHistoryModal(true)}
              className="p-2 text-gray-600 dark:text-chumbo-400 hover:text-gold-600 dark:hover:text-gold-400 hover:bg-gray-100 dark:hover:bg-chumbo-800 rounded-lg transition-all flex items-center gap-2 group"
              title="Histórico"
            >
              <Folder className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium hidden sm:inline">Histórico</span>
            </button>
            <button
              onClick={handleExportPDF}
              className="p-2 text-gray-600 dark:text-chumbo-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-chumbo-800 rounded-lg transition-all flex items-center gap-2 group"
              title="Exportar PDF"
            >
              <Download className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium hidden sm:inline">PDF</span>
            </button>
            <button
              onClick={() => setShowSaveModal(true)}
              className={`p-2 ${theme === 'dark' ? 'text-gold-500 hover:bg-gold-500/10' : 'text-gold-600 hover:bg-gold-50'} rounded-lg transition-all flex items-center gap-2 group`}
              title="Salvar"
            >
              <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium hidden sm:inline">Salvar</span>
            </button>
            <button
              onClick={() => setPresentationMode(true)}
              className={`p-2 ${theme === 'dark' ? 'text-purple-500 hover:bg-purple-500/10' : 'text-purple-600 hover:bg-purple-50'} rounded-lg transition-all flex items-center gap-2 group`}
              title="Modo Apresentação"
            >
              <Presentation className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium hidden sm:inline">Apresentar</span>
            </button>
            <div className="w-px h-6 bg-gray-300 dark:bg-chumbo-800 mx-1"></div>
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-600 dark:text-chumbo-400 hover:text-blue-600 dark:hover:text-yellow-400 hover:bg-gray-100 dark:hover:bg-chumbo-800 rounded-lg transition-all group"
              title={theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 group-hover:scale-110 transition-transform" /> : <Moon className="w-5 h-5 group-hover:scale-110 transition-transform" />}
            </button>
            <div className="w-px h-6 bg-gray-300 dark:bg-chumbo-800 mx-1"></div>
            <button
              onClick={signOut}
              className={`p-2 ${theme === 'dark' ? 'text-red-400 hover:bg-red-500/10' : 'text-red-600 hover:bg-red-50'} rounded-lg transition-all group`}
              title="Sair"
            >
              <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Inputs Column */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="backdrop-blur-md shadow-xl sticky top-8">
              <CardHeader className="border-b pb-4">
                <CardTitle className="text-lg">Parâmetros</CardTitle>
                <CardDescription>Dados fundamentais do negócio</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">

                {/* File Upload / Automation */}
                <div className="space-y-2">
                  <Label>Automação (Balancete)</Label>
                  <FileUpload onFileSelect={(file) => handleFileSelect(file, false)} />
                  {parsing && <p className="text-xs text-gold-400 animate-pulse flex items-center gap-1"><Clock className="w-3 h-3" /> Processando arquivo...</p>}
                  <button
                    onClick={() => {
                      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
                      if (input?.files?.[0]) {
                        handleFileSelect(input.files[0], true);
                      } else {
                        alert('Por favor, selecione um arquivo primeiro.');
                      }
                    }}
                    disabled={parsing}
                    className="w-full text-xs bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-2 px-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <span>🤖</span> Analisar com IA (Extração Inteligente)
                  </button>
                </div>

                {/* EBITDA */}
                <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-chumbo-800/50">
                  <Label htmlFor="ebitda">EBITDA Mensal Médio</Label>
                  <div className="relative group">
                    <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 dark:text-chumbo-500 group-focus-within:text-gold-600 transition-colors" />
                    <Input
                      id="ebitda"
                      type="number"
                      placeholder="0.00"
                      className="pl-9 h-11"
                      value={inputs.monthlyEbitda || ''}
                      onChange={(e) => handleInputChange('monthlyEbitda', Number(e.target.value))}
                    />
                  </div>
                </div>

                {/* Multiple */}
                <div className="space-y-4">
                  <div className="flex justify-between items-baseline">
                    <Label htmlFor="multiple" className={theme === 'dark' ? 'text-chumbo-300' : 'text-gray-700'}>Múltiplo de Setor</Label>
                    <span className="text-lg font-bold text-gold-500 font-mono">{inputs.sectorMultiple}x</span>
                  </div>
                  <Slider
                    id="multiple"
                    min={1}
                    max={15}
                    step={0.5}
                    value={inputs.sectorMultiple}
                    onChange={(e) => handleInputChange('sectorMultiple', Number(e.target.value))}
                    className="accent-gold-500"
                  />
                  <p className={`text-xs ${theme === 'dark' ? 'text-chumbo-500' : 'text-gray-500'}`}>
                    Média de mercado para empresas similares.
                  </p>
                </div>

                {/* Growth */}
                <div className="space-y-3">
                  <Label htmlFor="growth" className={theme === 'dark' ? 'text-chumbo-300' : 'text-gray-700'}>Crescimento Anual (g)</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      id="growth"
                      type="number"
                      className="w-24 text-center"
                      value={inputs.annualGrowth}
                      onChange={(e) => handleInputChange('annualGrowth', Number(e.target.value))}
                    />
                    <span className={theme === 'dark' ? 'text-chumbo-400' : 'text-gray-600'}>% a.a.</span>
                  </div>
                </div>

                {/* Dependency */}
                <div className={`space-y-4 pt-4 border-t ${theme === 'dark' ? 'border-chumbo-800/50' : 'border-gray-200'}`}>
                  <div className="flex justify-between items-center">
                    <Label htmlFor="dependency" className={`flex items-center gap-2 ${theme === 'dark' ? 'text-chumbo-300' : 'text-gray-700'}`}>
                      <AlertTriangle className="w-4 h-4 text-orange-500" />
                      Dependência do Dono
                    </Label>
                    <span className={`text-sm font-bold ${theme === 'dark' ? 'text-orange-400 bg-orange-950/30' : 'text-orange-600 bg-orange-100'} px-2 py-1 rounded`}>{inputs.ownerDependency}%</span>
                  </div>
                  <Slider
                    id="dependency"
                    min={0}
                    max={100}
                    className="accent-orange-500"
                    value={inputs.ownerDependency}
                    onChange={(e) => handleInputChange('ownerDependency', Number(e.target.value))}
                  />
                </div>

                {/* Governance */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="governance" className={`flex items-center gap-2 ${theme === 'dark' ? 'text-chumbo-300' : 'text-gray-700'}`}>
                      <ShieldCheck className="w-4 h-4 text-green-500" />
                      Score de Governança
                    </Label>
                    <span className={`text-sm font-bold ${theme === 'dark' ? 'text-green-400 bg-green-950/30' : 'text-green-600 bg-green-100'} px-2 py-1 rounded`}>{inputs.governanceScore}/10</span>
                  </div>
                  <Slider
                    id="governance"
                    min={0}
                    max={10}
                    step={0.5}
                    className="accent-green-500"
                    value={inputs.governanceScore}
                    onChange={(e) => handleInputChange('governanceScore', Number(e.target.value))}
                  />
                </div>

                {/* Net Debt */}
                <div className={`space-y-3 pt-4 border-t ${theme === 'dark' ? 'border-chumbo-800/50' : 'border-gray-200'}`}>
                  <Label htmlFor="debt" className={theme === 'dark' ? 'text-chumbo-300' : 'text-gray-700'}>Dívida Líquida</Label>
                  <div className="relative group">
                    <DollarSign className={`absolute left-3 top-2.5 h-4 w-4 ${theme === 'dark' ? 'text-red-400/50' : 'text-red-500/50'} group-focus-within:text-red-500 transition-colors`} />
                    <Input
                      id="debt"
                      type="number"
                      placeholder="0.00"
                      className="pl-9 h-11"
                      value={inputs.netDebt || ''}
                      onChange={(e) => handleInputChange('netDebt', Number(e.target.value))}
                    />
                  </div>
                </div>

              </CardContent>
            </Card>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-8 space-y-6">

            {/* Insight Banner */}
            <Card className="border-l-4 border-l-gold-500 border-y-0 border-r-0 bg-gradient-to-r from-gold-500/10 to-transparent">
              <CardContent className="py-6 flex items-start sm:items-center gap-4">
                <div className="p-3 bg-gold-500/20 rounded-full shrink-0">
                  <TrendingUp className="w-6 h-6 text-gold-500" />
                </div>
                <div>
                  <p className="text-sm text-gold-200/80 font-medium uppercase tracking-wider mb-1">O Poder do Múltiplo</p>
                  <p className="text-lg text-chumbo-100 leading-snug">
                    Cada <span className="font-bold text-white">R$ 1,00</span> economizado no custo fixo, aumenta em <span className="font-bold text-gold-400 text-xl">{formatCurrency(valuationMultiplier)}</span> o valor da sua empresa.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Inconsistency Alert */}
            {(inputs.annualGrowth > 15 && (inputs.ownerDependency > 60 || inputs.governanceScore < 4)) && (
              <div className="bg-orange-950/40 border border-orange-500/30 rounded-xl p-4 flex items-start gap-4 animate-in fade-in slide-in-from-top-2">
                <AlertTriangle className="w-6 h-6 text-orange-500 shrink-0 mt-1" />
                <div>
                  <h4 className="font-bold text-orange-200 text-lg">Risco Operacional Crítico</h4>
                  <p className="text-chumbo-300 mt-1">
                    O crescimento acelerado ({inputs.annualGrowth}%) com
                    {inputs.ownerDependency > 60 ? " alta dependência do dono" : " baixa governança"} está destruindo valor ao invés de criar.
                    <span className="block mt-2 font-medium text-orange-300">Sugestão: Foque em processos antes de vender mais.</span>
                  </p>
                </div>
              </div>
            )}

            {/* Main Valuation Display */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="col-span-1 md:col-span-2 border-0 bg-gradient-to-br from-chumbo-900 to-chumbo-950 shadow-2xl relative overflow-hidden ring-1 ring-white/10">
                {/* Background Glows */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500/10 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none translate-y-1/2 -translate-x-1/3" />

                <CardHeader>
                  <CardTitle className="text-chumbo-400 text-sm uppercase tracking-widest font-semibold flex items-center justify-between">
                    Valuation (Enterprise Value)
                    <span className="bg-gray-200 dark:bg-chumbo-800/50 text-gray-700 dark:text-chumbo-300 px-2 py-1 rounded text-xs normal-case tracking-normal border border-gray-300 dark:border-white/5">
                      Múltiplo Efetivo: {results.finalMultiple.toFixed(2)}x
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row items-baseline gap-2 mb-8">
                    <span className="text-5xl md:text-7xl font-bold text-white tracking-tighter">
                      {formatCurrency(results.enterpriseValue).split(',')[0]}
                    </span>
                    <span className="text-2xl md:text-3xl font-medium text-chumbo-400">
                      ,{formatCurrency(results.enterpriseValue).split(',')[1]}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-6">
                    <div>
                      <p className="text-xs text-chumbo-500 uppercase tracking-wider mb-1">EBITDA Anual</p>
                      <p className="text-xl font-medium text-chumbo-200">{formatCurrency(results.annualEbitda)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-chumbo-500 uppercase tracking-wider mb-1">Valor Base (Múltiplo de Setor)</p>
                      <p className="text-xl font-medium text-blue-300">{formatCurrency(results.baseValue)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Value Gap Widget */}
              <Card className="border border-purple-500/20 bg-purple-950/10 shadow-lg relative overflow-hidden group hover:border-purple-500/40 transition-colors">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs text-purple-300 uppercase tracking-widest font-bold flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    Potencial Oculto
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <p className="text-2xl font-bold text-white">{results.potentialMultiple.toFixed(2)}x</p>
                      <p className="text-xs text-purple-400/60">Múltiplo Potencial</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-red-400">-{formatCurrency(results.valueGap)}</p>
                      <p className="text-xs text-red-400/60">Dinheiro na Mesa</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-chumbo-900 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-purple-500 h-full rounded-full"
                      style={{ width: `${(results.finalMultiple / results.potentialMultiple) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-chumbo-400 mt-3">
                    Você está capturando {Math.round((results.finalMultiple / results.potentialMultiple) * 100)}% do valor potencial do seu EBITDA.
                  </p>
                </CardContent>
              </Card>

              {/* Equity Value */}
              <Card className="border-gray-200 dark:border-chumbo-800 bg-white dark:bg-chumbo-900/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs text-chumbo-400 uppercase tracking-widest">Equity Value (Bolso do Dono)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gold-400 mb-1">
                    {formatCurrency(results.equityValue)}
                  </div>
                  <p className="text-xs text-chumbo-500">
                    Após dedução da dívida líquida de {formatCurrency(inputs.netDebt)}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Adjustments Breakdown - Mini Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-red-950/20 border border-red-900/30 rounded-xl p-4 flex flex-col justify-between hover:bg-red-950/30 transition-colors">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-red-500/10 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  </div>
                  <span className="text-xs font-bold text-red-300 uppercase">Pênalti Risco</span>
                </div>
                <p className="text-lg font-bold text-red-400">
                  - {formatCurrency(results.dependencyPenalty)}
                </p>
              </div>

              <div className="bg-blue-950/20 border border-blue-900/30 rounded-xl p-4 flex flex-col justify-between hover:bg-blue-950/30 transition-colors">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-blue-500/10 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-blue-500" />
                  </div>
                  <span className="text-xs font-bold text-blue-300 uppercase">Crescimento</span>
                </div>
                <p className="text-lg font-bold text-blue-400">
                  + {formatCurrency(results.growthPremium)}
                </p>
              </div>

              <div className="bg-green-950/20 border border-green-900/30 rounded-xl p-4 flex flex-col justify-between hover:bg-green-950/30 transition-colors">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 bg-green-500/10 rounded-lg">
                    <ShieldCheck className="w-4 h-4 text-green-500" />
                  </div>
                  <span className="text-xs font-bold text-green-300 uppercase">Governança</span>
                </div>
                <p className="text-lg font-bold text-green-400">
                  + {formatCurrency(results.governancePremium)}
                </p>
              </div>

              {/* AI Insights */}
              <AxiomaInsights inputs={inputs} results={results} />
            </div>

            {/* Simulators */}
            <Card className="border border-gray-200 dark:border-chumbo-800 bg-white dark:bg-chumbo-900/30">
              <CardHeader className="pb-3 md:pb-0">
                <CardTitle className="text-sm text-chumbo-300 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-gold-500" />
                  Simular Cenários Rápidos
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => applyScenario('efficiency')}
                  className="bg-white dark:bg-chumbo-950 hover:bg-gray-50 dark:hover:bg-chumbo-800 border border-gray-300 dark:border-chumbo-800 p-4 rounded-xl text-left transition-all hover:scale-[1.02] group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-blue-200">Ganho de Eficiência</span>
                    <ArrowRight className="w-4 h-4 text-chumbo-500 group-hover:text-blue-400 transition-colors" />
                  </div>
                  <p className="text-xs text-chumbo-400 group-hover:text-chumbo-300">
                    O que acontece se aumentarmos o EBITDA em R$ 5k?
                  </p>
                </button>

                <button
                  onClick={() => applyScenario('decentralization')}
                  className="bg-white dark:bg-chumbo-950 hover:bg-gray-50 dark:hover:bg-chumbo-800 border border-gray-300 dark:border-chumbo-800 p-4 rounded-xl text-left transition-all hover:scale-[1.02] group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-purple-200">Reduzir Dependência</span>
                    <ArrowRight className="w-4 h-4 text-chumbo-500 group-hover:text-purple-400 transition-colors" />
                  </div>
                  <p className="text-xs text-chumbo-400 group-hover:text-chumbo-300">
                    Simular redução da dependência do dono para 40%.
                  </p>
                </button>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
