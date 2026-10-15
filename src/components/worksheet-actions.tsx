'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {Bookmark,Heart} from 'lucide-react';
import {supabaseBrowser} from '@/lib/supabase-browser';
export default function WorksheetActions({id}:{id:string}){
 const [ready,setReady]=useState(false);
 const [signedIn,setSignedIn]=useState(false);
 const [saved,setSaved]=useState(false);
 const [liked,setLiked]=useState(false);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 useEffect(()=>{
  let mounted=true;
  const load=async()=>{
   const {data:{session}}=await supabaseBrowser.auth.getSession();
   if(!mounted)return;
   setSignedIn(!!session);
   if(session){
    try{
     const response=await fetch('/api/account/collections',{headers:{Authorization:'Bearer '+session.access_token},cache:'no-store'});
     if(response.ok){const result=await response.json();if(mounted){setSaved((result.saved||[]).includes(id));setLiked((result.liked||[]).includes(id));}}
    }catch{}
   }
   if(mounted)setReady(true);
  };
  load();
  const {data:{subscription}}=supabaseBrowser.auth.onAuthStateChange(()=>load());
  return()=>{mounted=false;subscription.unsubscribe();};
 },[id]);
 const toggle=async(kind:'saved'|'liked')=>{
  if(busy)return;
  setBusy(true);setError('');
  const previous=kind==='saved'?saved:liked;
  try{
   const {data:{session}}=await supabaseBrowser.auth.getSession();
   if(!session)throw new Error('Sign in to save worksheets.');
   const response=await fetch('/api/account/collections',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+session.access_token},
    body:JSON.stringify({kind,id,active:!previous})});
   const result=await response.json();
   if(!response.ok)throw new Error(result.error||'Unable to update worksheet.');
   if(kind==='saved')setSaved(!previous);else setLiked(!previous);
  }catch(e){setError(e instanceof Error?e.message:'Unable to save.');}
  finally{setBusy(false);}
 };
 if(!ready)return null;
 if(!signedIn)return <Link href="/contribute" className="worksheet-action-login">Sign in to save or like</Link>;
 return <div className="worksheet-actions">
  <button type="button" disabled={busy} aria-pressed={saved} title={saved?'Remove from saved':'Save worksheet'} onClick={()=>toggle('saved')}><Bookmark size={16} fill={saved?'currentColor':'none'}/>{saved?'Saved':'Save'}</button>
  <button type="button" disabled={busy} aria-pressed={liked} title={liked?'Unlike worksheet':'Like worksheet'} onClick={()=>toggle('liked')}><Heart size={16} fill={liked?'currentColor':'none'}/>{liked?'Liked':'Like'}</button>
  {error&&<span className="worksheet-action-error" role="alert">{error}</span>}
 </div>;
}
