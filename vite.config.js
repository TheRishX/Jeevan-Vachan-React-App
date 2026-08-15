import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

function bibleApi(){
  return {name:'bible-api-dev',configureServer(server){
    server.middlewares.use('/api/bible',async(req,res)=>{
      try{
        const url=new URL(req.url,'http://localhost');
        const book=(url.searchParams.get('book')||'JHN').toUpperCase();
        const chapter=Math.max(1,Number(url.searchParams.get('chapter'))||3);
        const response=await fetch(`https://bible.helloao.org/api/npi_ulb/${book}/${chapter}.json`);
        if(!response.ok)throw new Error();
        const data=await response.json();
        const verses=(data.chapter?.content||[]).flatMap(item=>item.type==='verse'?[{verse:item.number,text:(item.content||[]).filter(x=>typeof x==='string').join(' ')}]:[]);
        res.statusCode=200;res.setHeader('Content-Type','application/json');res.end(JSON.stringify({reference:`${data.book?.name||book} ${chapter}`,translation:'पवित्र बाइबल — Nepali ULB',verses}));
      }catch{res.statusCode=502;res.end(JSON.stringify({error:'Bible service unavailable'}));}
    });
  }};
}
function bibleSearch(){
  let index;
  const normalize=value=>String(value||'').normalize('NFKC').replace(/[\u200B-\u200D\uFEFF]/g,'').toLocaleLowerCase();
  const textFrom=value=>Array.isArray(value)?value.map(textFrom).join(' '):typeof value==='string'?value:value?.text||'';
  return {name:'bible-search-dev',configureServer(server){server.middlewares.use('/api/search',async(req,res)=>{try{
    const url=new URL(req.url,'http://localhost');const raw=String(url.searchParams.get('q')||'').trim().slice(0,100);
    if(raw.length<2){res.setHeader('Content-Type','application/json');return res.end(JSON.stringify({query:raw,total:0,results:[]}));}
    if(!index){const response=await fetch('https://bible.helloao.org/api/npi_ulb/complete.json');if(!response.ok)throw new Error();const data=await response.json();index=data.books.flatMap(book=>book.chapters.flatMap(entry=>(entry.chapter.content||[]).filter(item=>item.type==='verse').map(item=>({book:book.id,bookName:book.name,chapter:entry.chapter.number,verse:item.number,text:textFrom(item.content).replace(/\s+/g,' ').trim()}))));}
    const query=normalize(raw);const terms=query.split(/\s+/).filter(Boolean);const results=[];for(const item of index){const haystack=normalize(`${item.bookName} ${item.chapter}:${item.verse} ${item.text}`);if(terms.every(term=>haystack.includes(term))){const exactReference=normalize(`${item.bookName} ${item.chapter}:${item.verse}`)===query;if(exactReference)results.unshift(item);else results.push(item);if(results.length===60)break;}}
    res.setHeader('Content-Type','application/json');res.end(JSON.stringify({query:raw,total:results.length,results}));
  }catch{res.statusCode=502;res.end(JSON.stringify({error:'Search is temporarily unavailable.'}));}});}};
}
export default defineConfig({plugins:[react(),bibleApi(),bibleSearch()]});
