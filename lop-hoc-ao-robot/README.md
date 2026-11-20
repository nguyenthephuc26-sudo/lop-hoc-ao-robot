# Lớp học ảo Robot

Sách bài giảng tương tác cho môn Kỹ thuật Robot (bài giảng TS. Nguyễn Hoàng Giáp). Menu có 6 chương. Chương 1–3 là lý thuyết. Chương 4–6 có lý thuyết bên trái, tay máy 3 khớp dạng người (RRR) 3D và bảng điều khiển bên phải. Trong lý thuyết có các nút "▶ Thử" để robot chạy đúng ví dụ đang đọc.

- **Chương 1 – Giới thiệu robot công nghiệp:** định nghĩa, lịch sử, số liệu thị trường, bộ phận tay máy, bậc tự do, không gian làm việc, 5 kiểu cấu hình, robot di động, đọc bảng thông số Motoman GP7. 6 ví dụ.
- **Chương 2 – Các thành phần của robot:** dòng công suất, bộ truyền (bánh răng, vít me, đai, harmonic drive), tỉ số truyền tối ưu, động cơ khí nén, thủy lực, điện, độ chính xác và độ lặp lại, encoder, cảm biến lực, khoảng cách, thị giác. 11 ví dụ tính.
- **Chương 3 – Mô tả không gian và các phép biến đổi:** ma trận quay, ánh xạ, ma trận thuần nhất, toán tử, ghép và nghịch đảo, RPY, Euler Z–X′–Z″. 13 ví dụ giải từng bước (gồm 5 ví dụ của slide), hình kéo thả ánh xạ 2D, 5 bài tập slide có lời giải.
- **Chương 4 – Động học thuận:** khâu, khớp, bốn tham số D-H, quy tắc gán hệ, ma trận D-H, quy trình 6 bước, rồi làm trọn tay phẳng 3 khâu, tay dạng người, SCARA, tay cầu, tay trụ, cổ tay cầu. 7 ví dụ tính số, hình từ slide. Bên phải: ⁰A₁, ¹A₂, ²A₃ và ⁰T₃ cập nhật ngay khi kéo slider.
- **Chương 5 – Động học ngược:** số nghiệm, vùng làm việc WS₁/WS₂, atan2 và hai "chiêu", tay phẳng 3 khâu (đại số và hình học), tay dạng người 4 nghiệm, tách cổ tay cho robot 6 bậc, giải ngược cổ tay cầu. 6 ví dụ, ghi rõ lỗi in trong slide. Bên phải: nhập điểm đích p, tìm đủ 4 nghiệm, cánh tay chạy tới nghiệm được chọn.
- **Chương 6 – Động học vi phân:** trực giác v = ω × r, cột Jacobian cho khớp quay và tịnh tiến, quy trình tính J, Jacobian tay phẳng và tay dạng người có tính số, kỳ dị biên và kỳ dị trong, tách kỳ dị cổ tay. 6 ví dụ. Bên phải: Jacobian hình học J(q) 6×3, det(J_P), điểm kỳ dị khuỷu và vai, mũi tên vận tốc đầu tay, elipxoit vận tốc, bài toán ngược q̇ = J_P⁻¹·v.
- **Trợ lý chat (nút tròn ở góc màn hình):** trả lời thẳng 112 câu hỏi soạn từ slide chương 1–6 (gõ "danh sách câu hỏi" để chọn theo chương), ra lệnh cho cánh tay bằng tiếng Việt. Câu hỏi ngoài danh sách thì tìm trong bài giảng.

## Cách chạy

1. Giải nén file .zip.
2. Nhấp đúp vào `index.html` để mở bằng Chrome, Edge hoặc Firefox.
3. Máy cần có mạng ở lần mở đầu tiên để tải thư viện 3D (Three.js). Ngoài ra không cần cài thêm gì, cũng không cần server.

## Cấu trúc thư mục

```
lop-hoc-ao-robot/
├── index.html                    Giao diện: menu chương, nội dung lý thuyết 6 chương, khung 3D, bảng điều khiển, khung chat
├── css/style.css                 Màu sắc, bố cục (có giao diện sáng/tối, chạy được trên điện thoại)
├── img/                          78 hình minh họa chương 1–6, lấy từ slide của thầy (bấm vào hình để phóng to)
├── data/corpus.js                Bài giảng chương 1–5 đã cắt thành 235 đoạn (tạo tự động)
├── js/
│   ├── 01-dong-hoc.js            Lõi toán: ma trận D-H Aᵢ, nhân ra ⁰T₃ (Ch.3, Ch.4)
│   ├── 02-mo-hinh-3d.js          Vẽ robot 3D: khâu, khớp, hệ tọa độ, quỹ đạo
│   ├── 03-bang-dh-va-ma-tran.js  Bảng D-H, slider, hiển thị ma trận, chuyển động mượt
│   ├── 04-dong-hoc-nguoc.js      Động học ngược 4 nghiệm (Ch.5)
│   ├── 05-jacobian.js            Jacobian, điểm kỳ dị, vận tốc, elipxoit (Ch.6)
│   ├── 06-tro-ly-kien-thuc.js    112 câu hỏi soạn sẵn, chia theo chương
│   ├── 07-tim-trong-bai-giang.js Tìm kiếm trong bài giảng (thuật toán BM25)
│   ├── 08-tro-ly-chat.js         Hiểu câu lệnh tiếng Việt, chọn câu trả lời phù hợp
│   ├── 09-sach-bai-giang.js      Chuyển chương, nút "▶ Thử", nút trợ lý nổi
│   └── 10-khoi-dong.js           Gắn sự kiện cho nút và khởi động ứng dụng
├── tools/build_corpus.py         Script Python tạo data/corpus.js từ các file PDF bài giảng
└── tools/split_package.py        Script Python tách bản một file thành bộ code nhiều file này
```

