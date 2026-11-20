/* Phần lõi toán học: ma trận Aᵢ theo quy ước D-H chuẩn (Siciliano, slide thầy NHG), nhân ra ⁰T₃.
   Chương 3 (ma trận thuần nhất) và Chương 4 (động học thuận). */

const D=Math.PI/180;
const PRESETS={
  anthro:[{a:0,al:90,d:0.3,th:30},{a:0.4,al:0,d:0,th:40},{a:0.3,al:0,d:0,th:-70}],
  planar:[{a:0.5,al:0,d:0,th:30},{a:0.4,al:0,d:0,th:40},{a:0.2,al:0,d:0,th:-30}]
};
let dh=JSON.parse(JSON.stringify(PRESETS.anthro));

/* ---------- toán: ma trận D-H chuẩn ---------- */
function A(th,d,a,al){const c=Math.cos(th),s=Math.sin(th),ca=Math.cos(al),sa=Math.sin(al);
  return [[c,-s*ca,s*sa,a*c],[s,c*ca,-c*sa,a*s],[0,sa,ca,d],[0,0,0,1]];}
function mul(X,Y){const R=[[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
  for(let i=0;i<4;i++)for(let j=0;j<4;j++){let v=0;for(let k=0;k<4;k++)v+=X[i][k]*Y[k][j];R[i][j]=v;}return R;}
function I4(){return [[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]];}
function fk(q){const As=[],Ts=[I4()];
  for(let i=0;i<3;i++){const r=dh[i];const Ai=A(q[i]*D,r.d,r.a,r.al*D);As.push(Ai);Ts.push(mul(Ts[i],Ai));}
  return {As,Ts};}
function wrap(deg){let x=((deg+180)%360+360)%360-180;return x===-180?180:x;}

