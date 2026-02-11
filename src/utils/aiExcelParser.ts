import { GoogleGenAI } from "@google/genai";
import * as XLSX from 'xlsx';

const ai = new GoogleGenAI({
    apiKey: import.meta.env.VITE_GOOGLE_API_KEY
});

export interface ParsedFinancialData {
    ebitda?: number;
    revenue?: number;
    operatingCosts?: number;
    netDebt?: number;
    growthRate?: number;
    confidence: 'high' | 'medium' | 'low';
    fieldsFound: string[];
    rawResponse?: string;
}

/**
 * Parse Excel file using Gemini AI for intelligent extraction
 */
export const parseWithAI = async (file: File): Promise<ParsedFinancialData> => {
    try {
        // Read Excel file
        const arrayBuffer = await file.arrayBuffer();
        const data = new Uint8Array(arrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        // Convert all sheets to text for AI analysis
        let fullText = '';
        for (const sheetName of workbook.SheetNames) {
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' }) as any[][];

            fullText += `\n\n=== PLANILHA: ${sheetName} ===\n`;
            jsonData.forEach((row, idx) => {
                if (row.some(cell => cell !== '')) {
                    fullText += `Linha ${idx + 1}: ${row.join(' | ')}\n`;
                }
            });
        }

        // Limit text size to avoid token limits (keep first 8000 chars)
        const textToAnalyze = fullText.substring(0, 8000);

        const prompt = `
Você é um especialista em contabilidade e análise financeira. Analise o seguinte balancete/demonstrativo financeiro e extraia os dados solicitados.

DADOS DO ARQUIVO:
${textToAnalyze}

TAREFA:
Identifique e extraia os seguintes valores (em números, sem formatação):

1. **EBITDA** ou equivalente (Resultado Operacional, LAJIDA, Lucro Operacional, Earnings Before Interest)
2. **Receita Bruta** ou Faturamento
3. **Custos Operacionais** (CMV, CPV, Custo das Vendas)
4. **Dívida Líquida** (se disponível)
5. **Taxa de Crescimento** anual (se houver dados históricos comparativos)

IMPORTANTE:
- Se um campo não for encontrado, retorne "null"
- Retorne APENAS números (sem R$, sem pontos, sem vírgulas)
- Se encontrar valores mensais e anuais, prefira o ANUAL
- Indique seu nível de confiança: HIGH (certeza), MEDIUM (provável), LOW (incerto)

FORMATO DE RESPOSTA (JSON):
{
  "ebitda": número ou null,
  "revenue": número ou null,
  "operatingCosts": número ou null,
  "netDebt": número ou null,
  "growthRate": número ou null,
  "confidence": "high" | "medium" | "low",
  "fieldsFound": ["lista", "de", "campos", "encontrados"],
  "explanation": "breve explicação do que foi encontrado e onde"
}
`;

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
        });

        const responseText = response.text;

        if (!responseText) {
            throw new Error('Empty response from Gemini API');
        }

        // Try to extract JSON from response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('AI não retornou JSON válido');
        }

        const parsed = JSON.parse(jsonMatch[0]);

        return {
            ebitda: parsed.ebitda,
            revenue: parsed.revenue,
            operatingCosts: parsed.operatingCosts,
            netDebt: parsed.netDebt,
            growthRate: parsed.growthRate,
            confidence: parsed.confidence || 'low',
            fieldsFound: parsed.fieldsFound || [],
            rawResponse: parsed.explanation
        };

    } catch (error) {
        console.error('Erro no parser com IA:', error);
        throw new Error('Não foi possível processar o arquivo com IA. Tente o modo tradicional.');
    }
};
