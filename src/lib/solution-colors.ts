import type { Puzzle } from './generators';

// Golden-angle sequence produces up to 25 distinct pastel hues.
const maxWords = 25;
export function solutionHue(index: number): number {
  return (24 + ((index % maxWords) * 137.508)) % 360;
}
export function solutionCellRgb(index: number): [number,number,number] {
  const h=solutionHue(index), s=.66, l=.80;
  const a=s*Math.min(l,1-l);
  const channel=(n:number)=>{
    const k=(n+h/30)%12;
    return Math.round(255*(l-a*Math.max(-1,Math.min(k-3,9-k,1))));
  };
  return [channel(0),channel(8),channel(4)];
}
export function solutionCssColor(index:number):string {
  const [r,g,b]=solutionCellRgb(index);
  return 'rgb('+r+', '+g+', '+b+')';
}
// Overlapping letters take the color of the first word (the legend still lists
// every word so intersecting answers remain identifiable).
export function answerCellIndices(puzzle: Pick<Puzzle,'placements'|'words'>): Map<string,number> {
  const lookup=new Map<string,number>();
  for (const placement of puzzle.placements || []) {
    const index=puzzle.words.indexOf(placement.word);
    if(index<0)continue;
    for(const cell of placement.cells){
      const k=cell.join('-');
      if(!lookup.has(k))lookup.set(k,index);
    }
  }
  return lookup;
}
