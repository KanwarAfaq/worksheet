import {createHash} from 'node:crypto';

export type WorksheetFileType='pdf'|'docx'|'pptx';
export const acceptableTypes: Record<WorksheetFileType,string>={
  pdf:'application/pdf',
  docx:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  pptx:'application/vnd.openxmlformats-officedocument.presentationml.presentation'
};
export function checkWorksheetFile(filename:string,bytes:Uint8Array):{type:WorksheetFileType;mime:string;sha256:string} {
  const ext=filename.toLowerCase().split('.').pop()||'';
  if(!(ext in acceptableTypes))throw new Error('Only PDF, DOCX and PPTX files are supported.');
  const type=ext as WorksheetFileType;
  if(bytes.length<64)throw new Error('This file is too small to be a valid document.');
  const buffer=Buffer.from(bytes.buffer,bytes.byteOffset,bytes.byteLength);
  if(type==='pdf') {
    // PDF magic at byte zero; do not allow arbitrary file types renamed as PDF.
    if(!buffer.subarray(0,5).equals(Buffer.from('%PDF-')))throw new Error('The file is not a valid PDF.');
  } else {
    if(!buffer.subarray(0,4).equals(Buffer.from([0x50,0x4b,0x03,0x04])))
      throw new Error('The Office file must be a valid DOCX/PPTX ZIP container.');
    const required=type==='docx'?'word/document.xml':'ppt/presentation.xml';
    if(!buffer.includes(Buffer.from('[Content_Types].xml')) || !buffer.includes(Buffer.from(required)))
      throw new Error('This Office file does not contain the expected document structure.');
  }
  return {type,mime:acceptableTypes[type],sha256:createHash('sha256').update(buffer).digest('hex')};
}
export function safeDocumentFilename(type:WorksheetFileType,id:string):string {
  return 'worksheet-'+id.slice(0,8)+'.'+type;
}
