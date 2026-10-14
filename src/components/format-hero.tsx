import Link from 'next/link';
import {FileText,FilePenLine,Presentation,ArrowUpRight} from 'lucide-react';
const files=[
 {title:'PDF',subtitle:'Print-ready worksheets',href:'/worksheets?format=pdf',icon:FileText,tone:'format-pdf',extension:'.PDF'},
 {title:'Word',subtitle:'Editable DOCX activities',href:'/worksheets?format=docx',icon:FilePenLine,tone:'format-word',extension:'.DOCX'},
 {title:'PowerPoint',subtitle:'PPTX classroom activities',href:'/worksheets?format=pptx',icon:Presentation,tone:'format-ppt',extension:'.PPTX'}
];
export default function FormatHero(){
 return <section className="format-hero" aria-label="Choose your worksheet file format">
  <div className="container">
   <div className="format-hero-heading"><div className="section-kicker">CHOOSE YOUR FORMAT</div><h2>Worksheets in the format <em>you love.</em></h2><p>Explore PDF, Word and PowerPoint options for your classroom or home.</p></div>
   <div className="format-hero-grid">{files.map(file=><Link href={file.href} key={file.title} className={'format-choice '+file.tone}>
    <span className="format-file-icon"><file.icon size={56} strokeWidth={1.6}/><small>{file.extension}</small></span>
    <span className="format-choice-copy"><strong>{file.title}</strong><span>{file.subtitle}</span><em>Browse format <ArrowUpRight size={16}/></em></span>
   </Link>)}</div>
   <p className="format-release-note">The downloadable library is being prepared. PDF generation is already available in the free worksheet makers.</p>
  </div>
 </section>;
}
