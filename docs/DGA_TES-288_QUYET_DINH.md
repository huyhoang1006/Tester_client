# TES-288 – Giao diện DGA mới: các quyết định khi triển khai

Mọi ngưỡng, quy ước và nội dung tooltip nằm trong `src/utils/dga/config.js`. Muốn đổi thì sửa ở đó.

## Nguồn tiêu chuẩn

| Phần | Nguồn |
| --- | --- |
| IEEE-2019 Status 1/2/3 | IEEE C57.104-2019 Table 1–3, §6.1.1 Step 1–8, Figure 2 |
| Rogers | IEEE C57.104-2019 Table 5 |
| Doernenburg | IEEE C57.104-2019 Annex G.4 (Table G.3 L1, Table G.4) |
| Key gas | IEEE C57.104-2019 Annex D.1 |
| Duval Triangle 1 | IEEE C57.104-2019 Table 6 (= IEC 60599 Figure B.3) |
| Duval Pentagon 1/2 | IEEE C57.104-2019 Annex D.3 / D.5 |
| IEC basic gas ratios, IEC P90 | IEC 60599:2022 Table 1, Table A.2 |
| Duval Triangle 2 (OLTC) | IEC 60599:2022 Figure B.4, A.7.4 |
| IEEE-2008 TDCG / từng khí, Pattern | Theo ticket |

## Quyết định

1. **DB:** không sửa schema. Thêm cột cấu hình `o2`, `n2`, `communicating_oltc` cho Dga và bài test mới `DgaOltc`. Danh mục được seed lại mỗi lần khởi động app.
2. **O₂/N₂:** không bắt buộc nhập. Nếu không có thì dùng nhánh "> 0.2" (IEEE Step 3).
3. **Tuổi máy:** tính bằng năm của ngày thí nghiệm trừ năm sản xuất trong thông tin thiết bị. Không có năm sản xuất thì dùng cột "Unknown".
4. **Delta (Table 3):**
   - Lần đo được so là bài DGA - Main tank gần nhất trước ngày thí nghiệm, cùng thiết bị, đọc trên máy này.
   - Không giới hạn khoảng cách thời gian giữa 2 lần đo (Table 3 không chuẩn hoá theo thời gian).
   - Chỉ xét mức tăng. Với C₂H₂, tăng bất kỳ là tính vượt.
   - Delta vượt ngưỡng chỉ đưa lên Status 2, kèm ghi chú nên lấy mẫu xác nhận.
5. **Rate (Table 4):** chưa tính ở bản này.
6. **IEC T1:** chỉ xét C₂H₄/C₂H₆ < 1, vì CH₄/H₂ được IEC ghi là "non-significant". Không đánh T1 khi đã đánh PD.
7. **Điều kiện tick "Method applied":**
   - IEC và Rogers: khi có khí vượt ngưỡng IEC P90.
   - Doernenburg: theo Step 2 của Annex G.4.
   - Key gas: khi có khí vượt L1.
   - Duval: khi tổng 5 khí ≥ 50 ppm.
   - Nếu không được áp dụng thì tick "No fault".
8. **Key gas:** chọn theo khí chiếm tỷ trọng lớn nhất.
   - C₂H₄ → T3.
   - CO → T1 (quá nhiệt giấy).
   - C₂H₂, hoặc H₂ kèm C₂H₂ đứng thứ 2 và ≥ 10 % → D2.
   - H₂ (trường hợp còn lại) → PD.
   - Khí khác → No diagnosis.
9. **Doernenburg "Thermal decomposition":** tick cả T1, T2 và T3, vì phương pháp này không phân theo nhiệt độ.
10. **MSS-Scheme:** cột được làm mờ vì chưa có bảng luật.
11. **Communicating OLTC:** có ô tick cho DGA - Main tank. Khi tick, ngưỡng IEC cho C₂H₂ là 280 ppm, ngược lại là 20 ppm.
12. **DGA - OLTC:**
    - Chỉ có Triangle 2, tỷ số C₂H₄/C₂H₂ và bảng nhập 7 khí.
    - Không có bảng 6 phương pháp, Summary, tab Key Gas hay Pentagon (theo IEC A.7).
    - Không tính CI và không đưa vào Health Index.
13. **Health Index:** giữ nguyên. CI cũ của DGA - Main tank được tính ngầm mỗi khi sửa số khí.
14. **Pentagon:**
    - Đặt % của từng khí lên trục với độ dài bằng chính giá trị %.
    - Điểm đo là trọng tâm đa giác.
    - Khép 2 khe hở trong bảng toạ độ gốc: T3 (1, −32) → (1, −32.4) và T1 (−35, 3) → (−35, 3.1).
15. **Triangle 2:** giá trị nằm đúng trên ranh giới được xếp vào vùng phía trên.
