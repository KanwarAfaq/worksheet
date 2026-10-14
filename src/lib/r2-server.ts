import 'server-only';
import {S3Client} from '@aws-sdk/client-s3';

export const MAX_UPLOAD_BYTES=3_000_000; // Below Vercel's 4.5 MB function request-body cap.
export function r2Configured():boolean {
  return !!(process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY && process.env.R2_BUCKET);
}
export function r2Bucket():string {
  if(!r2Configured())throw new Error('Private R2 storage is not configured.');
  return process.env.R2_BUCKET!;
}
export function r2Client():S3Client {
  if(!r2Configured())throw new Error('Private R2 storage is not configured.');
  const account=process.env.R2_ACCOUNT_ID!;
  if(!/^[a-zA-Z0-9]{16,64}$/.test(account))throw new Error('Invalid R2 account configuration.');
  return new S3Client({
    region:'auto',
    endpoint:'https://'+account+'.r2.cloudflarestorage.com',
    credentials:{
      accessKeyId:process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey:process.env.R2_SECRET_ACCESS_KEY!
    },
    forcePathStyle:true,
    maxAttempts:2
  });
}