Mở `index.html#chuong-5` để vào thẳng chương 5. Các file trong `js/` được nạp theo thứ tự số và dùng chung biến với nhau, nên khi thêm file mới thì đặt số phù hợp và khai báo trong `index.html`.

## Quy ước toán học

Dùng **quy ước D-H chuẩn** theo slide thầy NHG (sách Siciliano), không cộng offset vào θ:

```
ⁱ⁻¹Aᵢ = Rot_z(θᵢ) · Trans_z(dᵢ) · Trans_x(aᵢ) · Rot_x(αᵢ)

      [ cθ   -sθ·cα    sθ·sα   a·cθ ]
    = [ sθ    cθ·cα   -cθ·sα   a·sθ ]
      [ 0       sα       cα      d  ]
      [ 0       0        0       1  ]
```

Robot mẫu (Ví dụ 4.8, Chương 4):

| Khâu | a (m) | α   | d (m) | θ  |
|------|-------|-----|-------|----|
| 1    | 0     | 90° | 0,3   | θ₁ |
| 2    | 0,4   | 0   | 0     | θ₂ |
| 3    | 0,3   | 0   | 0     | θ₃ |

Động học ngược (Chương 5), với p'_z = p_z − d₁ và r = √(pₓ² + p_y²):

- c₃ = (pₓ² + p_y² + p'_z² − a₂² − a₃²) / (2·a₂·a₃), θ₃ = atan2(±√(1 − c₃²), c₃)
- θ₁ = atan2(p_y, pₓ) hoặc θ₁ + 180°
- θ₂ = atan2(p'_z, ±r) − atan2(a₃·s₃, a₂ + a₃·c₃)

Mỗi nghiệm đều được thay ngược vào động học thuận để kiểm tra. Sai số đạt cỡ 10⁻¹⁶ m.

Động học vi phân (Chương 6, slide 6.2–6.4). Với khớp quay i, mọi vectơ lấy trong hệ đế {0}:

- J_Pi = z_{i−1} × (p_E − p_{i−1}), J_Oi = z_{i−1}; v = J_P·q̇, ω = J_O·q̇
- Tay dạng người: det(J_P) = −a₂·a₃·s₃·(a₂c₂ + a₃c₂₃)
  - s₃ = 0: kỳ dị khuỷu (cánh tay duỗi thẳng hoặc gập sát, kỳ dị biên)
  - a₂c₂ + a₃c₂₃ = 0: kỳ dị vai (đầu tay nằm trên trục z₀, kỳ dị trong)
- Elipxoit vận tốc: bán trục là các giá trị suy biến của J_P (căn bậc hai trị riêng của J_P·J_Pᵀ)

## Câu lệnh mẫu cho trợ lý chat

| Gõ | Kết quả |
|----|---------|
| `đưa tay tới (0,3; 0,2; 0,5)` | Giải động học ngược, cánh tay chạy tới điểm |
| `các nghiệm` / `chọn nghiệm 3` | Xem đủ 4 nghiệm / chọn nghiệm khác |
| `góc 30 45 -60` | Động học thuận, in ra ⁰T₃ |
| `khớp 2 thêm 30 độ` | Xoay riêng một khớp |
| `tính ⁰T₃`, `ma trận A2` | Xem ma trận ở tư thế hiện tại |
| `bảng D-H là gì`, `RPY là gì` | Trả lời thẳng từ bộ câu hỏi soạn sẵn |
| `danh sách câu hỏi` | Xem cả 38 câu hỏi, bấm để hỏi |
| `tính jacobian`, `điểm kỳ dị là gì` | Jacobian ở tư thế hiện tại, giải thích kỳ dị |
| `tìm backlash` | Tìm thẳng trong bài giảng |

## Công nghệ

- HTML, CSS, JavaScript thuần, không cần build.
- [Three.js r128](https://threejs.org) để vẽ 3D, OrbitControls để xoay và phóng to bằng chuột hoặc ngón tay.
- Tìm kiếm BM25 tự viết, chạy hoàn toàn trong trình duyệt, không gọi API nên không tốn phí.

## Hướng phát triển

- Mức 3 của chatbot: AI (Ollama chạy trên máy, hoặc API) đọc các đoạn bài giảng tìm được rồi trả lời.
- Đưa lên GitHub Pages và đóng gói thành app cài được trên điện thoại (PWA).
