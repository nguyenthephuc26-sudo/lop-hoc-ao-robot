/* Bộ não của trợ lý: nhận lệnh điều khiển (tới điểm, xoay khớp, home, tính T, jacobian) rồi gọi động học;
   câu hỏi lý thuyết thì trả lời thẳng từ bộ câu hỏi soạn sẵn. */

const chatLog=document.getElementById('chatLog');
function say(html,who){const d=document.createElement('div');d.className='bub '+(who||'bot');d.innerHTML=html;chatLog.appendChild(d);chatLog.scrollTop=(who==='me')?chatLog.scrollHeight:Math.max(0,d.offsetTop-chatLog.offsetTop-48);return d;}
const HELP=`Bạn có thể:<ul>
<li><b>Hỏi lý thuyết</b> chương 1–6, ví dụ "bậc tự do là gì", "vì sao dùng atan2", "điểm kỳ dị là gì".</li>
<li><b>Ra lệnh cho robot</b>: "đưa tay tới (0,3; 0,2; 0,5)", "góc 30 45 -60", "khớp 2 thêm 30 độ", "về home", "tính ⁰T₃", "tính jacobian".</li></ul>Gõ <i>"danh sách câu hỏi"</i> để xem các câu mình trả lời được.`;

function chooseNice(){let best=0,bs=-1;sols.forEach((s,i)=>{const sc=(s.floor?0:4)+(s.name.includes('hướng tới')?2:0)+(s.name.includes('trên')?1:0);if(sc>bs){bs=sc;best=i;}});return best;}
function solList(){return sols.map((s,i)=>`<b>${i+1}.</b> ${s.name}: θ = (${s.q.map(v=>v.toFixed(1)).join('°, ')}°)${s.floor?' <span style="color:var(--bad)">· xuyên sàn</span>':''}`).join('<br>');}
function curT(){return fk(goalQ());}

let FAQ_T=null,FAQ_DF=null;
function faqMatch(raw){const n=norm(raw);
  if(!FAQ_T){FAQ_T=KB.map(e=>new Set(terms(e.q)));FAQ_DF=new Map();FAQ_T.forEach(st=>st.forEach(t=>FAQ_DF.set(t,(FAQ_DF.get(t)||0)+1)));}
  const qt=[...new Set(terms(raw))];let best=null,bs=0;
  KB.forEach((e,i)=>{let sc=0;
    for(const k of e.k){const re=new RegExp('(^|[^a-z0-9])'+k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'([^a-z0-9]|$)');if(re.test(n))sc+=2+k.split(' ').length;}
    for(const t of qt)if(FAQ_T[i].has(t))sc+=(t.includes('_')?1.2:0.6)*Math.log(1+KB.length/FAQ_DF.get(t));
    if(sc>bs){bs=sc;best=e;}});
  return bs>=2.5?best:null;}
