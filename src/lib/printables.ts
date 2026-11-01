import {generate} from '@/lib/generators';

export type Block=
 |{kind:'problems';cols:number;items:{q:string;a:string}[]}
 |{kind:'count';items:{emoji:string;n:number}[]}
 |{kind:'trace';items:string[]}
 |{kind:'words';items:string[]}
 |{kind:'sentences';items:string[]}
 |{kind:'fill';items:{q:string;a:string}[]}
 |{kind:'puzzle';grid:string[][];words:string[];solution:string[]};

export type Printable={
 slug:string;title:string;seoTitle:string;seoDescription:string;description:string;
 subject:'math'|'reading'|'kindergarten'|'spelling'|'writing';grade:string;category:string;
 difficulty:string;icon:string;accent:string;featured?:boolean;
 instructions:string;howToUse:string[];skills:string[];block:Block;
};

function rng(seed:number){let v=seed>>>0;return()=>{v=(v*1664525+1013904223)>>>0;return v/4294967296;};}
function shuffle<T>(arr:T[],seed:number):T[]{const n=rng(seed),o=[...arr];for(let i=o.length-1;i>0;i--){const j=Math.floor(n()*(i+1));[o[i],o[j]]=[o[j],o[i]];}return o;}
const pairs=(list:[number,number][],seed:number,count:number)=>shuffle(list,seed).slice(0,count);

const addList:[number,number][]=[];for(let a=1;a<=19;a++)for(let b=1;b<=19;b++)if(a+b<=20&&a+b>=5)addList.push([a,b]);
const subList:[number,number][]=[];for(let a=5;a<=20;a++)for(let b=1;b<=a;b++)subList.push([a,b]);
const mulList:[number,number][]=[];for(let a=2;a<=5;a++)for(let b=1;b<=10;b++)mulList.push([a,b]);

function skip(step:number,start:number,blanks:number[]){
 const seq=Array.from({length:6},(_,i)=>start+i*step);
 return{q:seq.map((n,i)=>blanks.includes(i)?'____':String(n)).join(',  '),a:blanks.map(i=>seq[i]).join(', ')};
}
const skipItems=[
 skip(2,2,[2,4]),skip(2,10,[1,5]),skip(2,4,[3,5]),skip(5,5,[2,4]),skip(5,10,[1,3]),skip(5,25,[0,4]),
 skip(10,10,[2,5]),skip(10,30,[1,3]),skip(10,50,[0,4]),skip(3,3,[2,4]),skip(3,12,[1,5]),skip(4,4,[3,5])
];

const placeItems:{q:string;a:string}[]=[];
[47,23,81,59,36,92,14,68].forEach(n=>placeItems.push({q:`${n} = ____ tens and ____ ones`,a:`${Math.floor(n/10)} tens and ${n%10} ones`}));
[[3,5],[7,2],[5,9],[8,0],[2,6],[6,4],[9,1],[4,8]].forEach(([t,o])=>placeItems.push({q:`${t} tens and ${o} ones = ____`,a:String(t*10+o)}));

const countEmoji:[string,number][]=[['🍎',3],['⭐',5],['🐟',2],['🌼',7],['🚗',4],['🐞',6],['🍪',9],['🎈',8],['🐥',1],['🍓',10]];

const cvc=['cat','hat','bat','mat','man','fan','can','pan','pig','big','dig','wig','hop','top','mop','pop'];
const cvcPuzzle=generate('missing-letters',cvc,7,'easy',{missingPercent:34,preserveFirst:true});
const animalWords=['cat','dog','lion','tiger','zebra','rabbit','panda','horse','sheep','monkey'];
const ws=generate('word-search',animalWords,11,'easy',{gridSize:12});
const solutionCells=(ws.placements||[]).flatMap(p=>p.cells.map(([r,c])=>r+','+c));

const sightWords=['a','and','away','big','blue','can','come','down','find','for','funny','go','help','here','I','in','is','it','jump','little','look','make','me','my'];
const sentences=['The sun is bright today.','My dog likes to run.','We read a book at home.','I can see a red bird.','She helps her mom cook.','The fish swims in the sea.','Our class goes to the park.','He draws a big blue boat.'];

