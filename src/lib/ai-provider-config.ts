/**
 * Worksheet Studio text inference providers.
 * Keep one registry for actual generation, model discovery and owner diagnostics.
 * Keys must remain server-only. Model names are account-dependent, not hard guarantees.
 */
export type TextProvider={
  name:'CGU Local'|'CGU Compatible'|'Groq'|'NVIDIA NIM';
  key:string;model:string;url:string;modelsUrl:string;
};
const cguUrl='https://air.cgu.edu.tw/cgullmapi/v1';
const groqUrl='https://api.groq.com/openai/v1';
const nvidiaUrl='https://integrate.api.nvidia.com/v1';
function selectedModel(configured:string|undefined,defaultModel:string,deprecated:string[],replacement:string):string{
 const model=configured?.trim()||defaultModel;
 // Automatically migrate exact retired defaults still set in Vercel.
 return deprecated.includes(model)?replacement:model;
}
export function textProviders():TextProvider[]{
 const cgu=process.env.CGU_API_KEY||'';
 return [
  {name:'CGU Compatible',key:cgu,model:process.env.CGU_COMPAT_MODEL?.trim()||'gpt-oss-120b',url:cguUrl+'/chat/completions',modelsUrl:cguUrl+'/models'},
  {name:'CGU Local',key:cgu,model:process.env.CGU_LOCAL_MODEL?.trim()||'gpt-oss:20b',url:cguUrl+'/chat/completions',modelsUrl:cguUrl+'/models'},
  {name:'Groq',key:process.env.GROQ_API_KEY||'',model:selectedModel(process.env.GROQ_MODEL,'openai/gpt-oss-120b',['llama-3.3-70b-versatile'],'openai/gpt-oss-120b'),url:groqUrl+'/chat/completions',modelsUrl:groqUrl+'/models'},
  {name:'NVIDIA NIM',key:process.env.NVIDIA_NIM_API_KEY||'',model:selectedModel(process.env.NVIDIA_NIM_MODEL,'nvidia/nemotron-3-super-120b-a12b',['meta/llama-3.3-70b-instruct'],'nvidia/nemotron-3-super-120b-a12b'),url:nvidiaUrl+'/chat/completions',modelsUrl:nvidiaUrl+'/models'}
 ];
}
type AnyRecord=Record<string,unknown>;
const record=(value:unknown):AnyRecord|null=>value&&typeof value==='object'&&!Array.isArray(value)?value as AnyRecord:null;
const nonempty=(value:unknown):string=>typeof value==='string'?value.trim():'';
function joinedContent(content:unknown):string{
 if(typeof content==='string')return content.trim();
 if(!Array.isArray(content))return '';
 return content.map(item=>typeof item==='string'?item:
  nonempty(record(item)?.text)||nonempty(record(item)?.content)).filter(Boolean).join(' ').trim();
}
/** Only output text, never raw API error objects, is returned to callers. */
export function providerReply(payload:unknown):string{
 const obj=record(payload);if(!obj)return '';
 const choices=obj.choices;
 if(Array.isArray(choices)){
  const first=record(choices[0]);
  const message=record(first?.message);
  return joinedContent(message?.content)||nonempty(first?.text);
 }
 if(nonempty(obj.output_text))return nonempty(obj.output_text);
 if(Array.isArray(obj.output)){
  return obj.output.map(part=>{
   const message=record(part);
   return joinedContent(message?.content)||nonempty(message?.text);
  }).filter(Boolean).join(' ').trim();
 }
 return '';
}
export function providerFinishReason(payload:unknown):string|null{
 const obj=record(payload),choices=obj?.choices;
 if(!Array.isArray(choices))return null;
 const reason=record(choices[0])?.finish_reason;
 return typeof reason==='string'?reason:null;
}
export function outputTokenCount(payload:unknown):number|null{
 const obj=record(payload),usage=record(obj?.usage);
 const tokens=usage?.completion_tokens??usage?.output_tokens;
 return typeof tokens==='number'&&Number.isFinite(tokens)?tokens:null;
}
