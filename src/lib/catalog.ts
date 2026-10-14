
export type Subject = 'english' | 'math' | 'coloring';
export type Worksheet = {
  slug: string; title: string; description: string; subject: Subject; grade: string;
  category: string; pages: number; difficulty: string; icon: string; accent: string; featured?: boolean;
};
export const subjects = [
  {slug:'english', title:'English', description:'Build reading, spelling and writing confidence.', icon:'book-open', tint:'peach'},
  {slug:'math', title:'Mathematics', description:'Make numbers, patterns and problem solving fun.', icon:'calculator', tint:'blue'},
  {slug:'coloring', title:'Coloring', description:'Creative adventures for busy little hands.', icon:'palette', tint:'mint'},
] as const;
export const samples: Worksheet[] = [
  {slug:'alphabet-tracing-adventure',title:'Alphabet Tracing Adventure',description:'Practice uppercase and lowercase letters with easy tracing prompts.',subject:'english',grade:'Preschool',category:'Letters & Phonics',pages:2,difficulty:'Beginner',icon:'Aa',accent:'peach',featured:true},
  {slug:'addition-within-twenty',title:'Addition Within 20',description:'Build addition fluency with number sentences and visual sums.',subject:'math',grade:'Grade 1',category:'Addition',pages:2,difficulty:'Beginner',icon:'1+2',accent:'blue',featured:true},
  {slug:'ocean-friends-coloring',title:'Ocean Friends Coloring',description:'Explore sea animals while practicing creativity and fine motor skills.',subject:'coloring',grade:'Kindergarten',category:'Animals',pages:3,difficulty:'All levels',icon:'🐠',accent:'mint',featured:true},
  {slug:'sight-words-practice',title:'Sight Words Practice',description:'Read and write common high-frequency words with confidence.',subject:'english',grade:'Grade 1',category:'Reading',pages:2,difficulty:'Beginner',icon:'ABC',accent:'lavender'},
  {slug:'counting-to-ten',title:'Count and Match to 10',description:'Count objects and connect them to the correct numerals.',subject:'math',grade:'Preschool',category:'Counting',pages:2,difficulty:'Beginner',icon:'1 2 3',accent:'yellow'},
  {slug:'butterfly-garden',title:'Butterfly Garden Coloring',description:'A playful coloring activity inspired by nature.',subject:'coloring',grade:'Kindergarten',category:'Nature',pages:2,difficulty:'All levels',icon:'🦋',accent:'pink'}
];
export const typeNames: Record<string,string> = {'word-search':'Word Search','word-scramble':'Word Scramble','missing-letters':'Missing Letters'};
export const typeDescriptions: Record<string,string> = {
  'word-search':'Turn your word list into a custom letter hunt.',
  'word-scramble':'Mix things up and practice spelling.',
  'missing-letters':'Fill the blanks and build word confidence.'
};
