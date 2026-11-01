import type {Printable} from '@/lib/printables';
function Body({p,key_}:{p:Printable;key_:boolean}){
 const b=p.block;
 if(b.kind==='problems')return <ol className={'pw-problems pw-cols-'+b.cols}>{b.items.map((it,i)=><li key={i}>{key_?<span>{it.q.replace('____','')}<strong>{it.a}</strong></span>:<span>{it.q}</span>}</li>)}</ol>;
 if(b.kind==='fill')return <ol className="pw-fill">{b.items.map((it,i)=><li key={i}>{key_?<span>{it.q.replace(/_+/g,'…')} → <strong>{it.a}</strong></span>:<span>{it.q}</span>}</li>)}</ol>;
 if(b.kind==='count')return <div className="pw-count">{b.items.map((it,i)=><div key={i} className="pw-count-box"><div className="pw-emoji" aria-hidden>{Array.from({length:it.n}).map((_,k)=><span key={k}>{it.emoji}</span>)}</div><div className="pw-count-ans">{key_?<strong>{it.n}</strong>:'= ____'}</div></div>)}</div>;
 if(b.kind==='trace')return <div className="pw-trace">{b.items.map((t,i)=><div key={i} className="pw-trace-row">{key_?<strong>{t}</strong>:<>{Array.from({length:2}).map((_,k)=><span key={k} className="pw-ghost">{t}</span>)}<span className="pw-write"/></>}</div>)}</div>;
 if(b.kind==='words')return <div className="pw-words">{b.items.map((w,i)=><div key={i} className="pw-word-row"><strong className="pw-word">{w}</strong>{key_?null:<><span className="pw-ghost">{w}</span><span className="pw-write"/><span className="pw-write"/></>}</div>)}</div>;
 if(b.kind==='sentences')return <div className="pw-sentences">{b.items.map((s,i)=><div key={i} className="pw-sentence"><p>{s}</p><div className="pw-lines"><span/><span/></div></div>)}</div>;
 const sol=new Set(b.solution);
 return <div><div className="pw-grid" style={{gridTemplateColumns:`repeat(${b.grid.length},1fr)`}}>{b.grid.map((row,r)=>row.map((c,k)=><span key={r+'-'+k} className={key_&&sol.has(r+','+k)?'pw-hit':''}>{c}</span>))}</div>
  <p className="pw-bank"><strong>Find:</strong> {b.words.join(' · ')}</p></div>;
}
export default function PrintableSheet({p,answers=false}:{p:Printable;answers?:boolean}){
 return <section className={'pw-sheet'+(answers?' pw-key':'')} aria-label={p.title+(answers?' answer key':'')}>
  <header className="pw-head"><span>Name: ______________________</span><span>Date: ____________</span></header>
  <h2 className="pw-title">{p.title}{answers?' — Answer Key':''}</h2>
  {!answers&&<p className="pw-instr">{p.instructions}</p>}
  <Body p={p} key_={answers}/>
  <footer className="pw-foot"><span>{p.grade} · {p.category}</span><span>worksheet.live</span></footer>
 </section>;
}
