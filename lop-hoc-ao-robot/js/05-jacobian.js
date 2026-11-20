/* Động học vi phân (Chương 6): Jacobian hình học J(q), det(J_P), điểm kỳ dị khuỷu/vai,
   vận tốc v = J·q̇, bài toán ngược q̇ = J⁻¹·v, elipxoit vận tốc. */

/* ---------- chương 6: động học vi phân (Jacobian hình học, kỳ dị) ---------- */
// Khớp quay i: J_Pi = z_{i-1} × (p_E − p_{i-1}),  J_Oi = z_{i-1}   (slide NHG 6.2, mọi vectơ trong hệ đế {0})
function col(T,j){return [T[0][j],T[1][j],T[2][j]];}
function cross(a,b){return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];}
function sub3(a,b){return [a[0]-b[0],a[1]-b[1],a[2]-b[2]];}
function jacobian(Ts){const pE=col(Ts[3],3);const JP=[],JO=[];
  for(let i=0;i<3;i++){const z=col(Ts[i],2),p=col(Ts[i],3);JP.push(cross(z,sub3(pE,p)));JO.push(z);}
  // trả về theo hàng: J[r][c], r = 0..5, c = khớp 0..2
  return [0,1,2].map(r=>JP.map(c=>c[r])).concat([0,1,2].map(r=>JO.map(c=>c[r])));}
function det3(M){return M[0][0]*(M[1][1]*M[2][2]-M[1][2]*M[2][1])-M[0][1]*(M[1][0]*M[2][2]-M[1][2]*M[2][0])+M[0][2]*(M[1][0]*M[2][1]-M[1][1]*M[2][0]);}
function inv3(M){const d=det3(M);if(Math.abs(d)<1e-12)return null;const c=(r,s)=>M[r][s];
  return [[c(1,1)*c(2,2)-c(1,2)*c(2,1),c(0,2)*c(2,1)-c(0,1)*c(2,2),c(0,1)*c(1,2)-c(0,2)*c(1,1)],
          [c(1,2)*c(2,0)-c(1,0)*c(2,2),c(0,0)*c(2,2)-c(0,2)*c(2,0),c(0,2)*c(1,0)-c(0,0)*c(1,2)],
          [c(1,0)*c(2,1)-c(1,1)*c(2,0),c(0,1)*c(2,0)-c(0,0)*c(2,1),c(0,0)*c(1,1)-c(0,1)*c(1,0)]].map(r=>r.map(x=>x/d));}
function mv3(M,v){return M.map(r=>r[0]*v[0]+r[1]*v[1]+r[2]*v[2]);}
// trị riêng ma trận đối xứng 3×3 (phương pháp Jacobi) → bán trục elipxoit vận tốc
function eigSym3(S){let A=S.map(r=>r.slice()),V=[[1,0,0],[0,1,0],[0,0,1]];
  for(let it=0;it<40;it++){let p=0,q=1;if(Math.abs(A[0][2])>Math.abs(A[p][q])){p=0;q=2;}if(Math.abs(A[1][2])>Math.abs(A[p][q])){p=1;q=2;}
    if(Math.abs(A[p][q])<1e-12)break;const th=0.5*Math.atan2(2*A[p][q],A[q][q]-A[p][p]),c=Math.cos(th),s=Math.sin(th);
    for(let k=0;k<3;k++){const akp=A[k][p],akq=A[k][q];A[k][p]=c*akp-s*akq;A[k][q]=s*akp+c*akq;}
    for(let k=0;k<3;k++){const apk=A[p][k],aqk=A[q][k];A[p][k]=c*apk-s*aqk;A[q][k]=s*apk+c*aqk;}
    for(let k=0;k<3;k++){const vkp=V[k][p],vkq=V[k][q];V[k][p]=c*vkp-s*vkq;V[k][q]=s*vkp+c*vkq;}}
  return {val:[A[0][0],A[1][1],A[2][2]],vec:[0,1,2].map(j=>[V[0][j],V[1][j],V[2][j]])};}

/* --- 3D: mũi tên vận tốc và elipxoit --- */
const arrV=new THREE.ArrowHelper(new THREE.Vector3(1,0,0),new THREE.Vector3(),0.1,0x7048e8,0.035,0.022);
const arrW=new THREE.ArrowHelper(new THREE.Vector3(0,0,1),new THREE.Vector3(),0.1,0x0ca678,0.035,0.022);
[arrV,arrW].forEach(a=>{a.visible=false;scene.add(a);});
const ellip=new THREE.Mesh(new THREE.SphereGeometry(1,32,20),new THREE.MeshBasicMaterial({color:0x7048e8,wireframe:true,transparent:true,opacity:.35}));
ellip.visible=false;ellip.matrixAutoUpdate=false;scene.add(ellip);
let showEllip=true;
const VSCALE=0.6, ESCALE=0.15; // m/s → độ dài mũi tên; bán trục elipxoit (m/s ứng với ‖q̇‖ = 1 rad/s)

