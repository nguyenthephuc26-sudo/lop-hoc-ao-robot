/* Bảng D-H có slider, hiển thị ⁰A₁, ¹A₂, ²A₃, ⁰T₃ cập nhật trực tiếp, và hiệu ứng chuyển động. */

/* ---------- bảng D-H ---------- */
const body=document.getElementById('dhBody');
function buildTable(){
  body.innerHTML='';
  dh.forEach((r,i)=>{const tr=document.createElement('tr');
    tr.innerHTML=`<td>${i+1}</td>
    <td><input id="a${i}" type="number" step="0.05" value="${r.a}" aria-label="a${i+1}"></td>
    <td><input id="al${i}" type="number" step="15" value="${r.al}" aria-label="alpha${i+1}"></td>
    <td><input id="d${i}" type="number" step="0.05" value="${r.d}" aria-label="d${i+1}"></td>
    <td class="var"><div class="theta"><input id="th${i}" type="range" min="-180" max="180" step="1" value="${r.th}" aria-label="theta${i+1}"><output id="tho${i}">${r.th}°</output></div></td>`;
    body.appendChild(tr);
    ['a','al','d'].forEach(k=>document.getElementById(k+i).addEventListener('input',e=>{const v=parseFloat(e.target.value);if(!isNaN(v)){dh[i][k]=v;update();}}));
    document.getElementById('th'+i).addEventListener('input',e=>{stopAnim();dh[i].th=+e.target.value;update();});
  });
}
function syncSliders(){dh.forEach((r,i)=>{document.getElementById('th'+i).value=Math.round(r.th);document.getElementById('tho'+i).textContent=r.th.toFixed(0)+'°';});}

/* ---------- hiển thị ma trận ---------- */
function f(v){const x=Math.abs(v)<5e-4?0:v;return x.toFixed(3);}
function matHTML(T,lbl){let h=`<div class="lbl">${lbl}</div><table>`;
  for(let i=0;i<4;i++){h+='<tr>';for(let j=0;j<4;j++){const cls=i<3&&j<3?'r':(i<3&&j===3?'p':'');h+=`<td class="${cls}">${i===3?(j===3?'1':'0'):f(T[i][j])}</td>`;}h+='</tr>';}
  return h+'</table>';}
const sub=['₀','₁','₂','₃'];const sup=['⁰','¹','²','³'];
function update(){
  const q=dh.map(r=>r.th);const {As,Ts}=fk(q);
  syncSliders();
  document.getElementById('matsSmall').innerHTML=As.map((Ai,i)=>`<div class="mat">${matHTML(Ai,`${sup[i]}A${sub[i+1]}  (θ${sub[i+1]}=${q[i].toFixed(0)}°)`)}</div>`).join('');
  document.getElementById('matBig').innerHTML=matHTML(Ts[3],'⁰T₃ : tư thế đầu tay so với đế');
  const p=O(Ts[3]);
  document.getElementById('posBox').innerHTML=`<div><small>pₓ</small>${f(p.x)} m</div><div><small>p_y</small>${f(p.y)} m</div><div><small>p_z</small>${f(p.z)} m</div>`;
  draw3D(Ts);
  if(typeof updJac==='function')updJac(As,Ts);
}

/* ---------- animation ---------- */
let anim=null;
function stopAnim(){if(anim){cancelAnimationFrame(anim);anim=null;}if(typeof stopJacRun==='function')stopJacRun();}
let animGoal=null;
function goalQ(){return anim&&animGoal?animGoal.slice():dh.map(r=>r.th);}
function animateTo(qt){stopAnim();animGoal=qt.slice();const q0=dh.map(r=>r.th);const dq=qt.map((v,i)=>wrap(v-q0[i]));
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;const T=reduce?1:900;const t0=performance.now();
  (function step(now){const t=Math.min(1,(now-t0)/T);const e=t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
    dh.forEach((r,i)=>r.th=wrap(q0[i]+dq[i]*e));update();if(t<1)anim=requestAnimationFrame(step);else anim=null;})(performance.now());}

