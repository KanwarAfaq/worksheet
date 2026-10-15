import type {MetadataRoute} from 'next';
export default function manifest():MetadataRoute.Manifest{
 return {name:'Worksheet Studio — Free Printable Worksheets',short_name:'Worksheet Studio',
 description:'Create and browse free printable worksheets for Grades 1–6',
 start_url:'/',display:'browser',background_color:'#fff7e7',theme_color:'#173b34',
 icons:[{src:'/favicon.svg',sizes:'any',type:'image/svg+xml'}]};
}
