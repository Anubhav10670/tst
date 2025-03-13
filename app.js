document.getElementById('convertButton').addEventListener('click', async () => {
    const fileInput = document.getElementById('pdfFile');
    const file = fileInput.files[0];
    if (!file) {
        alert('Please select a PDF file.');
        return;
    }

    const reader = new FileReader();
    reader.onload = async function(e) {
        const pdfData = new Uint8Array(e.target.result);
        const loadingTask = pdfjsLib.getDocument({ data: pdfData });
        const pdf = await loadingTask.promise;
        let textContent = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContentPage = await page.getTextContent();
            textContent += textContentPage.items.map(item => item.str).join(' ') + ' ';
        }

        const worker = Tesseract.createWorker();
        await worker.load();
        await worker.loadLanguage('eng');
        await worker.initialize('eng');
        const { data: { text } } = await worker.recognize(textContent);
        await worker.terminate();

        document.getElementById('outputText').value = text;
    };

    reader.readAsArrayBuffer(file);
});