import test from 'node:test';
import assert from 'node:assert/strict';
import {loadVisualRenderer} from '../scripts/load-visual-worksheet.mjs';

const {renderVisualWorksheet}=loadVisualRenderer();
const cases=[
 {slot:0,subject:'math',grade:1,theme:'orchard',kind:'picture-counting'},
 {slot:1,subject:'reading',grade:2,theme:'animals',kind:'word-picture-matching'},
 {slot:2,subject:'colors',grade:3,theme:'robot',kind:'geometric-coloring'},
 {slot:3,subject:'math',grade:4,theme:'space',kind:'math-card-puzzles'},
 {slot:4,subject:'reading',grade:5,theme:'space',kind:'word-search'}
];
test('five original visual worksheets generate valid one-page PDFs and separate teacher keys',()=>{
 for(const params of cases){
  const out=renderVisualWorksheet({...params,day:'2026-10-17'});
  assert.equal(out.layout,params.kind);
  assert.ok(out.exerciseCount>=4);
  assert.ok(out.student.length>2500,'student file should include diagram objects');
  assert.ok(out.teacher.length>2000);
  assert.ok(out.student.subarray(0,5).equals(Buffer.from('%PDF-')));
  assert.ok(out.teacher.subarray(0,5).equals(Buffer.from('%PDF-')));
  assert.notDeepEqual(out.student,out.teacher,'the student page must not include teacher answers');
  assert.ok(!out.title.includes('2026'),'do not clutter worksheets with automatic timestamps');
 }
});
test('visual wordsearch places all words across varied days/themes',()=>{
 for(let day=1;day<=28;day++){
  for(const theme of ['spring','space','animals']){
   const out=renderVisualWorksheet({
    slot:4,subject:'reading',grade:5,theme,
    day:'2026-10-'+String(day).padStart(2,'0')
   });
   assert.equal(out.exerciseCount,8);
  }
 }
});
test('grade-dependent exercise layouts, including coloring rocket, remain printable',()=>{
 for(const p of [
  {slot:0,subject:'math',grade:2,theme:'garden'},
  {slot:2,subject:'colors',grade:1,theme:'rocket'},
  {slot:1,subject:'reading',grade:3,theme:'spring'},
  {slot:3,subject:'math',grade:6,theme:'ocean'}
 ]){
  const out=renderVisualWorksheet({...p,day:'2026-10-18'});
  assert.ok(out.student.length>2500);
 }
});
