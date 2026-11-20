import subprocess,re,json,sys
SRC='/mnt/project-files/bai-giang/'
files=[(1,'Chuong1_Gioi_thieu_robot_cong_nghiep.pdf'),(2,'Chuong2_Cac_thanh_phan_cua_robot.pdf'),(3,'Chuong3_Phep_bien_doi_khong_gian.pdf'),(4,'Chuong4_Dong_hoc_thuan.pdf'),(5,'Chuong5_Dong_hoc_nguoc.pdf')]
ZW=re.compile('[​‌‍⁠﻿]')
head_re=re.compile(r'^(\d+(?:\.\d+){1,2})\s+(\S.{2,80})$|^(\d)\.\s+([A-ZĐÂĂÊÔƠƯ].{2,80})$')
out=[]
for ch,f in files:
    n=int(re.search(r'Pages:\s+(\d+)',subprocess.run(['pdfinfo',SRC+f],capture_output=True,text=True).stdout).group(1))
    heading=''
    for pg in range(1,n+1):
        txt=subprocess.run(['pdftotext','-f',str(pg),'-l',str(pg),SRC+f,'-'],capture_output=True,text=True).stdout
        txt=ZW.sub('',txt)
        lines=[]
        for ln in txt.split('\n'):
            ln=ln.strip()
            if not ln: continue
            if re.match(r'^(Chương \d|Trang \d+ ?/ ?\d+)',ln) and len(ln)<80: continue
            if 'trang ' in ln.lower() and '·' in ln and len(ln)<70: continue
            if ln.startswith('KỸ THUẬT ROBOT') or ln.startswith('Biên soạn dựa trên') or ln.startswith('Bài giảng tự học'): continue
            m=head_re.match(ln)
            if m and (m.group(1) or ch==5) and not ln.endswith('.') :
                heading=(m.group(1) or m.group(3))+' '+(m.group(2) or m.group(4)); lines.append('\n'); continue
            # drop lines that are mostly math garbage
            letters=sum(c.isalpha() for c in ln)
            if len(ln)<3 or letters/len(ln)<0.45 and len(ln)<25: continue
            lines.append(ln)
        # rebuild paragraphs
        text=' '.join(lines)
        text=re.sub(r'\s*\n\s*','\n',text); text=re.sub(r'[ \t]+',' ',text)
        for para in text.split('\n'):
            para=para.strip()
            if len(para)<40: continue
            # split long paragraphs on sentence ends ~600 chars
            sents=re.split(r'(?<=[.!?:])\s+(?=[A-ZĐÀ-Ỹ0-9“(])',para)
            buf=''
            for s in sents:
                if len(buf)+len(s)>650 and len(buf)>150:
                    out.append({'c':ch,'p':pg,'h':heading,'t':buf.strip()}); buf=''
                buf+=s+' '
            if len(buf.strip())>=40: out.append({'c':ch,'p':pg,'h':heading,'t':buf.strip()})
json.dump(out,open('corpus/corpus.json','w'),ensure_ascii=False,separators=(',',':'))
print(len(out),sum(len(o['t']) for o in out))
