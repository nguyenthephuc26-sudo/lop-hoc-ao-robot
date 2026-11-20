/* Sách bài giảng: chuyển chương 1–6, hiện robot ở chương 4–6, nút "Thử trên robot", nút trợ lý nổi,
   hình kéo thả ánh xạ ở Chương 3 và phóng to hình minh họa. */

/* ---------- sách bài giảng: chuyển chương, nút "Thử trên robot", trợ lý nổi ---------- */
const LAB_CH={4:'fk',5:'ik',6:'jac'};
let curCh=0;
function renderMats(){document.querySelectorAll('.m[data-m]').forEach(el=>{const rows=el.dataset.m.split(';').map(r=>r.split(','));const t=el.dataset.t;
  el.classList.add('mat');el.innerHTML=(el.dataset.lbl?`<div class="lbl">${el.dataset.lbl}</div>`:'')+'<table>'+rows.map((r,i)=>'<tr>'+r.map((c,j)=>`<td class="${t?(i<3&&j<3?'r':(i<3&&j===3?'p':'')):'r'}">${c}</td>`).join('')+'</tr>').join('')+'</table>';});}
function goChapter(n,opt){n=Math.min(6,Math.max(1,+n||1));const keep=opt&&opt.keepScroll;curCh=n;curTab=LAB_CH[n]||'none';
  document.querySelectorAll('.chapnav button').forEach(b=>b.setAttribute('aria-current',+b.dataset.ch===n?'page':'false'));
  document.querySelectorAll('.lesson').forEach(a=>a.hidden=a.id!=='les'+n);
  const lab=!!LAB_CH[n];document.getElementById('lab').hidden=!lab;document.getElementById('book').classList.toggle('with-lab',lab);
  document.getElementById('fkPanel').hidden=curTab!=='fk';document.getElementById('ikPanel').hidden=curTab!=='ik';document.getElementById('jacPanel').hidden=curTab!=='jac';
  target.visible=curTab==='ik'&&sols.length>0;
  document.getElementById('seg').classList.toggle('on',lab);if(!keep){setMode('read',true);readY=0;}if(lab){resize();update();}
  if(!keep)window.scrollTo(0,0);
  if(location.hash!=='#chuong-'+n){try{history.replaceState(null,'','#chuong-'+n);}catch(e){}}
}
const isMob=()=>matchMedia('(max-width: 760px)').matches;let readY=0,labChanged=false;
function setMode(v,silent){const bk=document.getElementById('book');if(v==='lab'&&bk.classList.contains('m-read'))readY=window.scrollY;
  bk.classList.toggle('m-lab',v==='lab');bk.classList.toggle('m-read',v!=='lab');
  document.querySelectorAll('#seg button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.v===v?'true':'false'));
  if(silent)return;if(v==='lab'){requestAnimationFrame(()=>{resize();update();});if(isMob())window.scrollTo(0,0);}else if(isMob())window.scrollTo(0,readY);}
document.querySelectorAll('#seg button').forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.v)));
function showLabOnPhone(){if(isMob())setMode('lab');else if(matchMedia('(max-width: 960px)').matches)document.getElementById('lab').scrollIntoView({behavior:'smooth',block:'start'});}
{const _u=update;update=function(){labChanged=true;return _u.apply(this,arguments);};}
document.getElementById('btnDhEdit').addEventListener('click',e=>{const c=document.getElementById('dhCard');c.classList.toggle('edit');e.target.textContent=c.classList.contains('edit')?'Ẩn a, α, d':'Sửa a, α, d';});
function needLab(n){if(curTab!==LAB_CH[n])goChapter(n,{keepScroll:true});}
document.querySelectorAll('.chapnav button').forEach(b=>b.addEventListener('click',()=>{goChapter(b.dataset.ch);labChanged=false;}));
window.addEventListener('hashchange',()=>{const m=location.hash.match(/^#chuong-([1-6])$/);if(m&&+m[1]!==curCh)goChapter(m[1]);});
document.addEventListener('click',e=>{const b=e.target.closest('.try,.ask');if(!b)return;
  if(b.classList.contains('ask')){openChat();send(b.dataset.text||b.textContent);return;}
  if(b.dataset.preset){if(!LAB_CH[curCh])goChapter(4,{keepScroll:true});loadPreset(b.dataset.preset);showLabOnPhone();return;}
  if(b.dataset.q){if(!LAB_CH[curCh])goChapter(4,{keepScroll:true});if(!isAnthro())loadPreset('anthro');animateTo(b.dataset.q.split(',').map(Number));showLabOnPhone();return;}
  if(b.dataset.ik){const [x,y,z]=b.dataset.ik.split(',');if(!isAnthro())loadPreset('anthro');needLab(5);
    document.getElementById('px').value=x;document.getElementById('py').value=y;document.getElementById('pz').value=z;solveIK();showLabOnPhone();return;}
  if(b.dataset.act){needLab(6);document.getElementById({elbow:'btnSingElbow',shoulder:'btnSingShoulder',normal:'btnNormal'}[b.dataset.act]).click();showLabOnPhone();}
});
const fab=document.getElementById('fab'),chatBox=document.getElementById('chatPanel');
function openChat(){labChanged=false;chatBox.hidden=false;fab.setAttribute('aria-expanded','true');fab.classList.add('open');
  if(!matchMedia('(pointer: coarse)').matches)setTimeout(()=>document.getElementById('chatIn').focus({preventScroll:true}),30);}
function closeChat(){if(isMob()&&LAB_CH[curCh]&&labChanged)setMode('lab');chatBox.hidden=true;fab.setAttribute('aria-expanded','false');fab.classList.remove('open');}
fab.addEventListener('click',()=>chatBox.hidden?openChat():closeChat());
document.getElementById('chatClose').addEventListener('click',closeChat);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!chatBox.hidden)closeChat();});

