'use client';
import {Printer} from 'lucide-react';
export default function PrintButton({label='Print worksheet'}:{label?:string}){
 return <button type="button" className="button button-dark" onClick={()=>window.print()}><Printer size={17}/> {label}</button>;
}
