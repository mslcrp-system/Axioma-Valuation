import * as XLSX from 'xlsx';

export const parseFinancialStatement = async (file: File): Promise<number | null> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });

                // Scan all sheets
                for (const sheetName of workbook.SheetNames) {
                    const sheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

                    for (const row of jsonData) {
                        // Convert row to string for keyword search
                        const rowString = row.join(' ').toUpperCase();

                        // Keywords to look for EBITDA proxy
                        if (rowString.includes('EBITDA') ||
                            rowString.includes('LAJIDA') ||
                            rowString.includes('RESULTADO OPERACIONAL') ||
                            rowString.includes('LUCRO OPERACIONAL')) {

                            // Try to find the first number in the row
                            for (const cell of row) {
                                if (typeof cell === 'number') {
                                    return resolve(cell);
                                }
                            }
                        }
                    }
                }

                resolve(null); // Not found
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(file);
    });
};
