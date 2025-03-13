"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const readline = __importStar(require("readline"));
// Polyfill for Promise.withResolvers
if (!Promise.withResolvers) {
    Promise.withResolvers = function () {
        let resolve;
        let reject;
        const promise = new Promise((res, rej) => {
            resolve = res;
            reject = rej;
        });
        return { promise, resolve: resolve, reject: reject };
    };
}
async function pdfToText(pdfPath) {
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
    }
    catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to convert PDF: ${error.message}`);
        }
        throw new Error('Failed to convert PDF: Unknown error');
    }
}
async function prompt(question) {
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
    let pdfPath;
    if (process.argv.length >= 2) {
        pdfPath = path.resolve(process.argv[2]);
    }
    else {
        const inputPath = await prompt('Enter the path to the PDF file: ');
        pdfPath = path.resolve(inputPath);
    }
    try {
        const text = await pdfToText(pdfPath);
        console.log(text);
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
        }
        else {
            console.error('An unknown error occurred');
        }
        process.exit(1);
    }
}
main();
