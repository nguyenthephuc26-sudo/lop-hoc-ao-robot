/* Vẽ cánh tay robot 3D bằng Three.js: khâu, khớp, hệ tọa độ {0}…{3}, quỹ đạo đầu tay. Trục z hướng lên. */

/* ---------- 3D ---------- */
const canvas=document.getElementById('view');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true});
renderer.setPixelRatio(Math.min(2,window.devicePixelRatio||1));
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(40,1,0.01,50);
camera.up.set(0,0,1);camera.position.set(1.35,1.05,0.95);
const controls=new THREE.OrbitControls(camera,canvas);
controls.target.set(0.15,0,0.3);controls.enableDamping=true;controls.update();
scene.add(new THREE.HemisphereLight(0xffffff,0x667788,0.9));
const dl=new THREE.DirectionalLight(0xffffff,0.7);dl.position.set(2,1.5,3);scene.add(dl);

let grid;
function css(v){return getComputedStyle(document.documentElement).getPropertyValue(v).trim();}
function applyTheme(){
  scene.background=new THREE.Color(css('--scene'));
  if(grid)scene.remove(grid);
  grid=new THREE.GridHelper(2,20,new THREE.Color(css('--grid')),new THREE.Color(css('--grid')));
  grid.rotation.x=Math.PI/2;scene.add(grid);
  axisCols=[css('--x'),css('--y'),css('--z')];
  frames.forEach(f=>f.lines.forEach((l,k)=>l.material.color.set(axisCols[k])));
}
let axisCols=['#d23c3c','#2f9e44','#2b6fd6'];

const matLink=new THREE.MeshStandardMaterial({color:0xf08c00,roughness:.45,metalness:.1});
const matJoint=new THREE.MeshStandardMaterial({color:0x455a6e,roughness:.5,metalness:.3});
const matBase=new THREE.MeshStandardMaterial({color:0x6b7c8d,roughness:.6});
const base=new THREE.Mesh(new THREE.CylinderGeometry(0.09,0.11,0.04,40),matBase);
base.rotation.x=Math.PI/2;base.position.z=0.02;scene.add(base);

const links=[],joints=[];
for(let i=0;i<4;i++){const m=new THREE.Mesh(new THREE.CylinderGeometry(0.022,0.022,1,24),matLink);scene.add(m);links.push(m);}
for(let i=0;i<3;i++){const m=new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.04,0.09,32),matJoint);scene.add(m);joints.push(m);}
const tool=new THREE.Mesh(new THREE.SphereGeometry(0.028,24,16),new THREE.MeshStandardMaterial({color:0x0b6bcb}));scene.add(tool);
const target=new THREE.Mesh(new THREE.SphereGeometry(0.03,24,16),new THREE.MeshStandardMaterial({color:0xe03131,transparent:true,opacity:.75}));
target.visible=false;scene.add(target);

function label(text,color){const c=document.createElement('canvas');c.width=128;c.height=64;const g=c.getContext('2d');
  g.font='600 40px JetBrains Mono, monospace';g.fillStyle=color;g.textAlign='center';g.textBaseline='middle';g.fillText(text,64,32);
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),depthTest:false}));s.scale.set(0.08,0.04,1);return s;}
const frames=[];
for(let i=0;i<4;i++){const g=new THREE.Group();const lines=[];const L=0.12;
  [[1,0,0],[0,1,0],[0,0,1]].forEach((v,k)=>{
    const geo=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0),new THREE.Vector3(v[0]*L,v[1]*L,v[2]*L)]);
    const ln=new THREE.Line(geo,new THREE.LineBasicMaterial({color:axisCols[k],depthTest:false}));ln.renderOrder=2;g.add(ln);lines.push(ln);
    const sp=label(['x','y','z'][k]+i,['#d23c3c','#2f9e44','#2b6fd6'][k]);sp.position.set(v[0]*(L+.025),v[1]*(L+.025),v[2]*(L+.025));g.add(sp);});
  g.matrixAutoUpdate=false;scene.add(g);frames.push({g,lines});}

const trailPts=[];let trailOn=false;
const trail=new THREE.Line(new THREE.BufferGeometry(),new THREE.LineBasicMaterial({color:0x0b6bcb}));scene.add(trail);

const Y=new THREE.Vector3(0,1,0);
function placeCyl(m,a,b){const dir=new THREE.Vector3().subVectors(b,a);const len=dir.length();
  m.visible=len>1e-4;if(!m.visible)return;m.position.copy(a).addScaledVector(dir,.5);m.scale.set(1,len,1);
  m.quaternion.setFromUnitVectors(Y,dir.normalize());}
function toM4(T){const m=new THREE.Matrix4();m.set(...T[0],...T[1],...T[2],...T[3]);return m;}
function O(T){return new THREE.Vector3(T[0][3],T[1][3],T[2][3]);}

function draw3D(Ts){
  const P=Ts.map(O);
  // khâu i: từ gốc hệ i-1 tới gốc hệ i (đi qua điểm chân đoạn d trên trục z_{i-1})
  for(let i=0;i<3;i++){
    const zi=new THREE.Vector3(Ts[i][0][2],Ts[i][1][2],Ts[i][2][2]);
    const mid=P[i].clone().addScaledVector(zi,dh[i].d);
    placeCyl(links[i],P[i],mid);
    if(i<3){ if(i===0){placeCyl(links[3],mid,P[1]);} }
    // khớp i+1 nằm tại gốc hệ i, trục dọc z_i
    const j=joints[i];j.position.copy(P[i]);j.quaternion.setFromUnitVectors(Y,zi);
  }
  // các đoạn a_i (dọc x_i) cho khâu 2,3
  placeCyl(links[1],P[1].clone().addScaledVector(new THREE.Vector3(Ts[1][0][2],Ts[1][1][2],Ts[1][2][2]),dh[1].d),P[2]);
  placeCyl(links[2],P[2].clone().addScaledVector(new THREE.Vector3(Ts[2][0][2],Ts[2][1][2],Ts[2][2][2]),dh[2].d),P[3]);
  tool.position.copy(P[3]);
  Ts.forEach((T,i)=>{frames[i].g.matrix.copy(toM4(T));frames[i].g.matrixWorldNeedsUpdate=true;});
  if(trailOn){const last=trailPts[trailPts.length-1];if(!last||last.distanceTo(P[3])>0.004){trailPts.push(P[3].clone());if(trailPts.length>1500)trailPts.shift();trail.geometry.setFromPoints(trailPts);}}
}

function resize(){const w=canvas.clientWidth,h=canvas.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
window.addEventListener('resize',resize);
(function loop(){requestAnimationFrame(loop);controls.update();renderer.render(scene,camera);})();