/* ---- chương 3: hình kéo thả ánh xạ ᴬP = ᴬR_B·ᴮP + ᴬP_Borg, và phóng to hình ---- */
function initW2D(){const svg=document.getElementById('w_svg');if(!svg)return;
  const ids=['th','tx','ty','px','py'],inp={};ids.forEach(k=>inp[k]=document.getElementById('w_'+k));
  let O=[64,232],U=8.4;const NS='http://www.w3.org/2000/svg';
  const X=x=>O[0]+x*U,Y=y=>O[1]-y*U,f=v=>(Math.abs(v)<5e-4?0:v).toFixed(3).replace('.',',').replace('-','−'),g=v=>String(v).replace('.',',').replace('-','−');
  function el(t,a,txt){const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);if(txt!=null)e.textContent=txt;svg.appendChild(e);return e;}
  function lab(x,y,m,sub,col,bold){const t=el('text',{x,y,'font-size':12,fill:col,'font-weight':bold?700:400},m);if(sub){const ts=document.createElementNS(NS,'tspan');ts.setAttribute('font-size','9');ts.setAttribute('dy','3');ts.textContent=sub;t.appendChild(ts);}}
  function arrow(x1,y1,x2,y2,col,w,dash){el('line',{x1:X(x1),y1:Y(y1),x2:X(x2),y2:Y(y2),stroke:col,'stroke-width':w||2,'stroke-dasharray':dash||'','marker-end':'url(#wa_'+col.replace(/[^a-z]/g,'')+')'});}
  function draw(){const th=+inp.th.value,tx=+inp.tx.value,ty=+inp.ty.value,bx=+inp.px.value,by=+inp.py.value;
    document.getElementById('w_thv').textContent=th+'°';['tx','ty','px','py'].forEach(k=>document.getElementById('w_'+k+'v').textContent=g(inp[k].value));
    const c=Math.cos(th*Math.PI/180),s=Math.sin(th*Math.PI/180),rx=c*bx-s*by,ry=s*bx+c*by,ax=rx+tx,ay=ry+ty;
    const xs=[0,tx,ax],ys=[0,ty,ay];let x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);
    const span=Math.max(x1-x0,y1-y0,6),L=Math.max(1.2,span*0.2),pad=L+span*0.12;x0-=pad;x1+=pad;y0-=pad;y1+=pad;
    U=Math.min(340/(x1-x0),250/(y1-y0));O=[(340-(x1+x0)*U)/2,(250+(y1+y0)*U)/2];
    const step=U>28?1:U>12?2:5;
    svg.innerHTML='';const d=el('defs',{});
    [['var(--x)','x'],['var(--y)','y'],['var(--accent)','accent'],['var(--link)','link'],['var(--muted)','muted']].forEach(([col])=>{const m=document.createElementNS(NS,'marker');
      m.setAttribute('id','wa_'+col.replace(/[^a-z]/g,''));m.setAttribute('markerWidth','8');m.setAttribute('markerHeight','8');m.setAttribute('refX','7');m.setAttribute('refY','4');m.setAttribute('orient','auto');
      const p=document.createElementNS(NS,'path');p.setAttribute('d','M0,0 L8,4 L0,8 z');p.setAttribute('fill',col);m.appendChild(p);d.appendChild(m);});
    const gx0=Math.floor((0-O[0])/U),gx1=Math.ceil((340-O[0])/U),gy0=Math.floor((O[1]-250)/U),gy1=Math.ceil(O[1]/U);
    for(let i=gx0;i<=gx1;i++)if(i%step===0)el('line',{x1:X(i),y1:0,x2:X(i),y2:250,stroke:'var(--line)','stroke-width':i===0?1.2:0.6});
    for(let j=gy0;j<=gy1;j++)if(j%step===0)el('line',{x1:0,y1:Y(j),x2:340,y2:Y(j),stroke:'var(--line)','stroke-width':j===0?1.2:0.6});
    el('text',{x:334,y:244,'font-size':10,'text-anchor':'end',fill:'var(--muted)'},'ô lưới = '+step+' đơn vị');
    arrow(0,0,L,0,'var(--x)',2.4);arrow(0,0,0,L,'var(--y)',2.4);
    lab(X(L)+3,Y(0)+14,'x','A','var(--x)');lab(X(0)-18,Y(L)+4,'y','A','var(--y)');
    el('text',{x:X(0)-22,y:Y(0)+16,'font-size':11,'font-weight':700,fill:'var(--ink)'},'{A}');
    if(Math.hypot(tx,ty)>0.05)arrow(0,0,tx,ty,'var(--muted)',1.4,'4 3');
    arrow(tx,ty,tx+L*c,ty+L*s,'var(--x)',2);arrow(tx,ty,tx-L*s,ty+L*c,'var(--y)',2);
    lab(X(tx+1.18*L*c)-4,Y(ty+1.18*L*s)+4,'x','B','var(--x)');lab(X(tx-1.18*L*s)-4,Y(ty+1.18*L*c)+4,'y','B','var(--y)');
    el('text',{x:X(tx)+5,y:Y(ty)+14,'font-size':11,'font-weight':700,fill:'var(--ink)'},'{B}');
    if(Math.hypot(bx,by)>0.05)arrow(tx,ty,ax,ay,'var(--accent)',2.2);
    if(Math.hypot(ax,ay)>0.05)arrow(0,0,ax,ay,'var(--link)',1.6,'5 3');
    el('circle',{cx:X(ax),cy:Y(ay),r:5,fill:'var(--link)',stroke:'var(--panel)','stroke-width':1.5});
    el('text',{x:X(ax)+7,y:Y(ay)-6,'font-size':12,'font-weight':700,fill:'var(--ink)'},'P');
    document.getElementById('w_out').innerHTML=
      `ᴬR_B = R_Z(${th}°): c = ${f(c)}, s = ${f(s)}<br>`+
      `ᴬR_B·ᴮP = (${f(c)}×${g(bx)} − ${f(s)}×${g(by)}; ${f(s)}×${g(bx)} + ${f(c)}×${g(by)}) = (${f(rx)}; ${f(ry)})<br>`+
      `ᴬP = (${f(rx)} + ${g(tx)}; ${f(ry)} + ${g(ty)}) = <b>(${f(ax)}; ${f(ay)}; 0)</b>`+
      '';}
  ids.forEach(k=>inp[k].addEventListener('input',draw));
  document.addEventListener('click',e=>{const b=e.target.closest('.wtry');if(!b)return;const v=b.dataset.w.split(',');ids.forEach((k,i)=>inp[k].value=v[i]);draw();
    document.getElementById('w2d').scrollIntoView({behavior:'smooth',block:'center'});});
  draw();}
initW2D();
(function(){const z=document.createElement('div');z.className='zoom';z.hidden=true;z.innerHTML='<img alt="">';document.body.appendChild(z);
  document.addEventListener('click',e=>{const im=e.target.closest('.lesson img');if(im){z.firstChild.src=im.src;z.firstChild.alt=im.alt;z.hidden=false;return;}if(e.target.closest('.zoom'))z.hidden=true;});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')z.hidden=true;});})();
