let cachedIndex;

const normalize=value=>String(value||'').normalize('NFKC').replace(/[\u200B-\u200D\uFEFF]/g,'').toLocaleLowerCase();
const textFrom=value=>Array.isArray(value)?value.map(textFrom).join(' '):typeof value==='string'?value:value?.text||'';

async function getIndex(){
  if(cachedIndex)return cachedIndex;
  const response=await fetch('https://bible.helloao.org/api/npi_ulb/complete.json');
  if(!response.ok)throw new Error('Bible index unavailable');
  const data=await response.json();
  cachedIndex=data.books.flatMap(book=>book.chapters.flatMap(entry=>{
    const chapter=entry.chapter;
    return (chapter.content||[]).filter(item=>item.type==='verse').map(item=>({
      book:book.id,bookName:book.name,chapter:chapter.number,verse:item.number,
      text:textFrom(item.content).replace(/\s+/g,' ').trim()
    }));
  }));
  return cachedIndex;
}

export default async function handler(req,res){
  res.setHeader('Cache-Control','s-maxage=3600, stale-while-revalidate=86400');
  const raw=String(req.query.q||'').trim().slice(0,100);
  if(raw.length<2)return res.status(200).json({query:raw,total:0,results:[]});
  try{
    const index=await getIndex();
    const query=normalize(raw);
    const terms=query.split(/\s+/).filter(Boolean);
    const results=[];
    for(const item of index){
      const haystack=normalize(`${item.bookName} ${item.chapter}:${item.verse} ${item.text}`);
      if(terms.every(term=>haystack.includes(term))){
        const exactReference=normalize(`${item.bookName} ${item.chapter}:${item.verse}`)===query;
        if(exactReference)results.unshift(item);else results.push(item);
        if(results.length===60)break;
      }
    }
    res.status(200).json({query:raw,total:results.length,results});
  }catch{res.status(502).json({error:'Search is temporarily unavailable.'});}
}
