import { GoogleGenAI } from "@google/genai";
import { formatCurrency } from "../utils/formatters";

// Initialize the Google GenAI client
// The user noted it picks up GEMINI_API_KEY from env, but we are in Vite client side, 
// so we might need to pass it explicitly if the SDK supports it, or ensure the env var is accessible.
// The user code: const ai = new GoogleGenAI({});
// But we have VITE_GOOGLE_API_KEY.
// Let's try passing it safely.

const ai = new GoogleGenAI({
    apiKey: import.meta.env.VITE_GOOGLE_API_KEY
});

export const generateValuationReport = async (inputs: any, results: any) => {
    try {
        const isLowGovernance = inputs.governanceScore < 5;
        const isHighDependency = inputs.ownerDependency > 50;

        const prompt = `
Você é um consultor sênior de M&A (Fusões e Aquisições) especializado em valuation de pequenas e médias empresas.
Seu objetivo é analisar os dados financeiros e qualitativos de uma empresa e fornecer um relatório estratégico, direto e persuasivo para o empresário.

DADOS DA EMPRESA:
- Setor: (Generico/Não informado)
- EBITDA Mensal Médio: ${formatCurrency(inputs.monthlyEbitda)}
- EBITDA Anual Projetado: ${formatCurrency(results.annualEbitda)}
- Múltiplo de Mercado (Setor): ${inputs.sectorMultiple}x
- Dívida Líquida: ${formatCurrency(inputs.netDebt)}

AVALIAÇÃO CALCULADA (AXIOMA VALUATION):
- Valuation Base (Sem ajustes): ${formatCurrency(results.baseValuation)}
- Pênalti de Dependência do Dono: -${formatCurrency(results.dependencyPenalty)} (Nível atual: ${inputs.ownerDependency}%)
- Prêmio de Governança: +${formatCurrency(results.governancePremium)} (Score atual: ${inputs.governanceScore}/10)
- VALUATION FINAL (Enterprise Value): ${formatCurrency(results.enterpriseValue)}
- EQUITY VALUE (Bolso do Dono): ${formatCurrency(results.equityValue)}
- MÚLTIPLO EFETIVO FINAL: ${results.finalMultiple.toFixed(2)}x

DIRETRIZES DO RELATÓRIO:
1. **Analise o Valor**: Explique por que a empresa vale R$ ${formatCurrency(results.enterpriseValue)}. Compare o múltiplo original (${inputs.sectorMultiple}x) com o final (${results.finalMultiple.toFixed(2)}x).
2. **Dependência do Dono**: ${isHighDependency ? 'CRÍTICO: A empresa depende muito do dono. Explique como isso destrói valor e o que fazer para sair da operação.' : 'Parabenize pela baixa dependência.'}
3. **Governança**: ${isLowGovernance ? 'ALERTA: A governança está baixa. Sugira 2 ações práticas (ex: conciliação bancária, auditoria).' : 'Bom nível de governança, isso gera prêmio de valor.'}
4. **Crescimento**: A empresa cresce ${inputs.annualGrowth}% ao ano. Comente se isso está sendo capturado pelo valuation.
5. **Conclusão (Call to Action)**: Termine com uma frase de impacto sobre o potencial de valorização se os ajustes forem feitos.

Formate a resposta em Markdown, use negrito para destacar números e insights. Seja profissional mas acessível. Não use introduções genéricas ("Aqui está seu relatório"), vá direto ao ponto.
`;

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview", // Using the user's explicit request.
            contents: prompt,
        });

        // The response structure might differ in the new SDK
        // User example: console.log(response.text);
        return response.text;
    } catch (error) {
        console.error("Erro ao gerar relatório com IA:", error);
        throw new Error("Não foi possível gerar o relatório no momento. Tente novamente.");
    }
};
