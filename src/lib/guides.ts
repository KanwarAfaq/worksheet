export type GuideLink={label:string;href:string};
export type Guide={
 slug:string;navLabel:string;title:string;description:string;h1:string;h1em:string;lead:string;
 sections:{h:string;p:string[];list?:string[]}[];
 faq:{q:string;a:string}[];
 links:GuideLink[];
};
const print:GuideLink={label:'How to print a worksheet (A4 and US Letter)',href:'/guides/printing-worksheets'};
export const guides:Guide[]=[
 {slug:'missing-letters-worksheets',navLabel:'Missing letters worksheets',
  title:'Missing Letters Worksheet: How to Use and Make One',
  description:'How to use a missing letters worksheet for spelling and early reading practice, with tips for parents and teachers and a free maker for your own word lists.',
  h1:'Missing letters worksheet:',h1em:'how to use and make one',
  lead:'A missing letters worksheet shows a word with one or more letters left blank. The learner reads the clues, thinks about the sounds and fills in the gaps. It is a simple way to practise spelling and letter-sound knowledge without a full writing task.',
  sections:[
   {h:'Why missing letters practice works',p:[
    'Filling in a blank asks a child to look closely at how a word is built. Unlike copying, they have to recall the letter themselves, which gives you a quick view of which sounds and patterns they know and which are still shaky.',
    'The activity is also low pressure. The word is mostly there, so early readers can succeed, and you can raise the challenge gradually by hiding more letters.']},
   {h:'How to use the activity',p:['A short routine keeps the practice focused.'],list:[
    'Start with a small word list of 6 to 10 words that match what your learner is studying, such as one word family or a handful of sight words.',
    'Hide one letter per word at first, ideally a vowel or an ending sound the child is working on.',
    'Ask the child to say the word aloud, stretch out the sounds, then write the missing letter.',
    'Check together. If a word is wrong, say the sounds slowly and let the child self-correct instead of just giving the answer.',
    'Repeat the same list a few days later with different letters hidden.']},
   {h:'Choosing a level',p:['Ages and grades vary a lot, so treat this as general guidance rather than a rule. Younger learners usually do best with short, regular words and a single blank. Children who are comfortable with that can try longer words, consonant blends or two missing letters. Older learners can use the same format for subject vocabulary, such as science terms or spelling-list words they find tricky.']},
   {h:'Tips for parents and teachers',p:['Keep sessions short, ten minutes is plenty, and finish on words the child gets right. Mix in a few easy words for confidence. In a classroom, the same sheet can be used as a warm-up, a literacy centre or a quick homework task. For a learner who needs more support, give a word bank at the top of the page; for one who needs more challenge, remove it.',
    'Because the maker lets you type any word list, you can match sheets to your own spelling lists instead of searching for a ready-made page.']}
  ],
  faq:[
   {q:'Can I make a missing letters worksheet with my own words?',a:'Yes. Open the missing letters maker, type or paste your word list, choose how the blanks are hidden and export a print-ready PDF.'},
   {q:'How many letters should I hide?',a:'Start with one per word and increase gradually as the learner gets more confident. There is no fixed rule; adjust to the child.'},
   {q:'Is it free?',a:'The classic makers work in your browser without an account.'}],
  links:[
   {label:'Missing letters maker',href:'/create/missing-letters'},
   {label:'Sight Words Practice worksheet',href:'/worksheets/sight-words-practice'},
   {label:'Spelling worksheets',href:'/spelling'},
   {label:'Word scramble maker',href:'/create/word-scramble'},print]},
 {slug:'handwriting-practice-worksheets',navLabel:'Handwriting and tracing worksheets',
  title:'Handwriting Practice and Tracing Worksheets: A Parent and Teacher Guide',
  description:'Practical advice on using handwriting practice and tracing worksheets: posture, grip, short sessions, letter order and moving from tracing to writing on your own.',
  h1:'Handwriting practice and',h1em:'tracing worksheets',
  lead:'Tracing worksheets give young writers a guide to follow while they learn how letters are formed. Handwriting practice sheets then reduce that support step by step. Used well, short regular sessions help children write more comfortably and legibly.',
  sections:[
   {h:'What tracing worksheets are for',p:[
    'Tracing lets a child feel the movement of a letter, where it starts, which way it goes and where it stops, before they have to remember it alone. It also builds the pencil control needed for later writing.',
    'Tracing is a stepping stone, not the end goal. The aim is for the child to form letters independently, so plan to move from tracing, to copying under a model, to writing from memory.']},
   {h:'Setting up for success',p:['A few simple habits make more difference than extra pages.'],list:[
    'Seat the child so their feet are supported and the paper sits comfortably on the table.',
    'Use a regular pencil or a chunky pencil that feels comfortable. Let them hold it in a way that is relaxed and works for them.',
    'Slightly tilt the paper for right-handed children and tilt it the other way for left-handed children.',
    'Print at a readable size. Very small writing lines make the task harder, not easier. See the printing guide to check scaling.']},
   {h:'A simple progression',p:['Many teachers begin with straight and curved lines, then move to letters, then words. Within the alphabet, it often helps to group letters that share a starting stroke, for example letters that begin with a curve, rather than strictly following A to Z. Once a child can trace a letter well, ask them to write it next to the dotted model, then on a blank line. After letters, move on to their own name and short familiar words.']},
   {h:'How much and how often',p:['Young children tire quickly. A few minutes a day is usually better than one long sitting. Stop while the child is still doing well, and praise careful effort rather than perfect shapes. If letters are consistently reversed or the child is frustrated every time, talk with their teacher; this guide is general advice and not a substitute for professional assessment.']},
   {h:'Making your own handwriting practice page',p:['The template maker can create tracing rows from your own letters or words, so you can practise a child\'s name or a current spelling list. Choose the tracing template, edit the text and print on A4 or US Letter.']}
  ],
  faq:[
   {q:'What age should children start tracing?',a:'Children develop at different rates. Many begin letter tracing in preschool or kindergarten once they enjoy drawing lines and shapes; follow the child\'s readiness rather than a fixed age.'},
   {q:'Should we trace uppercase or lowercase first?',a:'Either can work. Many programmes start with uppercase because the shapes are simpler, while others begin with lowercase because they appear most in reading. Follow what your child\'s school uses.'},
   {q:'Can I make a tracing worksheet with my own words?',a:'Yes. The worksheet template maker has a tracing option where you enter your own text.'}],
  links:[
   {label:'Tracing and handwriting template maker',href:'/create/templates'},
   {label:'Alphabet Tracing Adventure worksheet',href:'/worksheets/alphabet-tracing-adventure'},
   {label:'Writing worksheets',href:'/writing'},
   {label:'Kindergarten worksheets',href:'/kindergarten'},
   {label:'Missing letters maker',href:'/create/missing-letters'},print]},
 {slug:'grade-1-math-worksheets',navLabel:'Grade 1 math worksheets',
  title:'Grade 1 Math Worksheets: Counting, Addition and How to Use Them',
  description:'How to use Grade 1 math worksheets at home or in class: counting, number sentences and addition practice, with tips for keeping sessions short and confidence high.',
  h1:'Grade 1 math worksheets:',h1em:'how to use them well',
  lead:'Grade 1 math worksheets are most helpful when they back up hands-on learning. Counting objects, talking about numbers and playing simple games come first; a worksheet then lets a child show what they understand on paper.',
  sections:[
   {h:'What to look for in a Grade 1 worksheet',p:['Topics differ by school and country, so check what your child\'s class is covering. Common early topics include counting, comparing numbers, addition and subtraction with small numbers, and reading simple number sentences. Pick sheets with clear spacing, big numerals and a limited number of problems per page.']},
   {h:'Using worksheets alongside real objects',p:['Before a page of sums, let the child act them out with buttons, blocks or coins. Say the sentence aloud: "three and two more makes five." Then use the worksheet to record the same idea. This connects the symbols to quantities and makes mistakes easier to spot.']},
   {h:'A simple routine',p:['Keep it brief and predictable.'],list:[
    'Choose one skill, for example counting to 10 or adding within 20.',
    'Do two or three problems together, thinking aloud.',
    'Let the child complete the rest on their own.',
    'Check and talk about any wrong answers: "How did you work that out?"',
    'Stop after 10 to 15 minutes, even if the page is not finished.']},
   {h:'Tips for parents and teachers',p:['Praise effort and strategies, not just correct answers. If a child is stuck, go back to an easier sheet rather than pushing on. Mixing in games like dominoes or dice keeps maths enjoyable. Teachers can use the same page for centres, early finishers or homework, adjusting how many problems to assign.']},
   {h:'Worksheets on this site',p:['Browse the Grade 1 math sheets for counting and addition. Use the printing guide to print on A4 or US Letter, and keep any answer key separate from the student copy.']}
  ],
  faq:[
   {q:'How many worksheets should a Grade 1 student do a day?',a:'There is no set number. One short page focused on one skill is usually enough, alongside talking and playing with numbers.'},
   {q:'Do the worksheets include answer keys?',a:'Where an answer key is available it is provided separately from the student page. Check each worksheet\'s description.'},
   {q:'Are these worksheets free?',a:'Yes, Worksheet Studio worksheets are free to browse and print.'}],
  links:[
   {label:'Addition Within 20 worksheet',href:'/worksheets/addition-within-twenty'},
   {label:'Count and Match to 10 worksheet',href:'/worksheets/counting-to-ten'},
   {label:'All math worksheets',href:'/math'},
   {label:'Missing letters maker (for number words and spelling)',href:'/create/missing-letters'},print]},
 {slug:'free-printable-worksheets',navLabel:'Free printable worksheets',
  title:'Free Printable Worksheets: How to Choose, Print and Use Them',
  description:'A practical guide to free printable worksheets for Grades 1 to 6: choosing the right page, printing on A4 or US Letter, and using worksheets without overdoing drills.',
  h1:'Free printable worksheets:',h1em:'choose, print and use them',
  lead:'Free printable worksheets are handy for home practice, homeschool, tutoring and classrooms. A bit of care in choosing and using them makes the difference between a page that helps and one that is just busywork.',
  sections:[
   {h:'Start with the skill, not the subject',p:['Decide which specific skill you want to practise, such as counting to 10, spelling a word list or forming lowercase letters. Then pick a worksheet for that skill. Read the description and grade label, but treat grade levels as a guide and move up or down depending on the learner.']},
   {h:'Where to find worksheets here',p:['The worksheet library can be browsed by subject and grade and filtered by file type. If you cannot find exactly what you need, the free makers let you build word searches, word scrambles, missing letters and tracing pages from your own word lists.']},
   {h:'Printing tips',p:['Preview before printing, choose the paper size that matches the file (A4 or US Letter), and avoid scaling that makes writing space too small. Print answer keys on their own so students do not see them. If you want to save ink, black-and-white printing works for most pages.']},
   {h:'Using worksheets well',p:['Worksheets work best as one part of learning.'],list:[
    'Explain the task and try an example together first.',
    'Keep practice short and varied.',
    'Review mistakes with the learner instead of only marking them.',
    'Mix pages with games, reading aloud and hands-on activities.',
    'Reuse a good page by changing the words or numbers.']},
   {h:'Check copyright before sharing',p:['If you share or redistribute printables, check the terms attached to them. Printing for your own children or class is the typical use; see the FAQ for details on how this site handles copyright.']}
  ],
  faq:[
   {q:'Do I need an account to print worksheets?',a:'The classic worksheet makers work without an account. Uploads and AI-assisted tools need one.'},
   {q:'What paper size should I use?',a:'Use US Letter in the United States and Canada and A4 in most other countries, matching the size the worksheet was made for.'},
   {q:'What grades are covered?',a:'The library is organised around Grades 1 to 6.'}],
  links:[
   {label:'Worksheet library',href:'/worksheets'},
   {label:'Worksheet makers',href:'/create'},
   {label:'Worksheet FAQ',href:'/faq'},
   {label:'Grade 1 math worksheets guide',href:'/guides/grade-1-math-worksheets'},print]},
];
export const guideBySlug=(slug:string)=>guides.find(g=>g.slug===slug)!;
