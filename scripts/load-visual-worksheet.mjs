/**
 * QA-only loader for the server-rendered TS PDF module.
 * It uses local build dependencies; never calls any AI provider or DB.
 */
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {transpileModule,ModuleKind,ScriptTarget} from 'typescript';
import {jsPDF} from 'jspdf';
export function loadVisualRenderer(){
 const filename=resolve(process.cwd(),'src/lib/visual-worksheet-design.ts');
 const source=readFileSync(filename,'utf8');
 const compiled=transpileModule(source,{compilerOptions:{module:ModuleKind.CommonJS,target:ScriptTarget.ES2020}}).outputText;
 const mod={exports:{}};
 const safeRequire=(name)=>{
  if(name==='server-only')return{};
  if(name==='jspdf')return{jsPDF};
  throw new Error('Unexpected import in isolated visual worksheet renderer: '+name);
 };
 new Function('require','module','exports','Buffer',compiled)(
  safeRequire,mod,mod.exports,Buffer);
 return mod.exports;
}
