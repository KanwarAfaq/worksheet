/** Generate deterministic local mock previews of the real visual PDF engine.
 * No AI quota, storage credentials, authenticated session or site mutations needed.
 */
import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {loadVisualRenderer} from './load-visual-worksheet.mjs';
const {renderVisualWorksheet}=loadVisualRenderer();
const output=resolve(process.cwd(),'artifacts/visual-pdfs');
mkdirSync(output,{recursive:true});
const days=['2026-10-17'];
const specs=[
 {subject:'math',grade:1,slot:0,theme:'orchard'},
 {subject:'reading',grade:2,slot:1,theme:'animals'},
 {subject:'colors',grade:3,slot:2,theme:'robot'},
 {subject:'math',grade:4,slot:3,theme:'space'},
 {subject:'reading',grade:5,slot:4,theme:'spring'}
];
for(const day of days)for(const p of specs){
 const rendered=renderVisualWorksheet({...p,day});
 const prefix=String(p.slot+1).padStart(2,'0')+'-'+rendered.layout;
 writeFileSync(resolve(output,prefix+'.pdf'),rendered.student);
 writeFileSync(resolve(output,prefix+'-teacher-key.pdf'),rendered.teacher);
 process.stdout.write(prefix+': '+rendered.student.length+' bytes, '+rendered.exerciseCount+' exercises\n');
}