export const printables:Printable[]=[
 {slug:'addition-within-twenty',title:'Addition Within 20 Worksheet',
  seoTitle:'Addition Within 20 Worksheet (Free Printable PDF, Grade 1)',
  seoDescription:'Free printable addition within 20 worksheet for Grade 1 with 30 practice problems and an answer key. Print on A4 or US Letter.',
  description:'30 addition facts with sums up to 20 to build fluency, with a separate answer key page.',
  subject:'math',grade:'Grade 1',category:'Addition',difficulty:'Beginner',icon:'1+2',accent:'blue',featured:true,
  instructions:'Solve each addition problem and write the answer on the line.',
  howToUse:['Set a 10 minute timer and see how many your child can finish.','Use counters or fingers for tricky facts, then try again without them.','Check with the answer key on the last page and redo any misses a day later.'],
  skills:['Addition facts to 20','Number fluency','Mental math'],
  block:{kind:'problems',cols:3,items:pairs(addList,3,30).map(([a,b])=>({q:`${a} + ${b} = ____`,a:String(a+b)}))}},
 {slug:'subtraction-within-twenty',title:'Subtraction Within 20 Worksheet',
  seoTitle:'Subtraction Within 20 Worksheet (Free Printable, Grade 1)',
  seoDescription:'Free printable subtraction within 20 worksheet with 30 problems and an answer key for Grade 1 and early Grade 2 practice.',
  description:'30 subtraction facts within 20 for fluency practice, with an answer key.',
  subject:'math',grade:'Grade 1',category:'Subtraction',difficulty:'Beginner',icon:'9−4',accent:'peach',
  instructions:'Subtract and write the difference on the line.',
  howToUse:['Pair with the addition sheet so children see subtraction as the opposite operation.','Let learners draw dots or use a number line for harder facts.','Review mistakes with the answer key rather than giving answers up front.'],
  skills:['Subtraction facts to 20','Fact families','Mental math'],
  block:{kind:'problems',cols:3,items:pairs(subList,5,30).map(([a,b])=>({q:`${a} − ${b} = ____`,a:String(a-b)}))}},
 {slug:'multiplication-facts-2-to-5',title:'Multiplication Facts: 2, 3, 4 and 5 Times Tables',
  seoTitle:'Multiplication Facts Worksheet: 2, 3, 4 and 5 Times Tables (Free PDF)',
  seoDescription:'Free printable multiplication worksheet covering the 2, 3, 4 and 5 times tables with 30 mixed facts and an answer key for Grade 3.',
  description:'30 mixed multiplication facts from the 2, 3, 4 and 5 times tables, with an answer key.',
  subject:'math',grade:'Grade 3',category:'Multiplication',difficulty:'Intermediate',icon:'×',accent:'lavender',featured:true,
  instructions:'Multiply and write the product on the line.',
  howToUse:['Practise one table aloud first, then complete the sheet.','Time a second attempt a few days later to track progress.','Use skip counting to work out facts that are not yet memorised.'],
  skills:['Times tables 2 to 5','Recall of multiplication facts','Skip counting'],
  block:{kind:'problems',cols:3,items:pairs(mulList,9,30).map(([a,b])=>({q:`${a} × ${b} = ____`,a:String(a*b)}))}},
 {slug:'skip-counting-patterns',title:'Skip Counting Patterns by 2, 3, 4, 5 and 10',
  seoTitle:'Skip Counting Worksheet: Fill in the Missing Numbers (Free Printable)',
  seoDescription:'Free skip counting worksheet with 12 number patterns by 2s, 3s, 4s, 5s and 10s. Fill in the missing numbers. Answer key included.',
  description:'Complete 12 number patterns by counting on in 2s, 3s, 4s, 5s and 10s.',
  subject:'math',grade:'Grade 2',category:'Number Patterns',difficulty:'Beginner',icon:'2,4,6',accent:'mint',
  instructions:'Find the pattern and write the missing numbers in each row.',
  howToUse:['Say the pattern out loud before writing the missing numbers.','Ask what number is added each time to find the rule.','Move on to times tables once skip counting feels easy.'],
  skills:['Skip counting','Number patterns','Pre-multiplication'],
  block:{kind:'fill',items:skipItems}},
 {slug:'place-value-tens-and-ones',title:'Place Value: Tens and Ones',
  seoTitle:'Place Value Worksheet: Tens and Ones (Free Printable, Grade 2)',
  seoDescription:'Free tens and ones place value worksheet with 16 problems for Grade 2, covering splitting two-digit numbers and building them. Answer key included.',
  description:'16 problems that split two-digit numbers into tens and ones and rebuild them.',
  subject:'math',grade:'Grade 2',category:'Place Value',difficulty:'Beginner',icon:'T·O',accent:'yellow',
  instructions:'Write how many tens and ones, or write the number.',
  howToUse:['Show the numbers with base-ten blocks or bundled sticks first.','Read each number aloud: forty-seven is four tens and seven ones.','Use the answer key to discuss any number with a zero ones digit.'],
  skills:['Place value to 99','Two-digit numbers','Number sense'],
  block:{kind:'fill',items:placeItems}},
 {slug:'counting-to-ten',title:'Count and Write the Number (1 to 10)',
  seoTitle:'Counting to 10 Worksheet: Count and Write the Number (Free Printable)',
  seoDescription:'Free counting to 10 worksheet for kindergarten and Grade 1. Count the pictures and write the number. Answer key included.',
  description:'Count the pictures in each group and write the number from 1 to 10.',
  subject:'math',grade:'Grade 1',category:'Counting',difficulty:'Beginner',icon:'1 2 3',accent:'yellow',
  instructions:'Count the pictures in each box and write the number.',
  howToUse:['Touch each picture once while counting aloud.','Cross out pictures as they are counted to avoid double counting.','Ask how many more are needed to reach ten for an extra challenge.'],
  skills:['Counting objects','Number writing 1 to 10','One-to-one correspondence'],
  block:{kind:'count',items:countEmoji.map(([emoji,n])=>({emoji,n}))}},
 {slug:'alphabet-tracing-adventure',title:'Alphabet Tracing: Uppercase and Lowercase A to Z',
  seoTitle:'Alphabet Tracing Worksheet A to Z (Free Printable Uppercase and Lowercase)',
  seoDescription:'Free printable alphabet tracing worksheet for A to Z. Trace uppercase and lowercase letters, then write your own. Great for preschool and kindergarten.',
  description:'Trace each uppercase and lowercase letter pair from A to Z, then write your own.',
  subject:'kindergarten',grade:'Grade 1',category:'Letters & Phonics',difficulty:'Beginner',icon:'Aa',accent:'mint',featured:true,
  instructions:'Trace each letter with a pencil, then write it again on the empty space.',
  howToUse:['Start at the top of each letter and go down; say the letter sound as you trace.','Practise a few letters per day instead of the full sheet at once.','Check pencil grip and posture; short sessions work best.'],
  skills:['Letter formation','Fine motor control','Letter recognition'],
  block:{kind:'trace',items:'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(l=>l+' '+l.toLowerCase())}},
 {slug:'sight-words-practice',title:'Sight Words Practice: 24 Pre-Primer and Primer Words',
  seoTitle:'Sight Words Worksheet: 24 Pre-Primer and Primer Words (Free Printable)',
  seoDescription:'Free sight words practice sheet with 24 common pre-primer and primer words. Trace each word, then write it twice. Great for Kindergarten and Grade 1.',
  description:'Trace and write 24 common high-frequency words for early readers.',
  subject:'reading',grade:'Grade 1',category:'Sight Words',difficulty:'Beginner',icon:'ABC',accent:'lavender',
  instructions:'Read the word, trace it, then write it two times.',
  howToUse:['Read each word aloud before tracing.','Practise 6 words a day over four days.','Ask your child to use each word in a spoken sentence.'],
  skills:['High-frequency words','Handwriting','Early reading fluency'],
  block:{kind:'words',items:sightWords}},
 {slug:'cvc-word-families-missing-letters',title:'CVC Word Families: Missing Letters',
  seoTitle:'CVC Words Worksheet: Fill in the Missing Letters (-at, -an, -ig, -op)',
  seoDescription:'Free CVC missing letters worksheet for Kindergarten and Grade 1. Fill in the blanks in 16 words from the -at, -an, -ig and -op families.',
  description:'Fill the missing letters in 16 short words from four word families.',
  subject:'reading',grade:'Grade 1',category:'Phonics',difficulty:'Beginner',icon:'c_t',accent:'peach',
  instructions:'Say the word, listen for the missing sound and write the missing letter.',
  howToUse:['Stretch each word slowly: c-a-t.','Group answers by word family (-at, -an, -ig, -op) afterwards.','Make new rhyming words together for extra practice.'],
  skills:['CVC words','Word families','Phonics and spelling'],
  block:{kind:'fill',items:(cvcPuzzle.items||[]).map(i=>({q:i.question,a:i.answer}))}},
 {slug:'animal-word-search',title:'Animal Word Search',
  seoTitle:'Animal Word Search (Free Printable, Grade 2) with Answer Key',
  seoDescription:'Free printable animal word search with 10 words in a 12x12 grid and an answer key. Good for spelling practice in Grade 2 and Grade 3.',
  description:'Find 10 animal words hidden in a 12 by 12 letter grid. Answer key included.',
  subject:'spelling',grade:'Grade 2',category:'Word Puzzles',difficulty:'Beginner',icon:'🔎',accent:'mint',
  instructions:'Find and circle each word. Words go across and down.',
  howToUse:['Say the word, then spell it before searching.','Cross each word off the list as you find it.','Make your own version with the free word search maker.'],
  skills:['Spelling','Visual scanning','Animal vocabulary'],
  block:{kind:'puzzle',grid:ws.grid||[],words:animalWords,solution:solutionCells}},
 {slug:'handwriting-sentences-practice',title:'Handwriting Practice: Copy 8 Short Sentences',
  seoTitle:'Handwriting Practice Worksheet: Copy Short Sentences (Free Printable)',
  seoDescription:'Free handwriting practice worksheet with 8 short sentences to copy, with guide lines. Builds neat writing, spacing and punctuation habits.',
  description:'Copy eight short sentences on guide lines to practise neat letters, spacing and punctuation.',
  subject:'writing',grade:'Grade 2',category:'Handwriting',difficulty:'Beginner',icon:'✎',accent:'pink',
  instructions:'Read each sentence, then copy it neatly on the line below.',
  howToUse:['Look at the sentence, cover it, then write from memory for an extra challenge.','Remind learners about capital letters at the start and a full stop at the end.','Keep to one or two sentences a day if writing is tiring.'],
  skills:['Handwriting','Capitalisation and full stops','Spacing between words'],
  block:{kind:'sentences',items:sentences}}
];
export const printableBySlug=(slug:string)=>printables.find(p=>p.slug===slug);
