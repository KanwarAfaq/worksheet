import {requireContributor,json} from '@/lib/community-server';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function GET(request:Request){
 const a=await requireContributor(request);
 if(!a.ok)return json({error:'Sign in to check the worksheet AI providers'},a.status);
 return json({providers:[
  {name:'CGU Local',configured:!!process.env.CGU_API_KEY,model:process.env.CGU_LOCAL_MODEL||'gpt-oss:20b'},
  {name:'CGU Compatible',configured:!!process.env.CGU_API_KEY,model:process.env.CGU_COMPAT_MODEL||'gpt-oss-120b'},
  {name:'Groq',configured:!!process.env.GROQ_API_KEY,model:process.env.GROQ_MODEL||'llama-3.3-70b-versatile'},
  {name:'NVIDIA NIM',configured:!!process.env.NVIDIA_NIM_API_KEY,model:process.env.NVIDIA_NIM_MODEL||'meta/llama-3.3-70b-instruct'}
 ],note:'Configured means a server secret exists; it does not confirm that the provider is online or the model is authorized.'});
}
