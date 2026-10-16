// Serve the PDF.js worker from our own domain, not a third-party CDN.
// All PDF contents continue to load via the site's authorized first-party route.
import {copyFileSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';

const root=process.cwd();
const source=resolve(root,'node_modules/pdfjs-dist/build/pdf.worker.min.mjs');
const destinationDir=resolve(root,'public');
mkdirSync(destinationDir,{recursive:true});
copyFileSync(source,resolve(destinationDir,'pdf.worker.min.mjs'));
console.log('Installed first-party PDF thumbnail worker');
