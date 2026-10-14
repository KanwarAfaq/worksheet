import {createHash} from 'node:crypto';

/** Safe downloadable worksheet types. Executables, HTML, SVG, ZIP and macro-enabled Office files are rejected. */
export type WorksheetFileType = 'pdf'|'docx'|'pptx'|'png'|'jpg'|'webp';
export const acceptableTypes:Record<WorksheetFileType,string>={
 pdf:'application/pdf',
 docx:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
 pptx:'application/vnd.openxmlformats-officedocument.presentationml.presentation',
 png:'image/png',
 jpg:'image/jpeg',
 webp:'image/webp'
};
export const previewableTypes:WorksheetFileType[]=['pdf','png','jpg','webp'];
export function checkWorksheetFile(filename:string, bytes:Uint8Array):{type:WorksheetFileType;mime:string;sha256:string}{
 const extension=filename.split('.').pop()?.toLowerCase()==='jpeg'?'jpg':filename.split('.').pop()?.toLowerCase()||'';
 if(!(extension in acceptableTypes))throw new Error('Supported files: PDF, Word (.docx), PowerPoint (.pptx), PNG, JPG and WebP.');
 const type=extension as WorksheetFileType;
 if(bytes.length<64)throw new Error('The selected file is too small to be a valid worksheet.');
 const b=Buffer.from(bytes.buffer,bytes.byteOffset,bytes.byteLength);
 if(type==='pdf'&&!b.subarray(0,5).equals(Buffer.from('%PDF-')))throw new Error('Invalid PDF document.');
 if(type==='docx'||type==='pptx'){
   const required=type==='docx'?'word/document.xml':'ppt/presentation.xml';
   if(!b.subarray(0,4).equals(Buffer.from([0x50,0x4b,0x03,0x04]))
     ||!b.includes(Buffer.from('[Content_Types].xml'))||!b.includes(Buffer.from(required)))
       throw new Error('The selected Office file does not match its file extension.');
 }
 if(type==='png'&&!b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))
   throw new Error('Invalid PNG image.');
 if(type==='jpg'&&!b.subarray(0,3).equals(Buffer.from([255,216,255])))
   throw new Error('Invalid JPG image.');
 if(type==='webp'&&!(b.subarray(0,4).toString()==='RIFF'&&b.subarray(8,12).toString()==='WEBP'))
   throw new Error('Invalid WebP image.');
 return {type,mime:acceptableTypes[type],sha256:createHash('sha256').update(b).digest('hex')};
}
export function safeDocumentFilename(type:WorksheetFileType,id:string):string{
 return 'worksheet-'+id.slice(0,8)+'.'+type;
}
