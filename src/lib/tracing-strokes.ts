/**
 * Single-stroke tracing alphabet. Paths describe the CENTER of each pen stroke,
 * not the outlines of a filled font. Dotted strokes therefore have one line
 * rather than two parallel dashed contours produced by canvas.strokeText().
 * Coordinates: cap line y=0, x-height=24, baseline=56, descender=78.
 */
const glyph:Record<string,string>={
 A:'M4 56 L24 0 L44 56 M10 39 L38 39',
 B:'M7 56 L7 0 L27 0 Q45 0 42 15 Q40 27 27 28 L7 28 M27 28 Q46 29 44 43 Q43 56 27 56 L7 56',
 C:'M43 10 Q32 -1 19 2 Q2 7 3 27 Q2 48 19 55 Q32 60 43 46',
 D:'M7 56 L7 0 L23 0 Q45 0 45 28 Q45 56 23 56 Z',
 E:'M42 0 L8 0 L8 56 L42 56 M8 28 L36 28',
 F:'M8 56 L8 0 L43 0 M8 27 L35 27',
 G:'M44 11 Q33 -2 20 3 Q3 8 3 29 Q3 49 20 55 Q36 61 45 44 L45 32 L25 32',
 H:'M7 0 L7 56 M44 0 L44 56 M7 28 L44 28',
 I:'M10 0 L41 0 M25 0 L25 56 M10 56 L41 56',
 J:'M8 43 Q8 58 22 57 Q37 57 37 42 L37 0',
 K:'M7 0 L7 56 M44 0 L8 32 M24 20 L46 56',
 L:'M8 0 L8 56 L44 56',
 M:'M4 56 L4 0 L25 30 L46 0 L46 56',
 N:'M5 56 L5 0 L44 56 L44 0',
 O:'M25 0 C9 0 3 12 3 28 C3 44 9 56 25 56 C41 56 47 44 47 28 C47 12 41 0 25 0 Z',
 P:'M7 56 L7 0 L28 0 Q47 0 45 15 Q43 31 26 31 L7 31',
 Q:'M25 0 C9 0 3 12 3 28 C3 44 9 56 25 56 C41 56 47 44 47 28 C47 12 41 0 25 0 Z M32 44 L48 62',
 R:'M7 56 L7 0 L28 0 Q45 0 44 15 Q43 30 26 30 L7 30 M24 30 L46 56',
 S:'M42 9 Q31 -2 16 3 Q4 7 6 19 Q9 27 24 29 Q46 32 44 43 Q43 58 25 57 Q10 57 5 46',
 T:'M3 0 L47 0 M25 0 L25 56',
 U:'M6 0 L6 37 Q6 56 25 56 Q44 56 44 37 L44 0',
 V:'M4 0 L24 56 L46 0',
 W:'M3 0 L13 56 L25 23 L37 56 L47 0',
 X:'M5 0 L44 56 M44 0 L5 56',
 Y:'M4 0 L25 28 L46 0 M25 28 L25 56',
 Z:'M5 0 L45 0 L5 56 L45 56',
 a:'M39 23 L39 56 M39 34 Q34 22 22 23 C9 23 6 31 6 40 C6 51 12 57 22 57 Q34 57 39 43',
 b:'M8 0 L8 56 M8 37 Q14 23 26 23 C39 23 45 32 45 41 C45 52 38 57 26 57 Q14 57 8 43',
 c:'M41 30 Q34 23 23 23 C11 23 5 32 5 41 C5 51 12 57 24 57 Q34 57 41 50',
 d:'M41 0 L41 56 M41 36 Q35 23 23 23 C11 23 5 32 5 41 C5 52 13 57 23 57 Q35 57 41 43',
 e:'M6 41 L43 41 Q44 23 25 23 C12 23 5 32 5 41 C5 54 13 57 26 57 Q35 57 42 50',
 f:'M37 5 Q18 -2 18 16 L18 56 M7 24 L36 24',
 g:'M41 23 L41 59 Q41 77 23 77 Q12 77 8 69 M41 36 Q35 23 23 23 C11 23 5 32 5 41 C5 52 13 57 23 57 Q35 57 41 43',
 h:'M9 0 L9 56 M9 35 Q16 23 28 23 Q42 23 42 36 L42 56',
 i:'M24 24 L24 56 M24 9 L24 10',
 j:'M35 24 L35 60 Q35 78 18 77 M35 9 L35 10',
 k:'M9 0 L9 56 M42 23 L10 43 M25 33 L44 56',
 l:'M23 0 L23 56',
 m:'M3 56 L3 24 M3 35 Q8 23 16 23 Q25 23 25 35 L25 56 M25 35 Q30 23 39 23 Q47 23 47 36 L47 56',
 n:'M9 56 L9 24 M9 35 Q17 23 29 23 Q42 23 42 36 L42 56',
 o:'M25 23 C12 23 5 31 5 41 C5 52 12 57 25 57 C38 57 45 52 45 41 C45 31 38 23 25 23 Z',
 p:'M8 24 L8 77 M8 35 Q14 23 26 23 C39 23 45 32 45 41 C45 52 38 57 26 57 Q14 57 8 44',
 q:'M41 24 L41 77 M41 35 Q35 23 23 23 C10 23 5 32 5 41 C5 52 12 57 23 57 Q35 57 41 44',
 r:'M10 56 L10 24 M10 36 Q18 22 39 24',
 s:'M41 29 Q31 21 18 24 Q6 27 8 35 Q10 40 25 41 Q45 43 42 50 Q37 61 8 52',
 t:'M21 6 L21 45 Q21 57 36 56 M8 24 L38 24',
 u:'M8 24 L8 44 Q8 57 22 57 Q35 57 41 44 M41 24 L41 56',
 v:'M5 24 L24 56 L45 24',
 w:'M3 24 L13 56 L25 35 L37 56 L47 24',
 x:'M7 24 L42 56 M42 24 L7 56',
 y:'M5 24 L25 56 M45 24 L22 68 Q18 77 8 77',
 z:'M6 24 L44 24 L6 56 L44 56',
 '-':'M10 39 L38 39'
};
function pathStroke(ctx:CanvasRenderingContext2D,source:string){
 const parts=source.match(/[MLQCZ]|-?\d+(?:\.\d+)?/g)||[];
 let index=0;
 ctx.beginPath();
 while(index<parts.length){
  const op=parts[index++];
  const n=()=>Number(parts[index++]);
  if(op==='M')ctx.moveTo(n(),n());
  else if(op==='L')ctx.lineTo(n(),n());
  else if(op==='Q')ctx.quadraticCurveTo(n(),n(),n(),n());
  else if(op==='C')ctx.bezierCurveTo(n(),n(),n(),n(),n(),n());
  else if(op==='Z')ctx.closePath();
 }
 ctx.stroke();
}
export const handwritingGuidelines=[0,24,56,78] as const;
/** Four writing guidelines and exactly one centerline-dot tracing stroke per glyph. */
export function drawTracingRow(ctx:CanvasRenderingContext2D,value:string,x:number,y:number,right:number){
 const lines=handwritingGuidelines;
 ctx.save();
 ctx.lineWidth=1.8;
 lines.forEach((offset,i)=>{
  ctx.strokeStyle=i===2?'#92aaa0':'#c1d0c6';
  ctx.setLineDash(i===1||i===3?[7,7]:[]);
  ctx.beginPath();ctx.moveTo(x,y+offset);ctx.lineTo(right,y+offset);ctx.stroke();
 });
 ctx.restore();
 const clean=value.replace(/[^a-zA-Z -]/g,'').slice(0,22);
 const glyphWidth=50;
 const scale=Math.min(.90,(right-x-45)/Math.max(1,clean.length*glyphWidth));
 ctx.save();
 ctx.translate(x+26,y);
 ctx.scale(scale,1);
 ctx.strokeStyle='#547567';
 ctx.lineWidth=3.4;
 ctx.lineCap='round';ctx.lineJoin='round';
 // Round-cap dotted single strokes. strokeText was two contours per glyph.
 ctx.setLineDash([.15,8]);
 for(const ch of clean){
  if(glyph[ch])pathStroke(ctx,glyph[ch]);
  ctx.translate(glyphWidth,0);
 }
 ctx.restore();
}
