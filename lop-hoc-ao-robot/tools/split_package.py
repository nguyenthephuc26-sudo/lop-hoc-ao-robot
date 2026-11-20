"""Tách index.html (bản một file) thành bộ code nhiều file để nộp: python3 split_package.py <index.html> <thư mục ra>"""
import os,sys
SRC,OUT=sys.argv[1],sys.argv[2]
for d in ('css','js','data','img'): os.makedirs(os.path.join(OUT,d),exist_ok=True)
s=open(SRC,encoding='utf-8').read();L=s.split('\n')
def ln(sub):
    for i,l in enumerate(L):
        if sub in l: return i+1
    raise SystemExit('Không thấy: '+sub)
def rng(a,b): return '\n'.join(L[a-1:b])+'\n'
open(OUT+'/css/style.css','w').write(s[s.index('<style>')+7:s.index('</style>')].strip()+'\n')
tag='<script type="application/json" id="corpus">';a=s.index(tag)+len(tag);b=s.index('</script>',a)
open(OUT+'/data/corpus.js','w').write('/* Bài giảng chương 1–5 (TS. Nguyễn Hoàng Giáp) đã cắt thành từng đoạn nhỏ.\n   Tạo tự động bằng tools/build_corpus.py, không sửa tay. c = chương, p = trang, h = mục, t = nội dung. */\nwindow.CORPUS = '+s[a:b].replace('<\\/','</')+';\n')
M=[ln('(function(){')+1, ln('/* ---------- 3D ---------- */'), ln('/* ---------- bảng D-H ---------- */'), ln('/* ---------- động học ngược'),
   ln('/* ---------- chương 6'), ln('/* ---------- sự kiện ---------- */'), ln('/* ---------- sách bài giảng'), ln('/* ================= TRỢ LÝ CHAT'), ln('/* ================= MỨC 2'),
   ln("const chatLog=document.getElementById('chatLog');"), ln('initJac();buildTable();applyTheme();renderMats();')]
init='\n'.join(L[M[10]-1:M[10]+1]).strip()
parts=[
 ('01-dong-hoc.js','Phần lõi toán học: ma trận Aᵢ theo quy ước D-H chuẩn (Siciliano, slide thầy NHG), nhân ra ⁰T₃.\n   Chương 3 (ma trận thuần nhất) và Chương 4 (động học thuận).',M[0],M[1]-1),
 ('02-mo-hinh-3d.js','Vẽ cánh tay robot 3D bằng Three.js: khâu, khớp, hệ tọa độ {0}…{3}, quỹ đạo đầu tay. Trục z hướng lên.',M[1],M[2]-1),
 ('03-bang-dh-va-ma-tran.js','Bảng D-H có slider, hiển thị ⁰A₁, ¹A₂, ²A₃, ⁰T₃ cập nhật trực tiếp, và hiệu ứng chuyển động.',M[2],M[3]-1),
 ('04-dong-hoc-nguoc.js','Động học ngược tay dạng người 3 khớp (Chương 5): định lý cos → θ₃, atan2 → θ₁, chiêu B → θ₂.\n   Tìm đủ 4 nghiệm và kiểm tra lại bằng động học thuận.',M[3],M[4]-1),
 ('05-jacobian.js','Động học vi phân (Chương 6): Jacobian hình học J(q), det(J_P), điểm kỳ dị khuỷu/vai,\n   vận tốc v = J·q̇, bài toán ngược q̇ = J⁻¹·v, elipxoit vận tốc.',M[4],M[5]-1),
 ('06-tro-ly-kien-thuc.js','Trợ lý chat: chuẩn hóa câu hỏi tiếng Việt, đọc số, và bộ 38 câu hỏi hay gặp chương 1–6 kèm câu trả lời.',M[7],M[8]-1),
 ('07-tim-trong-bai-giang.js','Tìm kiếm BM25 trong bài giảng (data/corpus.js), dùng khi câu hỏi không có trong bộ câu hỏi soạn sẵn.',M[8],M[9]-1),
 ('08-tro-ly-chat.js','Bộ não của trợ lý: nhận lệnh điều khiển (tới điểm, xoay khớp, home, tính T, jacobian) rồi gọi động học;\n   câu hỏi lý thuyết thì trả lời thẳng từ bộ câu hỏi soạn sẵn.',M[9],M[10]-1),
 ('09-sach-bai-giang.js','Sách bài giảng: chuyển chương 1–6, hiện robot ở chương 4–6, nút "Thử trên robot", nút trợ lý nổi,\n   hình kéo thả ánh xạ ở Chương 3 và phóng to hình minh họa.',M[6],M[7]-1),
 ('10-khoi-dong.js','Gắn sự kiện cho nút và khởi động ứng dụng. File này phải nạp cuối cùng.',M[5],M[6]-1),
]
names=[]
for name,desc,a,b in parts:
    code=rng(a,b).replace("const CORPUS=JSON.parse(document.getElementById('corpus').textContent);","const CORPUS=window.CORPUS;")
    if name.startswith('10'): code+='\n'+init+'\n'
    open(OUT+'/js/'+name,'w').write('/* '+desc+' */\n\n'+code); names.append(name)
markup=s[s.index('</style>')+8:s.index(tag)].strip()
import re,base64
def _img(m):
    f=m.group(1);os.makedirs(os.path.join(OUT,os.path.dirname(f)),exist_ok=True)
    open(os.path.join(OUT,f),'wb').write(base64.b64decode(m.group(3)));return f'<img src="{f}"{m.group(2) or ""}'
markup=re.sub(r'<img data-f="([^"]+)"((?: width="\d+" height="\d+")?) src="data:image/[a-z]+;base64,([^"]+)"',_img,markup)
head=s[:s.index('<style>')].replace('<meta name="claude:viewport-fit-sides" content="cover">\n','').strip()
scripts='\n'.join(['<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>',
 '<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>',
 '<script src="data/corpus.js"></script>']+[f'<script src="js/{n}"></script>' for n in names])
open(OUT+'/index.html','w').write(f'<!doctype html>\n<html lang="vi">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n{head}\n<link rel="stylesheet" href="css/style.css">\n</head>\n<body>\n{markup}\n\n{scripts}\n</body>\n</html>\n')
print('OK',names)
