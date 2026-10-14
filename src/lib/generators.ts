
export type GeneratorType='word-search'|'word-scramble'|'missing-letters';
export type Difficulty='easy'|'medium'|'hard';
export type Entry={original:string;question:string;answer:string;missing?:number[]};
export type Puzzle={type:GeneratorType;seed:number;words:string[];grid?:string[][];placements?:{word:string;cells:[number,number][]}[];items?:Entry[]};
export const curated:Record<string,string[]> = {
  Animals:['cat','dog','lion','tiger','zebra','rabbit','panda','horse'],
  Nature:['tree','flower','river','mountain','rain','cloud','sun','leaf'],
  Classroom:['pencil','paper','book','desk','teacher','ruler','eraser'],
  Fruits:['apple','banana','mango','orange','grape','peach','kiwi']
};
export function normalizeWords(input:string):string[]{
  const words=input.split(/[\n,;]+/).map(w=>w.trim().normalize('NFC').replace(/\s+/g,' ')).filter(Boolean);
  if(words.length<3||words.length>25)throw new Error('Enter between 3 and 25 words.');
  if(words.some(w=>w.length>20||w.length<2||!/^\p{L}+(?:[ '-]\p{L}+)*$/u.test(w)))throw new Error('Use words with 2–20 letters; punctuation and numbers are not supported.');
  const seen=new Set<string>();
  const unique=words.filter(w=>{const key=w.toLocaleLowerCase();if(seen.has(key))return false;seen.add(key);return true;});
  if(unique.length<3)throw new Error('Enter at least 3 different words.');
  return unique;
}
function rng(seed:number){let value=seed>>>0;return()=>{value=(value*1664525+1013904223)>>>0;return value/4294967296;};}
function shuffle<T>(arr:T[],next:()=>number):T[]{const out=[...arr];for(let i=out.length-1;i>0;i--){const j=Math.floor(next()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;}
export function generate(type:GeneratorType,words:string[],seed:number,difficulty:Difficulty='easy'):Puzzle{
  const next=rng(seed);
  if(type==='word-scramble')return{type,words,seed,items:words.map(w=>{
    const chars=Array.from(w);let shuffled=[...chars];
    for(let i=0;i<15;i++){shuffled=shuffle(chars,next);if(shuffled.join('').toLowerCase()!==w.toLowerCase())break;}
    return{original:w,question:shuffled.join(''),answer:w};
  })};
  if(type==='missing-letters')return{type,words,seed,items:words.map(w=>{
    const chars=Array.from(w);const eligible=chars.map((c,i)=>i).filter(i=>/\p{L}/u.test(chars[i])&&(difficulty==='easy'?i!==0:true));
    const howMany=Math.max(1,Math.min(eligible.length,Math.round(chars.length*(difficulty==='easy'?.25:difficulty==='medium'?.4:.55))));
    const hidden=shuffle(eligible,next).slice(0,howMany);
    return{original:w,answer:w,question:chars.map((c,i)=>hidden.includes(i)?'_':c).join(' '),missing:hidden};
  })};
  const clean=words.map(w=>w.replace(/[^\p{L}]/gu,'').toUpperCase());
  let side=Math.max(difficulty==='easy'?10:12, ...clean.map(w=>w.length+2));
  side=Math.min(24,side);
  const dirs:[number,number][]=difficulty==='easy'?[[0,1],[1,0]]:difficulty==='medium'?[[0,1],[1,0],[1,1],[-1,1]]:[[0,1],[1,0],[1,1],[-1,1],[0,-1],[-1,0],[-1,-1],[1,-1]];
  const maxSide=24;
  for(;side<=maxSide;side++){
    const grid:(string|null)[][]=Array.from({length:side},()=>Array(side).fill(null));
    const placements:{word:string;cells:[number,number][]}[]=[];
    let failed=false;
    const byLength=clean.map((w,i)=>({w,original:words[i]})).sort((a,b)=>b.w.length-a.w.length);
    for(const entry of byLength){
      const candidates:{cells:[number,number][]}[]=[];
      for(const [dr,dc] of dirs)for(let r=0;r<side;r++)for(let c=0;c<side;c++){
        const cells:Array<[number,number]>=[];
        let valid=true;
        for(let k=0;k<entry.w.length;k++){const nr=r+k*dr,nc=c+k*dc;if(nr<0||nr>=side||nc<0||nc>=side||(grid[nr][nc]!==null&&grid[nr][nc]!==entry.w[k])){valid=false;break;}cells.push([nr,nc]);}
        if(valid)candidates.push({cells});
      }
      if(!candidates.length){failed=true;break;}
      const selected=candidates[Math.floor(next()*candidates.length)];
      selected.cells.forEach(([r,c],i)=>grid[r][c]=entry.w[i]);
      placements.push({word:entry.original,cells:selected.cells});
    }
    if(!failed){const letters='ABCDEFGHIJKLMNOPQRSTUVWXYZ';return{type,words,seed,grid:grid.map(row=>row.map(c=>c??letters[Math.floor(next()*letters.length)])),placements};}
  }
  throw new Error('These words could not fit. Try fewer or shorter words.');
}
