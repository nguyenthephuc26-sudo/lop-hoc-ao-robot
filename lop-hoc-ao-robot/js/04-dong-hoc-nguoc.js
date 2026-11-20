/* Động học ngược tay dạng người 3 khớp (Chương 5): định lý cos → θ₃, atan2 → θ₁, chiêu B → θ₂.
   Tìm đủ 4 nghiệm và kiểm tra lại bằng động học thuận. */

/* ---------- động học ngược (tay dạng người, slide NHG 11–13) ---------- */
function isAnthro(){return Math.abs(dh[0].a)<1e-9&&Math.abs(dh[0].al-90)<1e-9&&Math.abs(dh[1].al)<1e-9&&Math.abs(dh[2].al)<1e-9&&Math.abs(dh[1].d)<1e-9&&Math.abs(dh[2].d)<1e-9;}
let sols=[],chosen=-1;
function solveIK(){
  const msg=document.getElementById('ikMsg'),box=document.getElementById('sols'),st=document.getElementById('steps');
  box.innerHTML='';st.innerHTML='';sols=[];
  if(!isAnthro()){msg.className='msg bad';msg.innerHTML='Công thức ở đây dành cho tay dạng người (α₁=90°, các α và d còn lại bằng 0). Bấm “Tay dạng người (VD 4.8)” để dùng.';return;}
  const px=+document.getElementById('px').value,py=+document.getElementById('py').value,pz=+document.getElementById('pz').value;
  const d1=dh[0].d,a2=dh[1].a,a3=dh[2].a;
  target.position.set(px,py,pz);target.visible=true;
  const zp=pz-d1,r=Math.hypot(px,py);
  const c3=(px*px+py*py+zp*zp-a2*a2-a3*a3)/(2*a2*a3);
  const stepsHTML=[
    `Hạ gốc về vai: <code>p'_z = p_z − d₁ = ${pz.toFixed(3)} − ${d1} = ${zp.toFixed(3)}</code>`,
    `Định lý cos cho tam giác vai–khuỷu–đầu tay: <code>c₃ = (pₓ²+p_y²+p'_z² − a₂² − a₃²) / (2a₂a₃) = ${c3.toFixed(4)}</code>`
  ];
  if(Math.abs(c3)>1+1e-9){msg.className='msg bad';msg.innerHTML=`|c₃| = ${Math.abs(c3).toFixed(3)} > 1 nên điểm nằm ngoài vùng làm việc (khoảng cách từ vai phải nằm trong [${Math.abs(a2-a3).toFixed(2)}; ${(a2+a3).toFixed(2)}] m).`;
    st.innerHTML=stepsHTML.map(s=>`<li>${s}</li>`).join('');return;}
  const s3a=Math.sqrt(Math.max(0,1-c3*c3));
  stepsHTML.push(`<code>s₃ = ±√(1 − c₃²) = ±${s3a.toFixed(4)}</code>, nên <code>θ₃ = atan2(s₃, c₃) = ±${(Math.atan2(s3a,c3)/D).toFixed(2)}°</code>`);
  stepsHTML.push(`Xoay đế hướng về điểm đích: <code>θ₁ = atan2(p_y, pₓ) = ${(Math.atan2(py,px)/D).toFixed(2)}°</code> hoặc quay ngược <code>θ₁ + 180°</code>`);
  stepsHTML.push(`Chiêu B (hệ dạng xoay): <code>θ₂ = atan2(p'_z, ±r) − atan2(a₃s₃, a₂ + a₃c₃)</code>, với <code>r = √(pₓ²+p_y²) = ${r.toFixed(4)}</code>`);
  stepsHTML.push('Kiểm tra: thay từng nghiệm vào ⁰T₃ phải ra đúng p (cột “sai số” bên trên).');
  for(const back of [false,true])for(const sg of [1,-1]){
    const s3=sg*s3a,t3=Math.atan2(s3,c3);
    const t1=back?Math.atan2(-py,-px):Math.atan2(py,px);
    const t2=Math.atan2(zp,back?-r:r)-Math.atan2(a3*s3,a2+a3*c3);
    const q=[wrap(t1/D),wrap(t2/D),wrap(t3/D)];
    const {Ts}=fk(q);const e=O(Ts[3]).distanceTo(new THREE.Vector3(px,py,pz));
    // khuỷu trên/dưới: so độ cao khuỷu với đường thẳng vai → đầu tay
    const sh=O(Ts[1]),el=O(Ts[2]),tp=O(Ts[3]);const dir=new THREE.Vector3().subVectors(tp,sh);
    const tt=dir.lengthSq()>1e-12?new THREE.Vector3().subVectors(el,sh).dot(dir)/dir.lengthSq():0;
    const onLine=sh.clone().addScaledVector(dir,tt);const up=el.z>=onLine.z-1e-9;
    const floor=Math.min(el.z,tp.z)<-1e-6;
    sols.push({q,e,floor,name:`${back?'Vai quay ngược':'Vai hướng tới'} · khuỷu ${up?'trên':'dưới'}`});
  }
  msg.className='msg ok';msg.textContent=`Tìm được ${sols.length} nghiệm. Bấm vào từng nghiệm để xem cánh tay di chuyển tới.`;
  box.innerHTML=sols.map((s,i)=>`<button class="sol" data-i="${i}" aria-pressed="false"><strong>${i+1}. ${s.name}</strong>θ = (${s.q.map(v=>v.toFixed(1)).join('°, ')}°)<br>sai số FK: ${s.e.toExponential(1)} m${s.floor?'<br><span style="color:var(--bad)">khâu xuyên xuống dưới sàn, robot thật không làm được</span>':''}</button>`).join('');
  box.querySelectorAll('.sol').forEach(b=>b.addEventListener('click',()=>pick(+b.dataset.i)));
  st.innerHTML=stepsHTML.map(s=>`<li>${s}</li>`).join('');
  pick(0);
}
function pick(i){chosen=i;document.querySelectorAll('.sol').forEach(b=>b.setAttribute('aria-pressed',+b.dataset.i===i?'true':'false'));animateTo(sols[i].q);}

