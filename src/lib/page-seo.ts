/** Per-page "keep exploring" content: one image (keyword alt), one H2, a one-line note and trusted outbound links. */
export type PageSeo={art:string;alt:string;h2:string;note:string;refs:{label:string;href:string}[];related:{label:string;href:string}[]};
const ref={
 ccss:{label:'Common Core State Standards',href:'https://www.thecorestandards.org/'},
 rr:{label:'Reading Rockets: reading help for families',href:'https://www.readingrockets.org/'},
 nctm:{label:'NCTM: math teaching resources',href:'https://www.nctm.org/'},
 ed:{label:'U.S. Department of Education',href:'https://www.ed.gov/'},
 wordsearch:{label:'Word search puzzles (Wikipedia)',href:'https://en.wikipedia.org/wiki/Word_search'},
 anagram:{label:'Anagrams and word scrambles (Wikipedia)',href:'https://en.wikipedia.org/wiki/Anagram'},
 handwriting:{label:'Handwriting (Wikipedia)',href:'https://en.wikipedia.org/wiki/Handwriting'},
 spelling:{label:'Spelling (Wikipedia)',href:'https://en.wikipedia.org/wiki/Spelling'},
 coloring:{label:'Coloring book (Wikipedia)',href:'https://en.wikipedia.org/wiki/Coloring_book'},
 adobe:{label:"Adobe's PDF printing guide",href:'https://helpx.adobe.com/acrobat/using/print-pdfs.html'},
 paper:{label:'Paper sizes: A4 and US Letter (Wikipedia)',href:'https://en.wikipedia.org/wiki/Paper_size'},
};
const rel={
 library:{label:'Printable worksheet library',href:'/worksheets'},make:{label:'Worksheet makers',href:'/create'},
 faq:{label:'Worksheet FAQ',href:'/faq'},guide:{label:'Printing guide',href:'/guides/printing-worksheets'},
 ws:{label:'Word search maker',href:'/create/word-search'},sc:{label:'Word scramble maker',href:'/create/word-scramble'},
 ml:{label:'Missing letters maker',href:'/create/missing-letters'},col:{label:'Coloring page maker',href:'/create/coloring'},
 tpl:{label:'Worksheet templates',href:'/create/templates'},about:{label:'About Worksheet Studio',href:'/about'},
};
const A={ws:'/art/worksheets.svg',mk:'/art/maker.svg',hp:'/art/help.svg'};
export const pageSeo:Record<string,PageSeo>={
 '/':{art:A.ws,alt:'Free printable worksheets for Grades 1–6: tracing, math and reading pages',h2:'Free printable worksheets, ready to print',
  note:'Every maker works in your browser and exports a print-ready PDF.',refs:[ref.ccss,ref.rr,ref.nctm],related:[rel.library,rel.make,rel.guide,rel.faq]},
 '/worksheets':{art:A.ws,alt:'Printable worksheets library for Grades 1–6',h2:'Printable worksheets by grade and subject',
  note:'Filter by subject, grade and file type to find a worksheet that fits.',refs:[ref.ccss,ref.ed],related:[rel.make,rel.guide,rel.faq]},
 '/create':{art:A.mk,alt:'Free worksheet maker with word search, scramble and tracing templates',h2:'Choose a free worksheet maker',
  note:'No sign-in needed for the classic makers; answer keys are separate.',refs:[ref.wordsearch,ref.handwriting],related:[rel.ws,rel.sc,rel.ml,rel.library]},
 '/create/word-search':{art:A.mk,alt:'Word search maker preview with letter grid and answer key',h2:'About the word search maker',
  note:'Type your words, pick a grid size and print the puzzle with its answer key.',refs:[ref.wordsearch,ref.spelling],related:[rel.sc,rel.ml,rel.make,rel.guide]},
 '/create/word-scramble':{art:A.mk,alt:'Word scramble worksheet with mixed-up spelling words',h2:'About the word scramble maker',
  note:'Mix up a word list into a spelling puzzle and print the solutions separately.',refs:[ref.anagram,ref.spelling],related:[rel.ws,rel.ml,rel.make,rel.guide]},
 '/create/missing-letters':{art:A.mk,alt:'Missing letters worksheet with blanks to fill in',h2:'About the missing letters maker',
  note:'Hide letters in any word list so learners complete the spelling.',refs:[ref.spelling,ref.rr],related:[rel.ws,rel.sc,rel.make,rel.guide]},
 '/create/templates':{art:A.mk,alt:'Printable worksheet templates for tracing, word search and spelling',h2:'About the worksheet templates',
  note:'Pick a template, edit the content and print it on A4 or US Letter.',refs:[ref.handwriting,ref.paper],related:[rel.ws,rel.col,rel.make,rel.guide]},
 '/create/coloring':{art:A.mk,alt:'Coloring page maker with animal and nature outline drawings',h2:'About the coloring page maker',
  note:'Choose up to four outline drawings and save them as a PDF or PNG.',refs:[ref.coloring,ref.rr],related:[rel.make,rel.library,rel.guide]},
 '/faq':{art:A.hp,alt:'Worksheet FAQ: answers about printing, makers and accounts',h2:'More help with printable worksheets',
  note:'Still stuck? The printing guide walks through paper size and answer keys.',refs:[ref.adobe,ref.ed],related:[rel.guide,rel.make,rel.library]},
 '/guides/printing-worksheets':{art:A.hp,alt:'How to print a worksheet: preview, paper size and answer key',h2:'How to print a worksheet without surprises',
  note:'A4 and US Letter differ slightly, so check scaling before you print.',refs:[ref.adobe,ref.paper],related:[rel.make,rel.library,rel.faq]},
 '/about':{art:A.hp,alt:'Worksheet Studio: free printable worksheets for families and teachers',h2:'Why Worksheet Studio exists',
  note:'Free-first tools for families and educators, built to print cleanly.',refs:[ref.ccss,ref.ed],related:[rel.make,rel.library,rel.faq]},
};
export const defaultSeo:PageSeo={art:A.ws,alt:'Free printable worksheets for Grades 1–6',h2:'Keep exploring printable worksheets',
 note:'Browse the library or make your own worksheet.',refs:[ref.ccss,ref.rr],related:[rel.library,rel.make,rel.guide,rel.faq]};
export const footerRefs=[ref.ccss,ref.rr,ref.nctm,ref.ed];
