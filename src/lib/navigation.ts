export const mainMenus=[
 {key:'math',name:'Math',href:'/math',gradeSubject:'math',items:[
  {name:'Addition',href:'/worksheets?subject=math&q=addition'},
  {name:'Subtraction',href:'/worksheets?subject=math&q=subtraction'},
  {name:'Counting',href:'/worksheets?subject=math&q=counting'},
  {name:'Multiplication',href:'/worksheets?subject=math&q=multiplication'},
  {name:'Division',href:'/worksheets?subject=math&q=division'},
  {name:'Fractions',href:'/worksheets?subject=math&q=fractions'},
  {name:'Shapes & Patterns',href:'/worksheets?subject=math&q=shapes'},
  {name:'Word Problems',href:'/worksheets?subject=math&q=word%20problems'}
 ]},
 {key:'english',name:'English',href:'/english',gradeSubject:'reading',items:[
  {name:'Reading & Phonics',href:'/reading'},
  {name:'Vocabulary',href:'/vocabulary'},
  {name:'Spelling',href:'/spelling'},
  {name:'Grammar',href:'/grammar'},
  {name:'Writing & Tracing',href:'/writing'},
  {name:'Word Search',href:'/create/word-search'},
  {name:'Word Scramble',href:'/create/word-scramble'},
  {name:'Missing Letters',href:'/create/missing-letters'}
 ]},
 {key:'color',name:'Color',href:'/colors',gradeSubject:'colors',items:[
  {name:'Coloring Page Maker',href:'/create/coloring'},
  {name:'Animals',href:'/create/coloring?category=animals'},
  {name:'Fruits',href:'/create/coloring?category=fruits'},
  {name:'Nature',href:'/create/coloring?category=nature'},
  {name:'Shapes',href:'/create/coloring?category=shapes'},
  {name:'Everyday Objects',href:'/create/coloring?category=objects'}
 ]}
] as const;
