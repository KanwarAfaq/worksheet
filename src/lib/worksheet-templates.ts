export type TemplateType='tracing'|'word-search'|'scramble'|'missing';
export const worksheetTemplates:{id:TemplateType;name:string;description:string}[]=[
 {id:'tracing',name:'Letter tracing',description:'Dotted outlines with handwriting guide lines'},
 {id:'word-search',name:'Word search',description:'Find words hidden in a letter grid'},
 {id:'scramble',name:'Word scramble',description:'Rearrange mixed-up letters'},
 {id:'missing',name:'Missing letters',description:'Complete words with missing characters'}
];
export const worksheetSamples={
 Alphabet:['Aa','Bb','Cc','Dd','Ee','Ff','Gg','Hh','Ii','Jj','Kk','Ll','Mm','Nn','Oo','Pp','Qq','Rr','Ss','Tt','Uu','Vv','Ww','Xx','Yy','Zz'],
 Animals:['cat','dog','lion','tiger','zebra','rabbit','panda','horse'],
 Fruits:['apple','banana','orange','grape','mango','lemon','peach','pear'],
 Classroom:['book','pencil','paper','teacher','table','ruler','chair','eraser'],
 Nature:['tree','flower','river','cloud','sun','rain','leaf','mountain']
};
export function wordsFromInput(input:string):string[]{
 const words=input.split(/[\n,;]+/).map(s=>s.trim()).filter(Boolean).slice(0,26);
 if(words.length<3)throw new Error('Enter at least three words or letters.');
 if(words.some(w=>w.length>22||!/^[a-zA-Z -]+$/.test(w)))throw new Error('Use English words of at most 22 characters.');
 return [...new Set(words)];
}
export function shuffleWord(word:string,seed:number):string{
 if(word.length<2)return word;
 const chars=word.split(''),rot=seed%word.length;
 const shifted=[...chars.slice(rot),...chars.slice(0,rot)].reverse().join('');
 return shifted.toLowerCase()===word.toLowerCase()?word.split('').reverse().join(''):shifted;
}
