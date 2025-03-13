importScripts('https://cdn.jsdelivr.net/npm/tesseract.js@4.0.1/dist/tesseract.min.js');

self.onmessage = async function(e) {
    const { data } = e;
    const { text } = await Tesseract.recognize(data, 'eng');
    self.postMessage(text);
};