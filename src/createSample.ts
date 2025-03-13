import { PDFDocument, StandardFonts } from 'pdf-lib';
import * as fs from 'fs';

async function createSamplePdf() {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    page.drawText('Hello World', {
        x: 50,
        y: 500,
        size: 50,
        font: font,
    });

    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync('sample.pdf', pdfBytes);
}

createSamplePdf();