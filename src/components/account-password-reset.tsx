'use client';
import {useEffect,useState,type FormEvent} from 'react';
import Link from 'next/link';
import {supabaseBrowser} from '@/lib/supabase-browser';

export default function AccountPasswordReset(){
 const [ready,setReady]=useState(false);
 const [password,setPassword]=useState('');
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState('');
 const [error,setError]=useState('');
 useEffect(()=>{
  let mounted=true;
  supabaseBrowser.auth.getSession().then(({data})=>{if(mounted)setReady(!!data.session);});
  const {data:{subscription}}=supabaseBrowser.auth.onAuthStateChange((_event,session)=>{if(mounted)setReady(!!session);});
  return()=>{mounted=false;subscription.unsubscribe();};
 },[]);
 async function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();setBusy(true);setError('');setMessage('');
  try{
   const {error}=await supabaseBrowser.auth.updateUser({password});
   if(error)throw error;
   setPassword('');setMessage('Password updated. You may return to your Worksheet Studio account.');
  }catch(e){setError(e instanceof Error?e.message:'Password reset failed.');}
  finally{setBusy(false);}
 }
 return <section className="container inner-page prose-page">
  <h1>Reset your password</h1>
  {!ready?<p>Open this page using the recovery link sent to your email. If it has expired, request a new link from your account sign-in.</p>:
  <form onSubmit={submit} className="auth-otp-form">
   <label htmlFor="new-account-password">New password (12 characters minimum)</label>
   <input id="new-account-password" type="password" required minLength={12} autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)}/>
   <button type="submit" className="button button-dark" disabled={busy}>{busy?'Updating…':'Update password'}</button>
  </form>}
  {error&&<p role="alert">{error}</p>}{message&&<p role="status">{message}</p>}
  <p><Link href="/contribute">Return to your account</Link></p>
 </section>;
}
