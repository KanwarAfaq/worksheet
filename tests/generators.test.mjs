import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeWords,generate} from '../src/lib/generators.ts';
test('normalizes words and removes case-insensitive duplicates',()=>{
  assert.deepEqual(normalizeWords('Cat, dog\nCAT, lion'),['Cat','dog','lion']);
});
test('rejects too few words',()=>assert.throws(()=>normalizeWords('cat,dog'),/3 and 25/));
test('word searches are deterministic and include every word',()=>{
  const words=['cat','dog','lion','tiger'];
  const a=generate('word-search',words,42);
  const b=generate('word-search',words,42);
  assert.deepEqual(a,b);
  assert.equal(a.placements.length,words.length);
  for(const p of a.placements){
    const rendered=p.cells.map(([r,c])=>a.grid[r][c]).join('');
    assert.equal(rendered,p.word.toUpperCase());
  }
});
test('scramble solutions retain the input',()=>{
 const words=['banana','apple','orange'];
 const puzzle=generate('word-scramble',words,22);
 assert.deepEqual(puzzle.items.map(x=>x.answer),words);
});
test('missing letters have correct answers',()=>{
 const words=['rabbit','tiger','zebra'];
 const puzzle=generate('missing-letters',words,19);
 assert.equal(puzzle.items.length,3);
 puzzle.items.forEach(x=>{assert.ok(x.question.includes('_'));assert.ok(words.includes(x.answer));});
});
