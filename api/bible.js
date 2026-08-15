const flatten=content=>content.flatMap(item=>item.type==='verse'?[{verse:item.number,text:(item.content||[]).filter(x=>typeof x==='string').join(' ')}]:[]);
export default async function handler(req,res){
  res.setHeader('Cache-Control','s-maxage=86400, stale-while-revalidate=604800');
  const book=String(req.query.book||'JHN').toUpperCase().slice(0,3);
  const chapter=Math.max(1,Math.min(150,Number(req.query.chapter)||3));
  try{
    const response=await fetch(`https://bible.helloao.org/api/npi_ulb/${book}/${chapter}.json`);
    if(!response.ok) throw new Error('Passage unavailable');
    const data=await response.json();
    res.status(200).json({reference:`${data.book?.name||book} ${chapter}`,translation:'पवित्र बाइबल — Nepali ULB',verses:flatten(data.chapter?.content||[])});
  }catch(error){res.status(502).json({error:'Unable to load this passage right now.'});}
}
