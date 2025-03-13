import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

// Polyfill for Promise.withResolvers
if (!Promise.withResolvers) {
    Promise.withResolvers = function<T>() {
        let resolve: (value: T | PromiseLike<T>) => void;
        let reject: (reason?: any) => void;
        const promise = new Promise<T>((res, rej) => {
            resolve = res;
            reject = rej;
        });
        return { promise, resolve: resolve!, reject: reject! };
    };
}

interface TextItem {
    str: string;
}

async function pdfToText(pdfPath: string): Promise<string> {
    try {
        // Use the correct import path for Node.js
        const pdfjs = await import('pdfjs-dist');
        const data = new Uint8Array(fs.readFileSync(pdfPath));
        const pdf = await pdfjs.getDocument(data).promise;
        let textContent = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContentItems = await page.getTextContent();
            textContent += textContentItems.items
                .map(item => 'str' in item ? item.str : '')
                .join(' ') + '\n';
        }

        return textContent;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to convert PDF: ${error.message}`);
        }
        throw new Error('Failed to convert PDF: Unknown error');
    }
}

async function prompt(question: string): Promise<string> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise(resolve => {
        rl.question(question, answer => {
            rl.close();
            resolve(answer);
        });
    });
}

async function main() {
    let pdfPath: string;

    if (process.argv.length >= 2) {
        pdfPath = path.resolve(process.argv[2]);
    } else {
        const inputPath = await prompt('Enter the path to the PDF file: ');
        pdfPath = path.resolve(inputPath);
    }

    try {
        const text = await pdfToText(pdfPath);
        console.log(text);
    } catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
        } else {
            console.error('An unknown error occurred');
        }
        process.exit(1);
    }
}

main();
