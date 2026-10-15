export const coloringChoices=['cat','apple','flower','tree','fish','butterfly','star','house'] as const;
export type ColoringObject=typeof coloringChoices[number];
export const coloringNames:Record<ColoringObject,string>={
 cat:'Cat',apple:'Apple',flower:'Flower',tree:'Tree',fish:'Fish',
 butterfly:'Butterfly',star:'Star',house:'House'
};
export const suggestedColors:Record<ColoringObject,string>={
 cat:'orange',apple:'red',flower:'pink',tree:'green',fish:'blue',
 butterfly:'purple',star:'yellow',house:'brown'
};
export function isColoringObject(s:string):s is ColoringObject{
 return (coloringChoices as readonly string[]).includes(s);
}
export function suggestedColoringFromText(topic:string):[ColoringObject,ColoringObject]{
 const matched=coloringChoices.filter(name=>new RegExp('\\b'+name+'s?\\b','i').test(topic));
 return [matched[0]||'cat',matched.find(x=>x!==(matched[0]||'cat'))||'apple'];
}
/** Original scalable black-outline classroom drawings. The blank version is deliberately unfilled. */
export function drawColoringObject(ctx:CanvasRenderingContext2D,object:ColoringObject,
 x:number,y:number,width:number,height:number,teacher=false){
 ctx.save();ctx.translate(x,y);ctx.scale(width/400,height/400);
 ctx.lineWidth=5;ctx.lineJoin='round';ctx.lineCap='round';
 ctx.strokeStyle='#182f27';
 const color:Record<ColoringObject,string>={cat:'#efb26f',apple:'#f47878',flower:'#f4a0c9',
  tree:'#94cb81',fish:'#93c7ee',butterfly:'#bea1e8',star:'#ffe184',house:'#deb98c'};
 const fill=(other='#fff')=>{ctx.fillStyle=teacher?other:'#fff';ctx.fill();ctx.stroke();};
 const path=(fn:()=>void,shade=color[object])=>{ctx.beginPath();fn();fill(shade);};
 const ellipse=(cx:number,cy:number,rx:number,ry:number,shade?:string)=>{
   path(()=>ctx.ellipse(cx,cy,rx,ry,0,0,Math.PI*2),shade||color[object]);
 };
 const line=(...coords:number[])=>{ctx.beginPath();ctx.moveTo(coords[0],coords[1]);for(let i=2;i<coords.length;i+=2)ctx.lineTo(coords[i],coords[i+1]);ctx.stroke();};
 if(object==='cat'){
  path(()=>{ctx.moveTo(140,145);ctx.lineTo(110,60);ctx.lineTo(178,98);ctx.quadraticCurveTo(203,91,223,99);ctx.lineTo(289,59);ctx.lineTo(264,150);ctx.bezierCurveTo(315,230,255,275,204,275);ctx.bezierCurveTo(142,277,89,230,140,145);ctx.closePath();});
  ellipse(162,183,9,14,'#202f2b');ellipse(239,183,9,14,'#202f2b');
  path(()=>{ctx.moveTo(190,215);ctx.lineTo(210,215);ctx.lineTo(201,229);ctx.closePath();},'#e9a3a3');
  line(201,230,193,238,181,235);line(201,230,209,238,221,235);
  line(145,220,78,213);line(145,230,83,241);line(256,220,323,210);line(255,232,321,246);
  path(()=>{ctx.moveTo(145,280);ctx.bezierCurveTo(116,317,116,368,146,373);ctx.lineTo(264,373);ctx.bezierCurveTo(285,350,278,295,251,276);ctx.closePath();});
  path(()=>{ctx.moveTo(268,350);ctx.bezierCurveTo(330,352,344,291,304,282);ctx.bezierCurveTo(294,280,288,287,286,298);},'#fff');
  line(173,347,173,373);line(224,347,224,373);
 }else if(object==='apple'){
  path(()=>{ctx.moveTo(205,105);ctx.bezierCurveTo(145,44,69,107,74,195);ctx.bezierCurveTo(82,282,143,363,205,346);ctx.bezierCurveTo(266,363,331,281,326,192);ctx.bezierCurveTo(331,108,253,48,205,105);ctx.closePath();});
  line(205,107,206,56,218,36);
  path(()=>{ctx.moveTo(212,70);ctx.bezierCurveTo(241,22,284,20,301,51);ctx.bezierCurveTo(286,86,244,101,212,70);ctx.closePath();},'#9bcf8a');
  path(()=>{ctx.moveTo(110,161);ctx.quadraticCurveTo(124,140,138,141);},'#fff');
 }else if(object==='flower'){
  line(200,221,200,369);
  path(()=>{ctx.moveTo(199,293);ctx.bezierCurveTo(126,232,101,260,112,289);ctx.bezierCurveTo(141,325,174,318,199,293);ctx.closePath();},'#9ece91');
  path(()=>{ctx.moveTo(200,333);ctx.bezierCurveTo(260,280,301,292,283,321);ctx.bezierCurveTo(258,357,231,353,200,333);ctx.closePath();},'#9ece91');
  for(let i=0;i<8;i++){const a=Math.PI*2*i/8;ellipse(200+Math.cos(a)*65,158+Math.sin(a)*65,35,48);}
  ellipse(200,158,45,45,'#ffe189');
 }else if(object==='tree'){
  path(()=>{ctx.moveTo(171,204);ctx.lineTo(171,363);ctx.lineTo(226,363);ctx.lineTo(226,204);ctx.closePath();},'#cfa26e');
  path(()=>{ctx.moveTo(197,40);ctx.bezierCurveTo(118,23,99,97,112,118);ctx.bezierCurveTo(62,148,89,207,133,222);ctx.bezierCurveTo(128,280,263,273,279,220);ctx.bezierCurveTo(332,213,342,133,289,117);ctx.bezierCurveTo(291,67,242,35,197,40);ctx.closePath();});
 }else if(object==='fish'){
  path(()=>{ctx.moveTo(297,197);ctx.lineTo(350,137);ctx.lineTo(350,269);ctx.closePath();});
  path(()=>{ctx.moveTo(62,200);ctx.bezierCurveTo(126,83,250,96,303,202);ctx.bezierCurveTo(252,310,123,312,62,200);ctx.closePath();});
  ellipse(139,183,9,9,'#213a30');
  path(()=>{ctx.moveTo(185,147);ctx.lineTo(228,84);ctx.lineTo(245,155);ctx.closePath();});
  line(210,135,205,263);line(246,155,254,251);
 }else if(object==='butterfly'){
  path(()=>{ctx.moveTo(195,194);ctx.bezierCurveTo(115,20,34,72,69,167);ctx.bezierCurveTo(85,216,128,240,195,207);ctx.closePath();});
  path(()=>{ctx.moveTo(205,194);ctx.bezierCurveTo(285,20,366,72,331,167);ctx.bezierCurveTo(315,216,272,240,205,207);ctx.closePath();});
  path(()=>{ctx.moveTo(195,212);ctx.bezierCurveTo(73,191,75,331,143,349);ctx.bezierCurveTo(177,359,188,319,195,225);ctx.closePath();});
  path(()=>{ctx.moveTo(205,212);ctx.bezierCurveTo(327,191,325,331,257,349);ctx.bezierCurveTo(223,359,212,319,205,225);ctx.closePath();});
  ellipse(200,213,13,98,'#e2b68c');line(198,120,179,75);line(202,120,222,75);
 }else if(object==='star'){
  path(()=>{for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5;const r=i%2===0?156:68;const px=200+Math.cos(a)*r,py=200+Math.sin(a)*r;if(i===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);}ctx.closePath();});
 }else if(object==='house'){
  path(()=>{ctx.moveTo(102,182);ctx.lineTo(298,182);ctx.lineTo(298,348);ctx.lineTo(102,348);ctx.closePath();});
  path(()=>{ctx.moveTo(68,183);ctx.lineTo(200,60);ctx.lineTo(330,183);ctx.closePath();},'#d88b77');
  path(()=>{ctx.rect(178,245,52,103);},'#c79e77');
  path(()=>{ctx.rect(117,215,45,49);},'#b8e4f0');path(()=>{ctx.rect(254,215,33,49);},'#b8e4f0');
 }
 ctx.restore();
}