function reply(raw){
  const n=norm(raw),v=nums(raw);
  if(/^(xin chao|chao|hello|hi)\b/.test(n))return 'Chào bạn! '+HELP;
  if(/(ban lam duoc gi|huong dan|help|tro giup|cac lenh|dung the nao)/.test(n))return HELP;
  if(/(home|vi tri ban dau|ve 0\b|duoi thang|reset)/.test(n)){if(!LAB_CH[curCh])goChapter(4,{keepScroll:true});animateTo([0,0,0]);return 'Đưa cánh tay về home θ = (0°, 0°, 0°). Cánh tay duỗi thẳng nằm ngang theo trục x₀, đầu tay ở p = (0,7; 0; 0,3).';}
  // chọn nghiệm k
  let m=n.match(/(?:chon )?nghiem (?:so )?([1-4])/);
  if(m&&sols.length){const i=+m[1]-1;needLab(5);pick(i);return `Chạy tới nghiệm ${i+1}: ${sols[i].name}, θ = (${sols[i].q.map(x=>x.toFixed(1)).join('°, ')}°).`;}
  if(/(cac nghiem|nghiem khac|tat ca nghiem|liet ke nghiem)/.test(n)){
    if(!sols.length)return 'Chưa có điểm đích nào. Gõ thử <i>"tới (0,3; 0,2; 0,5)"</i> trước nhé.';
    return 'Các nghiệm của điểm vừa rồi:<br>'+solList()+'<br>Gõ <i>"chọn nghiệm 2"</i> để xem cánh tay chạy tới nghiệm đó.';}
  // tới điểm (IK)
  if(v.length>=3&&/(toi|den|di chuyen|dua tay|dua dau tay|diem|vi tri|ik|dong hoc nguoc|cham)/.test(n)&&!/(goc|theta|khop)/.test(n)){
    const [x,y,z]=v.slice(-3);
    if(!isAnthro())loadPreset('anthro');
    document.getElementById('px').value=x;document.getElementById('py').value=y;document.getElementById('pz').value=z;
    solveIK();needLab(5);
    if(!sols.length)return `Không tới được điểm (${x}; ${y}; ${z}). `+document.getElementById('ikMsg').textContent;
    const i=chooseNice();pick(i);
    const zp=z-dh[0].d,c3=(x*x+y*y+zp*zp-dh[1].a**2-dh[2].a**2)/(2*dh[1].a*dh[2].a);
    return `Giải động học ngược cho p = (${x}; ${y}; ${z}):<br>p'_z = ${zp.toFixed(3)}, c₃ = ${c3.toFixed(4)} ⇒ θ₃ = ±${(Math.acos(Math.max(-1,Math.min(1,c3)))/D).toFixed(2)}°<br>
    Có <b>${sols.length} nghiệm</b>. Mình chọn <b>nghiệm ${i+1} (${sols[i].name})</b>: θ = (${sols[i].q.map(q=>q.toFixed(1)).join('°, ')}°).<br>
    Gõ <i>"các nghiệm"</i> để xem đủ. Các bước giải nằm ở bảng Chương 5.`;}
  // một khớp
  m=n.match(/(?:khop|theta|q|θ)\s*([123])\b(.*)/)||raw.toLowerCase().match(/θ\s*([123₁₂₃])(.*)/);
  if(m){const j=({'₁':1,'₂':2,'₃':3})[m[1]]||+m[1];const rest=norm(m[2]);const rv=nums(m[2]);
    if(rv.length){let val=rv[0];const q=goalQ();
      if(/(them|cong|tang|\+)/.test(rest))q[j-1]+=val;else if(/(bot|giam|tru|lui)/.test(rest))q[j-1]-=Math.abs(val);else q[j-1]=val;
      q[j-1]=wrap(q[j-1]);if(!LAB_CH[curCh])goChapter(4,{keepScroll:true});animateTo(q);
      return `Đặt θ${'₀₁₂₃'[j]} = ${q[j-1].toFixed(1)}°. Tư thế mới θ = (${q.map(x=>x.toFixed(0)).join('°, ')}°). Gõ <i>"tính ⁰T₃"</i> để xem ma trận.`;}}
  // ba góc (FK)
  if(v.length>=3&&/(goc|theta|fk|dong hoc thuan|khop|q =|q=)/.test(n)){
    const q=v.slice(-3).map(wrap);if(!LAB_CH[curCh])goChapter(4,{keepScroll:true});animateTo(q);const T=fk(q).Ts[3];
    return `Động học thuận với θ = (${q.join('°, ')}°):`+'<div class="mat">'+matHTML(T,'⁰T₃ = ⁰A₁·¹A₂·²A₃')+'</div>'+`Đầu tay ở p = (${f(T[0][3])}; ${f(T[1][3])}; ${f(T[2][3])}) m.`;}
  // ma trận A_i
  m=n.match(/(?:ma tran\s*)?\ba\s*([123])\b/);
  if(m&&/(ma tran|tinh|xem|cho)/.test(n)){const i=+m[1];const {As}=curT();
    return `Ở tư thế hiện tại (θ${'₀₁₂₃'[i]} = ${goalQ()[i-1].toFixed(0)}°, a = ${dh[i-1].a}, α = ${dh[i-1].al}°, d = ${dh[i-1].d}):`+'<div class="mat">'+matHTML(As[i-1],`${'⁰¹²'[i-1]}A${'₀₁₂₃'[i]}`)+'</div>';}
  if(/(t03|0t3|t3|ma tran t\b|tinh t\b|tinh ma tran|ma tran bien doi hien tai|dau tay (dang )?o dau|vi tri dau tay|toa do dau tay)/.test(n)||/⁰T₃/.test(raw)){
    const {Ts}=curT();const T=Ts[3];
    return `Tư thế hiện tại θ = (${goalQ().map(x=>x.toFixed(0)).join('°, ')}°):`+'<div class="mat">'+matHTML(T,'⁰T₃')+'</div>'+`Đầu tay ở p = (${f(T[0][3])}; ${f(T[1][3])}; ${f(T[2][3])}) m. Cột 3 của R (hướng z₃) = (${f(T[0][2])}; ${f(T[1][2])}; ${f(T[2][2])}).`;}
  // Jacobian ở tư thế hiện tại
  if(/(tinh jacobian|jacobian hien tai|ma tran j\b|tinh j\b|det j|dinh thuc j|xem jacobian)/.test(n)){
    needLab(6);const {Ts}=curT();const J=jacobian(Ts);const d=det3(J.slice(0,3));
    return `Jacobian ở tư thế θ = (${goalQ().map(x=>x.toFixed(0)).join('°, ')}°):<div class="mat">${genMat(J,['p','p','p','r','r','r'],'J = [J_P ; J_O]')}</div>det(J_P) = ${d.toFixed(5)} ${Math.abs(d)<2e-4?'<span class="pill bad">kỳ dị</span>':''}. Mũi tên vận tốc hiện trên mô hình 3D.`;}
  // lệnh tìm thẳng trong bài giảng
  m=raw.match(/^\s*(tìm|tim|tra cứu|tra cuu|search)\s*:?\s+(.+)/i);
  if(m){const h=searchCorpus(m[2],5);return h.length?`Kết quả tìm “${m[2].replace(/</g,'&lt;')}” trong bài giảng:`+h.map(passageHTML).join(''):'Không tìm thấy đoạn nào khớp trong bài giảng.';}
  // hỏi lý thuyết: trả lời thẳng từ bộ câu hỏi soạn sẵn
  if(/(danh sach cau hoi|tat ca cau hoi|cau hoi mau|goi y cau hoi)/.test(n))
    return 'Bạn có thể hỏi các câu sau (bấm để hỏi):<div class="asklist">'+KB.map(e=>`<button class="ask" type="button">${e.q}</button>`).join('')+'</div>';
  const fq=faqMatch(raw);
  if(fq)return fq.a;
  const hits=searchCorpus(raw,1);
  if(hits.length){let t=hits[0].t;if(t.length>520){t=t.slice(0,520);t=t.slice(0,Math.max(t.lastIndexOf('. ')+1,300))+'…';}return 'Theo bài giảng: '+t.replace(/</g,'&lt;');}
  const pick3=KB.slice().sort(()=>Math.random()-.5).slice(0,3);
  return 'Mình chưa có câu trả lời cho câu này. Bạn thử hỏi:<div class="asklist">'+pick3.map(e=>`<button class="ask" type="button">${e.q}</button>`).join('')+'<button class="ask" type="button" data-text="danh sách câu hỏi">Xem tất cả câu hỏi</button></div>';
}
function send(text){text=(text||'').trim();if(!text)return;say(text.replace(/</g,'&lt;'),'me');
  try{say(reply(text));}catch(e){say('Có lỗi khi xử lý câu này: '+e.message);}}
document.getElementById('chatForm').addEventListener('submit',e=>{e.preventDefault();const i=document.getElementById('chatIn');send(i.value);i.value='';});
document.querySelectorAll('#chips button').forEach(b=>b.addEventListener('click',()=>send(b.textContent)));
say('Chào bạn! '+HELP);

