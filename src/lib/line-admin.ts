/**
 * Best-effort operational LINE alerts. Never expose secrets to the browser.
 * Configure LINE_CHANNEL_ACCESS_TOKEN and LINE_ADMIN_USER_ID on the server.
 */
export async function notifyWorksheetAdmin(event:'worksheet_file_uploaded'|'worksheet_submitted'|'user_registered'|'worksheet_published'|'worksheet_unpublished'|'user_signed_in',details:{worksheetId:string;actorId:string;fileName?:string}):Promise<boolean>{
 const token=process.env.LINE_CHANNEL_ACCESS_TOKEN;
 const recipient=process.env.LINE_ADMIN_USER_ID;
 if(!token||!recipient)return false;
 const safeFile=(details.fileName||'').slice(0,100).replace(/[\r\n]/g,' ');
 const text=[
  '📚 Worksheet Studio · Admin alert',
  event==='worksheet_file_uploaded'?'📎 New worksheet file uploaded':event==='user_registered'?'👤 New user registered':event==='user_signed_in'?'🔐 User signed in':event==='worksheet_published'?'✅ Worksheet published':event==='worksheet_unpublished'?'📁 Worksheet unpublished':'📝 Worksheet submitted for review',
  'Worksheet: '+details.worksheetId,
  'User: '+details.actorId,
  ...(safeFile?['File: '+safeFile]:[]),
  'Review: '+(process.env.NEXT_PUBLIC_SITE_URL||'https://worksheet-tau-six.vercel.app')+'/admin'
 ].join('\n');
 try{
  const response=await fetch('https://api.line.me/v2/bot/message/push',{
   method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},
   body:JSON.stringify({to:recipient,messages:[{type:'text',text}]}),signal:AbortSignal.timeout(5000)
  });
  if(!response.ok){console.error('LINE admin notification failed:',response.status);return false;}
  return true;
 }catch(error){console.error('LINE admin notification unavailable:',error instanceof Error?error.message:'unknown');return false;}
}
