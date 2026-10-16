'use client';
import {useEffect,useState} from 'react';
import {FileText} from 'lucide-react';
import {supabaseBrowser} from '@/lib/supabase-browser';
type FileMeta={id:string;role:string;variant:string;upload_status?:string};
type Props={worksheetId:string;status:string;previewPage?:number;fileCount?:number};
/** Private first-party thumbnail, no public R2 object keys or URLs exposed. */
export default function MemberWorksheetThumbnail({worksheetId,status,previewPage=1,fileCount=0}:Props){
 const [resource,setResource]=useState<{url:string;format:string}|null>(null);
 useEffect(()=>{
  if(fileCount<1)return;
  let live=true;
  let url:string|null=null;
  async function load(){
   try{
    if(status==='published'){
     // Own published files can be viewed anonymously, without revealing R2 credentials.
     // Query file format through the user-only file list to select the real asset.
    }
    const {data:{session}}=await supabaseBrowser.auth.getSession();
    if(!session)return;
    const header={Authorization:'Bearer '+session.access_token};
    const root='/api/community/worksheets/'+encodeURIComponent(worksheetId)+'/files';
    const list=await fetch(root,{headers:header,cache:'no-store'});
    if(!list.ok)return;
    const response=await list.json() as {files?:FileMeta[]};
    const selected=response.files?.find(x=>x.role==='student'&&['pdf','png','jpg','webp'].includes(x.variant)&&
      (!x.upload_status||x.upload_status==='verified'));
    if(!selected)return;
    const imageResponse=await fetch(root+'/'+encodeURIComponent(selected.id)+'?preview=1',
      {headers:header,cache:'no-store'});
    if(!imageResponse.ok)return;
    const blob=await imageResponse.blob();
    if(!live)return;
    url=URL.createObjectURL(blob);
    setResource({url,format:selected.variant});
   }catch{}
  }
  void load();
  return()=>{live=false;if(url)URL.revokeObjectURL(url);};
 },[worksheetId,status,previewPage,fileCount]);
 if(!resource)return <div className="member-preview-empty"><FileText size={27}/></div>;
 return <span className="member-worksheet-thumb" aria-hidden="true">
  {resource.format==='pdf'?
    <iframe title="" tabIndex={-1}
      src={resource.url+'#page='+Math.max(1,previewPage)+'&toolbar=0&navpanes=0&view=FitH'}/>:
    <img src={resource.url} alt=""/>}
 </span>;
}