/* --- giao diện --- */
let qd=[20,0,0]; // q̇ (°/s)
let jacRun=null;
function qdSliders(){const box=document.getElementById('qdBox');box.innerHTML=[0,1,2].map(i=>`<label class="theta" for="qd${i}"><span style="width:36px">θ̇${'₁₂₃'[i]}</span><input id="qd${i}" type="range" min="-60" max="60" step="1" value="${qd[i]}"><output id="qdo${i}">${qd[i]}°/s</output></label>`).join('');
  [0,1,2].forEach(i=>document.getElementById('qd'+i).addEventListener('input',e=>{qd[i]=+e.target.value;document.getElementById('qdo'+i).textContent=qd[i]+'°/s';update();}));}
function genMat(rows,cls,lbl){return `<div class="lbl">${lbl}</div><table>`+rows.map((r,i)=>'<tr>'+r.map(v=>`<td class="${cls[i]}">${f(v)}</td>`).join('')+'</tr>').join('')+'</table>';}
function vecTxt(v,u){return '('+v.map(x=>f(x)).join('; ')+') '+u;}
function updJac(As,Ts){
  const J=jacobian(Ts),JP=J.slice(0,3),dP=det3(JP);
  const on=curTab==='jac';
  const qdr=qd.map(x=>x*D),v=mv3(JP,qdr),w=mv3(J.slice(3),qdr);
  const pE=O(Ts[3]);
  // 3D
  const vl=Math.hypot(...v),wl=Math.hypot(...w);
  arrV.visible=on&&vl>1e-4;arrW.visible=on&&wl>1e-4&&document.getElementById('showW').checked;
  if(arrV.visible){arrV.position.copy(pE);arrV.setDirection(new THREE.Vector3(...v).normalize());arrV.setLength(Math.max(vl*VSCALE,0.05),0.035,0.022);}
  if(arrW.visible){arrW.position.copy(pE);arrW.setDirection(new THREE.Vector3(...w).normalize());arrW.setLength(Math.max(wl*0.25,0.05),0.035,0.022);}
  const E=eigSym3([0,1,2].map(r=>[0,1,2].map(c=>JP[r][0]*JP[c][0]+JP[r][1]*JP[c][1]+JP[r][2]*JP[c][2])));
  const ax=E.val.map(x=>Math.sqrt(Math.max(x,0))); // giá trị suy biến của J_P
  ellip.visible=on&&showEllip;
  if(ellip.visible){const m=new THREE.Matrix4();const e=E.vec.map(x=>new THREE.Vector3(...x));
    m.makeBasis(e[0].clone().multiplyScalar(Math.max(ax[0]*ESCALE,.002)),e[1].clone().multiplyScalar(Math.max(ax[1]*ESCALE,.002)),e[2].clone().multiplyScalar(Math.max(ax[2]*ESCALE,.002)));
    m.setPosition(pE);ellip.matrix.copy(m);ellip.matrixWorldNeedsUpdate=true;}
  if(!on)return;
  // bảng
  document.getElementById('jacMat').innerHTML=genMat(J,['p','p','p','r','r','r'],'J(q) = [J_P ; J_O], cột i là khớp i');
  const anth=isAnthro(),q=dh.map(r=>r.th*D);
  const s3=Math.sin(q[2]),wr=dh[1].a*Math.cos(q[1])+dh[2].a*Math.cos(q[1]+q[2]);
  const big=Math.max(...ax),small=Math.min(...ax);const ratio=big>1e-9?small/big:0;
  let st,cls;
  if(Math.abs(dP)<2e-4){st='Đang ở điểm kỳ dị';cls='bad';}else if(ratio<0.15){st='Gần điểm kỳ dị';cls='warn';}else{st='Bình thường';cls='ok';}
  let kind='';
  if(anth&&cls!=='ok'){const k=[];if(Math.abs(s3)<0.15)k.push('<b>kỳ dị khuỷu</b>: s₃ ≈ 0, cánh tay duỗi thẳng hoặc gập sát (kỳ dị biên)');
    if(Math.abs(wr)<0.03)k.push('<b>kỳ dị vai</b>: a₂c₂ + a₃c₂₃ ≈ 0, đầu tay nằm trên trục z₀ (kỳ dị trong)');kind=k.join('<br>');}
  document.getElementById('detBox').innerHTML=(anth?`<div class="eq">det(J_P) = −a₂·a₃·s₃·(a₂c₂ + a₃c₂₃)<br>= −${dh[1].a}·${dh[2].a}·(${f(s3)})·(${f(wr)}) = <b>${dP.toFixed(5)}</b></div>`:`<div class="eq">det(J_P) = <b>${dP.toFixed(5)}</b></div>`)+
    `<span class="pill ${cls}">${st}</span> <span class="note">Độ khéo léo (manipulability) w = |det J_P| = ${Math.abs(dP).toFixed(4)}; tỉ số bán trục elipxoit nhỏ/lớn = ${ratio.toFixed(2)}</span>${kind?'<p class="note">'+kind+'</p>':''}`;
  document.getElementById('vOut').innerHTML=`<div><small>v = J_P·q̇ (m/s)</small>${vecTxt(v,'')}</div><div><small>ω = J_O·q̇ (rad/s)</small>${vecTxt(w,'')}</div><div><small>‖v‖</small>${f(vl)} m/s</div>`;
  // bài toán ngược
  const vd=['vx','vy','vz'].map(id=>+document.getElementById(id).value||0);const Ji=inv3(JP);
  const out=document.getElementById('qdInvOut');
  if(!Ji){out.innerHTML='<span class="pill bad">J_P không khả nghịch (det = 0)</span> Không có q̇ nào cho được vận tốc này theo mọi hướng.';}
  else{const qq=mv3(Ji,vd).map(x=>x/D);const mx=Math.max(...qq.map(Math.abs));
    out.innerHTML=`q̇ = J_P⁻¹·v = (${qq.map(x=>x.toFixed(1)).join('; ')}) °/s `+(mx>180?`<span class="pill bad">khớp phải quay ${mx.toFixed(0)}°/s, quá nhanh</span>`:mx>60?`<span class="pill warn">${mx.toFixed(0)}°/s, khá nhanh</span>`:'<span class="pill ok">hợp lý</span>');}
}
function stopJacRun(){if(jacRun){cancelAnimationFrame(jacRun);jacRun=null;}}
function runJac(mode){stopAnim();stopJacRun();const msg=document.getElementById('jacMsg');msg.textContent='';
  const t0=performance.now();let last=t0;const T=2000;
  const step=now=>{const dt=Math.min(0.05,(now-last)/1000);last=now;
    const {Ts}=fk(dh.map(r=>r.th));let qq;
    if(mode==='fwd')qq=qd.slice();
    else{const Ji=inv3(jacobian(Ts).slice(0,3));const vd=['vx','vy','vz'].map(id=>+document.getElementById(id).value||0);
      if(!Ji){msg.innerHTML='<span class="pill bad">Dừng</span> Tới điểm kỳ dị, J_P không khả nghịch.';jacRun=null;update();return;}
      qq=mv3(Ji,vd).map(x=>x/D);const mx=Math.max(...qq.map(Math.abs));
      if(mx>240){msg.innerHTML=`<span class="pill bad">Dừng</span> Gần điểm kỳ dị: để đầu tay đi thẳng, khớp phải quay ${mx.toFixed(0)}°/s. Đây là ý của slide 6.4: vận tốc nhỏ ở đầu tay có thể đòi hỏi vận tốc khớp rất lớn.`;jacRun=null;update();return;}}
    dh.forEach((r,i)=>r.th=wrap(r.th+qq[i]*dt));update();
    if(now-t0<T)jacRun=requestAnimationFrame(step);else{jacRun=null;msg.textContent='Đã chạy xong 2 giây. Bật "Vẽ quỹ đạo" để thấy đường đi của đầu tay.';}};
  jacRun=requestAnimationFrame(step);}
function initJac(){qdSliders();
  ['vx','vy','vz','showW'].forEach(id=>document.getElementById(id).addEventListener('input',()=>update()));
  document.getElementById('showEl').addEventListener('change',e=>{showEllip=e.target.checked;update();});
  document.getElementById('btnRunFwd').onclick=()=>runJac('fwd');
  document.getElementById('btnRunInv').onclick=()=>runJac('inv');
  document.getElementById('btnSingElbow').onclick=()=>{if(!isAnthro())loadPreset('anthro');animateTo([30,30,0]);};
  document.getElementById('btnSingShoulder').onclick=()=>{if(!isAnthro())loadPreset('anthro');const a2=dh[1].a,a3=dh[2].a;
    // chọn θ₃ = −90°, giải a₂c₂ + a₃c₂₃ = a₂c₂ + a₃s₂ = 0  ⇒  θ₂ = atan2(a₂, −a₃)
    animateTo([30,Math.atan2(a2,-a3)/D,-90]);};
  document.getElementById('btnNormal').onclick=()=>animateTo([30,40,-80]);
}

