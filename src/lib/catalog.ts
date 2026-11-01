export const subjects = [
  {slug:'math',title:'Math',description:'Numbers, operations, fractions and problem solving.',icon:'calculator',tint:'blue'},
  {slug:'reading',title:'Reading',description:'Phonics, stories, comprehension and fluency.',icon:'book-open',tint:'peach'},
  {slug:'kindergarten',title:'Kindergarten',description:'Early-learning foundations and fun activities.',icon:'shapes',tint:'mint'},
  {slug:'vocabulary',title:'Vocabulary',description:'Words, meanings, synonyms and context clues.',icon:'library-big',tint:'lavender'},
  {slug:'spelling',title:'Spelling',description:'Word families, patterns and spelling games.',icon:'spell-check',tint:'yellow'},
  {slug:'grammar',title:'Grammar',description:'Sentences, punctuation and parts of speech.',icon:'file-type',tint:'pink'},
  {slug:'writing',title:'Writing',description:'Handwriting, prompts and creative composition.',icon:'pencil-line',tint:'peach'},
  {slug:'colors',title:'Colors',description:'Color recognition, matching and creativity.',icon:'palette',tint:'mint'},
] as const;
export type Subject = typeof subjects[number]['slug'];
export const grades = [
  {slug:'grade-1',title:'Grade 1'},
  {slug:'grade-2',title:'Grade 2'},
  {slug:'grade-3',title:'Grade 3'},
  {slug:'grade-4',title:'Grade 4'},
  {slug:'grade-5',title:'Grade 5'},
  {slug:'grade-6',title:'Grade 6'}
] as const;
export const formats = [
  {slug:'pdf',title:'PDF',description:'Print-ready documents',extension:'.pdf'},
  {slug:'image',title:'Images',description:'Printable PNG, JPG and WebP',extension:'.png/.jpg/.webp'}
] as const;
export type Worksheet = {
 slug:string;title:string;description:string;subject:Subject;grade:string;
 category:string;pages:number;difficulty:string;icon:string;accent:string;featured?:boolean;
};
import {printables} from '@/lib/printables';
const otherSamples:Worksheet[] = [
  {slug:'ocean-friends-coloring',title:'Ocean Friends Coloring',description:'Explore sea animals while practicing creativity and fine motor skills.',subject:'colors',grade:'Grade 2',category:'Animals',pages:3,difficulty:'All levels',icon:'🐠',accent:'mint',featured:true},
  {slug:'butterfly-garden',title:'Butterfly Garden Coloring',description:'A playful coloring activity inspired by nature.',subject:'colors',grade:'Grade 2',category:'Nature',pages:2,difficulty:'All levels',icon:'🦋',accent:'pink'}
];
export const samples:Worksheet[] = [
  ...printables.map(p=>({slug:p.slug,title:p.title,description:p.description,subject:p.subject,grade:p.grade,category:p.category,pages:2,difficulty:p.difficulty,icon:p.icon,accent:p.accent,featured:p.featured})),
  ...otherSamples
];
export const typeNames:Record<string,string>={'word-search':'Word Search','word-scramble':'Word Scramble','missing-letters':'Missing Letters'};
export const typeDescriptions:Record<string,string>={
  'word-search':'Turn your word list into a custom letter hunt.',
  'word-scramble':'Mix things up and practice spelling.',
  'missing-letters':'Fill the blanks and build word confidence.'
};
