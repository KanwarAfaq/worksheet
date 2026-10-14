'use client';
import {useEffect} from 'react';
export default function SiteShell({children}:{children:React.ReactNode}){
 useEffect(()=>{
  const saved=localStorage.getItem('worksheet-theme');
  document.documentElement.dataset.theme=saved==='dark'?'dark':'light';
 },[]);
 return <>{children}</>;
}
