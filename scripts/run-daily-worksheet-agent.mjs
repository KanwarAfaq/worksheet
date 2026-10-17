/**
 * GitHub Actions scheduled 5-slot runner. Secret must be configured manually
 * under GitHub Actions secrets to match Vercel CRON_SECRET.
 * Each slot is idempotent and server does not publish worksheets.
 */
const secret=process.env.WORKSHEET_CRON_SECRET;
if(!secret){process.stderr.write('Missing GitHub Actions secret WORKSHEET_CRON_SECRET.\n');process.exit(1);}
const origin=(process.env.WORKSHEET_AGENT_URL||'https://worksheet.live').replace(/\/$/,'');
let failed=0;let made=0;let skipped=0;
for(let slot=1;slot<=5;slot++){
 let success=false;
 for(let attempt=1;attempt<=2&&!success;attempt++){
  try{
   const controller=AbortSignal.timeout(53000);
   const res=await fetch(origin+'/api/automation/generate?slot='+slot,{
    headers:{Authorization:'Bearer '+secret},signal:controller,cache:'no-store'
   });
   const body=await res.json();
   if(!res.ok||!body.enabled)throw new Error('HTTP '+res.status+' / '+(body.message||body.error||'disabled'));
   const {created=0,skipped=0:existing=0,failed:count=0,errors=[]}=body.generated||{};
   if(count||created+existing!==1)throw new Error('Generation failed: '+errors.join('; '));
   made+=created;skipped+=existing;success=true;
   process.stdout.write('Slot '+slot+': '+(created?'new private draft':'existing draft')+'\n');
  }catch(err){
   process.stderr.write('Slot '+slot+' attempt '+attempt+': '+String(err).slice(0,180)+'\n');
  }
 }
 if(!success)failed++;
}
process.stdout.write('Daily AI summary: new '+made+', existing '+skipped+', failed '+failed+'\n');
if(failed)process.exitCode=1;
