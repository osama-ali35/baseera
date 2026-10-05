import http from 'node:http';
import { analyse, FeedbackError } from './feedback.mjs';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
// Challenge development: 2026-10-04. AI endpoint is opt-in via server environment.
const aiConfigured=process.env.BASEERA_AI_ENABLED==='true' && Boolean(process.env.OPENAI_API_KEY);
let active=0, used=0, windowStart=Date.now();
const hourlyLimit=Number(process.env.BASEERA_AI_HOURLY_LIMIT||30);
if(!Number.isInteger(hourlyLimit)||hourlyLimit<1||hourlyLimit>500)throw Error('Invalid hourly limit');
const root=path.join(path.dirname(fileURLToPath(import.meta.url)),'dist');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.mp3':'audio/mpeg','.webmanifest':'application/manifest+json'};
const assets=new Map();
async function collect(dir,prefix='') {
 for(const item of await readdir(dir,{withFileTypes:true})) {
  if(item.name.startsWith('.'))continue;
  const name=prefix+item.name;
  if(item.isDirectory())await collect(path.join(dir,item.name),name+'/');
  else if(item.isFile()&&types[path.extname(name)])assets.set('/'+name,{file:path.join(dir,item.name),type:types[path.extname(name)]});
 }
}
await collect(root);
if(!assets.has('/index.html'))throw Error('Missing dist/index.html');
assets.set('/',assets.get('/index.html'));
const server=http.createServer(async(req,res)=>{
 res.setHeader('X-Content-Type-Options','nosniff');
 res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');
 res.setHeader('Cache-Control','no-cache');
 const reply=(status,body,type='text/plain; charset=utf-8')=>{
  res.writeHead(status,{'Content-Type':type});res.end(req.method==='HEAD'?undefined:body);
 };
 if(req.url==='/api/feedback' && req.method==='POST'){
  res.setHeader('Cache-Control','no-store');
  const json=(status,data)=>reply(status,JSON.stringify(data),'application/json');
  const origin=req.headers.origin;
  if(origin && origin!==`https://${req.headers.host}` && origin!==`http://${req.headers.host}`)return json(403,{error:'Cross-origin requests are not allowed.'});
  if(!req.headers['content-type']?.startsWith('application/json'))return json(415,{error:'JSON is required.'});
  if(!aiConfigured)return json(503,{error:'AI feedback is not configured. Use the reference explanation.'});
  if(Date.now()-windowStart>3600000){used=0;windowStart=Date.now();}
  if(used>=hourlyLimit || active>=3)return json(429,{error:'The pilot request limit has been reached. Try later.'});
  active++;
  try{
   const chunks=[];let bytes=0;
   for await(const chunk of req){bytes+=chunk.length;if(bytes>8192)throw new FeedbackError(413,'Answer request is too large.');chunks.push(chunk);}
   let data;try{data=JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{throw new FeedbackError(400,'Invalid JSON.');}
   used++;
   return json(200,await analyse(data,{apiKey:process.env.OPENAI_API_KEY,model:process.env.OPENAI_MODEL||'gpt-4.1-mini'}));
  }catch(e){return json(e instanceof FeedbackError?e.status:502,{error:e instanceof FeedbackError?e.message:'AI feedback is unavailable. Use the reference explanation.'});}
  finally{active--;}
 }
 if(!['GET','HEAD'].includes(req.method)){
  res.setHeader('Allow','GET, HEAD');return reply(405,'Method not allowed');
 }
 let route;
 try{route=decodeURIComponent((req.url||'/').split('?')[0]);}catch{return reply(400,'Bad request');}
 if(route==='/healthz'){
  res.setHeader('Cache-Control','no-store');
  return reply(200,JSON.stringify({status:'ok',stage:'challenge-salah-pilot',aiConfigured,liveValidation:'not-recorded'}),'application/json');
 }
 // Only public assets are served. Never serve repository files or environment values.
 const asset=assets.get(route);if(!asset)return reply(404,'Not found');
 try{reply(200,await readFile(asset.file),asset.type);}catch{reply(500,'Unable to load asset');}
});
server.requestTimeout=15000;server.headersTimeout=10000;
const port=Number(process.env.PORT||3000);
if(!Number.isInteger(port)||port<1||port>65535)throw Error('Invalid PORT');
server.listen(port,'0.0.0.0',()=>console.log(`Baseera hosting server listening on port ${port}`));
for(const signal of ['SIGTERM','SIGINT'])process.on(signal,()=>{
 server.close(()=>process.exit(0));setTimeout(()=>process.exit(1),5000).unref();
});
