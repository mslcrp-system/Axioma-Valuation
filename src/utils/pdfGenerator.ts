import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

export const generatePDF = async (elementId: string, title: string) => {
    const element = document.getElementById(elementId);
    if (!element) return;

    try {
        // Wait for fonts and images to load properly
        const dataUrl = await toPng(element, {
            quality: 0.95,
            backgroundColor: '#030712', // Ensure dark theme bg
            canvasWidth: element.offsetWidth * 2,
            canvasHeight: element.offsetHeight * 2,
            pixelRatio: 2, // Retire resolution
        });

        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const imgWidth = 210; // A4 width in mm
        const pageHeight = 297; // A4 height in mm

        // Calculate image dimensions based on aspect ratio
        const imgProps = pdf.getImageProperties(dataUrl);
        const pdfHeight = (imgProps.height * imgWidth) / imgProps.width;

        let heightLeft = pdfHeight;
        let position = 0;

        // First page
        pdf.addImage(dataUrl, 'PNG', 0, position, imgWidth, pdfHeight);
        heightLeft -= pageHeight;

        // Other pages
        while (heightLeft >= 0) {
            position = heightLeft - pdfHeight;
            pdf.addPage();
            pdf.addImage(dataUrl, 'PNG', 0, position, imgWidth, pdfHeight);
            heightLeft -= pageHeight;
        }

        pdf.save(`${title}_Axioma_Valuation.pdf`);
    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Erro ao gerar PDF. Tente novamente.');
    }
};
