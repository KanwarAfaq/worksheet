import {ImageResponse} from 'next/og';
export const size={width:1200,height:630};
export const contentType='image/png';
export default function Image(){
 return new ImageResponse(
  <div style={{display:'flex',width:'100%',height:'100%',background:'#fff7e7',
   padding:75,flexDirection:'column',justifyContent:'center',position:'relative'}}>
   <div style={{fontSize:29,color:'#275644',fontWeight:700,marginBottom:40}}>◈ Worksheet Studio</div>
   <div style={{display:'flex',flexDirection:'column',fontSize:69,fontWeight:800,letterSpacing:-2,
    lineHeight:1.15,color:'#173c32',maxWidth:930}}>
    <span>Free printable worksheets.</span><span>Big learning moments.</span>
   </div>
   <div style={{marginTop:40,fontSize:27,color:'#6d7f6c'}}>Math · Reading · Spelling · Writing · Grades 1–6</div>
   <div style={{display:'flex',position:'absolute',right:-130,top:-100,width:460,height:460,
    borderRadius:230,background:'#efc891',opacity:.35}}/>
  </div>,size);
}
