/* Tìm kiếm BM25 trong bài giảng (data/corpus.js), dùng khi câu hỏi không có trong bộ câu hỏi soạn sẵn. */

/* ================= MỨC 2: TÌM TRONG BÀI GIẢNG (BM25, chạy trong trình duyệt) ================= */
const CH_NAME={1:'Chương 1 · Giới thiệu robot công nghiệp',2:'Chương 2 · Các thành phần của robot',3:'Chương 3 · Phép biến đổi không gian',4:'Chương 4 · Động học thuận',5:'Chương 5 · Động học ngược'};
const STOP=new Set('la gi cua va the nao co khong cac mot nhung duoc cho voi trong ve nay do thi de ra khi nhu bao nhieu tai sao vi hay toi ban minh oi a nhi a o day kia nhe ha hoi giai thich em anh chi thay can phai lam su cung da se dang rat qua neu ma vao len xuong tu den theo nen boi tren duoi giua sau truoc moi tung chi hon nhat dung muon biet xem'.split(' '));
const CORPUS=window.CORPUS;
function toks(t){return norm(t).replace(/[^a-z0-9 ]+/g,' ').split(' ').filter(Boolean);}
function terms(t){const w=toks(t),out=[];
  w.forEach((x,i)=>{if(!STOP.has(x)&&x.length>1)out.push(x);
    if(i<w.length-1&&!(STOP.has(x)&&STOP.has(w[i+1])))out.push(x+'_'+w[i+1]);});
  return out;}
const IDX=(()=>{const df=new Map();let tot=0;
  const docs=CORPUS.map(d=>{const tf=new Map();const ts=terms(d.t).concat(terms(d.h),terms(d.h));
    ts.forEach(x=>tf.set(x,(tf.get(x)||0)+1));tf.forEach((_,x)=>df.set(x,(df.get(x)||0)+1));tot+=ts.length;return {tf,len:ts.length};});
  return {docs,df,avg:tot/docs.length,N:docs.length};})();
function searchCorpus(q,k=3){
  const qt=[...new Set(terms(q))];if(!qt.length)return [];
  const extra=/(la gi|dinh nghia|nghia la|khai niem)/.test(norm(q))?['dinh_nghia','dinh','nghia']:[];
  const {docs,df,avg,N}=IDX,k1=1.4,b=0.7;
  const scored=docs.map((d,i)=>{let s=0,hitUni=0,hitBi=0;
    for(const t of qt.concat(extra)){const isX=extra.includes(t);const f=d.tf.get(t);if(!f)continue;const idf=Math.log(1+(N-df.get(t)+.5)/(df.get(t)+.5));
      s+=(isX?0.25:1)*(t.includes('_')?2:1)*idf*f*(k1+1)/(f+k1*(1-b+b*d.len/avg));if(isX)continue;if(t.includes('_'))hitBi++;else hitUni++;}
    return {i,s,hitUni,hitBi};}).filter(x=>x.s>0).sort((a,b)=>b.s-a.s);
  const nUni=qt.filter(t=>!t.includes('_')).length;
  return scored.filter(x=>x.s>=3.5&&(x.hitBi>0||x.hitUni>=Math.max(1,Math.ceil(nUni*0.75)))).slice(0,k).map(x=>({...CORPUS[x.i],score:x.s,q:qt}));
}
function highlight(text,qt){const set=new Set(qt.filter(t=>!t.includes('_')));
  return text.replace(/</g,'&lt;').replace(/[\p{L}\p{N}]+/gu,w=>set.has(norm(w))?`<mark>${w}</mark>`:w);}
function passageHTML(h){let body;
  if(h.t.length>460){const cut=h.t.slice(0,420).replace(/\s\S*$/,'');body=highlight(cut,h.q)+`<details><summary>Xem cả đoạn</summary>${highlight(h.t.slice(cut.length),h.q)}</details>`;}
  else body=highlight(h.t,h.q);
  return `<div class="psg"><div class="psg-src">${CH_NAME[h.c]}${h.h?' · mục '+h.h.replace(/</g,'&lt;'):''} · trang ${h.p}</div>${body}</div>`;}

