import http from 'node:http';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
// Pre-challenge hosting setup, 2026-10-03. No AI requests are made.
const root=path.join(path.dirname(fileURLToPath(import.meta.url)),'dist');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.webmanifest':'application/manifest+json'};
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
 if(!['GET','HEAD'].includes(req.method)){
  res.setHeader('Allow','GET, HEAD');return reply(405,'Method not allowed');
 }
 let route;
 try{route=decodeURIComponent((req.url||'/').split('?')[0]);}catch{return reply(400,'Bad request');}
 if(route==='/healthz'){
  res.setHeader('Cache-Control','no-store');
  return reply(200,JSON.stringify({status:'ok',stage:'pre-challenge-hosting',aiEnabled:false}),'application/json');
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
