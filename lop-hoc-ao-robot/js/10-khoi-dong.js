/* Gắn sự kiện cho nút và khởi động ứng dụng. File này phải nạp cuối cùng. */

/* ---------- sự kiện ---------- */
let curTab='none';
document.getElementById('btnSolve').onclick=solveIK;
document.getElementById('btnRand').onclick=()=>{const d1=dh[0].d,a2=dh[1].a,a3=dh[2].a;const R=Math.abs(a2-a3)+(a2+a3-Math.abs(a2-a3))*(0.25+0.65*Math.random());
  const az=Math.random()*2*Math.PI,el=(Math.random()*1.2-0.35);
  document.getElementById('px').value=(R*Math.cos(el)*Math.cos(az)).toFixed(3);document.getElementById('py').value=(R*Math.cos(el)*Math.sin(az)).toFixed(3);
  document.getElementById('pz').value=(d1+R*Math.sin(el)).toFixed(3);solveIK();};
document.getElementById('btnFromFK').onclick=()=>{const p=O(fk(dh.map(r=>r.th)).Ts[3]);
  document.getElementById('px').value=p.x.toFixed(3);document.getElementById('py').value=p.y.toFixed(3);document.getElementById('pz').value=p.z.toFixed(3);solveIK();};
document.getElementById('btnHome').onclick=()=>animateTo([0,0,0]);
document.getElementById('btnFrames').onclick=e=>{const on=e.target.getAttribute('aria-pressed')!=='true';e.target.setAttribute('aria-pressed',on);
  e.target.textContent=on?'Ẩn hệ tọa độ':'Hiện hệ tọa độ';frames.forEach(fr=>fr.g.visible=on);};
document.getElementById('btnTrail').onclick=e=>{trailOn=!trailOn;e.target.setAttribute('aria-pressed',trailOn);e.target.textContent=trailOn?'Xóa quỹ đạo':'Vẽ quỹ đạo';
  if(!trailOn){trailPts.length=0;trail.geometry.setFromPoints([]);}};
function loadPreset(k){stopAnim();dh=JSON.parse(JSON.stringify(PRESETS[k]));buildTable();sols=[];document.getElementById('sols').innerHTML='';document.getElementById('steps').innerHTML='';document.getElementById('ikMsg').innerHTML='';target.visible=false;update();}
document.getElementById('preAnthro').onclick=()=>loadPreset('anthro');
document.getElementById('prePlanar').onclick=()=>loadPreset('planar');
matchMedia('(prefers-color-scheme: dark)').addEventListener('change',applyTheme);
new MutationObserver(applyTheme).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});


initJac();buildTable();applyTheme();renderMats();
const hm=location.hash.match(/^#chuong-([1-6])$/);goChapter(hm?hm[1]:1);update();
