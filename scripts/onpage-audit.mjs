// On-page SEO audit against a running server (`npm run build && ENABLE_SEARCH_INDEXING=true npm start`).
// Usage: node scripts/onpage-audit.mjs [baseUrl] [--strict] [--detail]
// Checks per page: keyword in <title>, first paragraph, an <h2>, image alt; internal + external links; JSON-LD validity.
const args=process.argv.slice(2)
const base=(args.find(a=>/^https?:/.test(a))||'http://localhost:5401').replace(/\/$/,'')
const strict=args.includes('--strict'), detail=args.includes('--detail')

// Primary keyword for each indexable page.
const pages={
 '/':'printable worksheets','/worksheets':'printable worksheets','/create':'worksheet maker',
 '/create/word-search':'word search','/create/word-scramble':'word scramble','/create/missing-letters':'missing letters',
 '/create/templates':'worksheet templates','/create/coloring':'coloring page',
 '/faq':'worksheet','/guides/printing-worksheets':'print a worksheet','/about':'worksheet studio',
 '/math':'math worksheets','/reading':'reading worksheets','/colors':'coloring worksheets',
}  // category pages are noindex until they hold published content; the audit skips noindex pages
const strip=h=>h.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ')
 .replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#x27;|&#39;/g,"'").replace(/\s+/g,' ').trim()
const norm=s=>s.toLowerCase().replace(/[‑–—-]/g,' ').replace(/\s+/g,' ')
const stem=w=>w.replace(/(ing|es|s)$/,'')
const has=(text,kw)=>{const t=norm(text);return t.includes(kw)||kw.split(' ').every(w=>t.includes(stem(w)))}
const abs=u=>typeof u==='string'&&/^https?:\/\//.test(u)
function validate(node,where,errs){
 if(Array.isArray(node)){node.forEach(n=>validate(n,where,errs));return}
 if(!node||typeof node!=='object')return
 const t=node['@type']
 for(const [k,v] of Object.entries(node)){
  if(v===undefined||v===null||v===''||(Array.isArray(v)&&!v.length))errs.push(`${where}: empty ${k}`)
  if(/^(url|image|logo|item|@id|contentUrl|target)$/.test(k)&&typeof v==='string'&&!abs(v)&&!v.includes('{'))errs.push(`${where}: relative ${k} ${v}`)
  if(v&&typeof v==='object')validate(v,where,errs)
 }
 const need=(...ks)=>ks.forEach(k=>{if(!node[k])errs.push(`${where}: ${t} missing ${k}`)})
 if(t==='WebSite'||t==='Organization')need('name','url')
 if(t==='WebPage'||t==='CollectionPage')need('name','url')
 if(t==='LearningResource')need('name')
 if(t==='HowTo')need('name','step')
 if(t==='FAQPage'&&!(node.mainEntity||[]).every(q=>q['@type']==='Question'&&q.name&&q.acceptedAnswer?.text))errs.push(`${where}: FAQPage incomplete`)
 if(t==='BreadcrumbList'){(node.itemListElement||[]).forEach((li,i)=>{if(li.position!==i+1||!li.name||!li.item)errs.push(`${where}: breadcrumb ${i+1} invalid`)})}
}
const rows=[]
for(const [path,kw] of Object.entries(pages)){
 const res=await fetch(base+path); const html=await res.text()
 const row={path,fails:[]}
 if(!res.ok){row.fails.push('http '+res.status);rows.push(row);continue}
 if(/<meta name="robots" content="[^"]*noindex/.test(html)){row.skipped=true;rows.push(row);continue}
 const title=strip((html.match(/<title>([\s\S]*?)<\/title>/)||[])[1]||'')
 const main=(html.match(/<main[\s\S]*?<\/main>/)||[html])[0]
 const firstP=strip((main.match(/<p[^>]*>([\s\S]*?)<\/p>/)||[])[1]||'')
 const h2s=[...main.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)].map(m=>strip(m[1]))
 const alts=[...main.matchAll(/<img[^>]*\salt="([^"]*)"/g)].map(m=>strip(m[1]))
 const hrefs=[...html.matchAll(/<a[^>]*\shref="([^"]+)"/g)].map(m=>m[1])
 const internal=hrefs.filter(h=>h.startsWith('/')).length
 const external=hrefs.filter(h=>/^https?:\/\//.test(h)&&!h.startsWith(base)).length
 if(!has(title,kw))row.fails.push('title')
 if(!has(firstP,kw))row.fails.push('paragraph')
 if(!h2s.some(h=>has(h,kw)))row.fails.push('h2')
 if(!alts.some(a=>has(a,kw)))row.fails.push('alt')
 if(!internal)row.fails.push('internal')
 if(!external)row.fails.push('external')
 const errs=[],blocks=[...html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/g)]
 if(!blocks.length)errs.push(path+': no JSON-LD')
 for(const m of blocks){try{const d=JSON.parse(m[1]);if(d['@context']!=='https://schema.org')errs.push(path+': bad @context');validate(d,path,errs)}catch(e){errs.push(path+': invalid JSON')}}
 if(errs.length)row.fails.push('schema'),row.schema=errs
 if(detail)row.info={title,firstP:firstP.slice(0,90),h2s:h2s.slice(0,4),alts:alts.slice(0,3),internal,external}
 rows.push(row)
}
const bad=rows.filter(r=>r.fails.length)
for(const r of rows.filter(r=>r.skipped))console.log('skip',r.path,'(noindex by design)')
console.log(`On-page audit: ${rows.length} pages`)
for(const r of rows.filter(r=>!r.skipped))console.log(r.fails.length?'FAIL':'ok  ',r.path,r.fails.join(','),(r.schema||[]).slice(0,2).join(' | '))
if(detail)for(const r of rows)console.log(r.path,JSON.stringify(r.info))
if(!bad.length)console.log('all checks pass')
if(strict&&bad.length)process.exit(1)
