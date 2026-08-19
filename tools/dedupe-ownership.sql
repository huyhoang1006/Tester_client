-- ============================================================================
-- DỌN DÒNG QUYỀN SỞ HỮU TRÙNG (user_identified_object)
--
-- Bảng chỉ có PRIMARY KEY trên `mrid`, KHÔNG có ràng buộc duy nhất trên cặp
-- (user_id, identified_object_id). Hai dòng khác mrid nhưng cùng một cặp là hợp lệ với
-- SQLite, và `ON CONFLICT(mrid)` không phát hiện.
--
-- Trong mã có HAI quy ước sinh mrid cho cùng một việc:
--
--   ensureUserIdentifiedObject   ->  '<id đối tượng>@u-<user id>'
--   checkUserIdentifiedObject    ->  uuid ngẫu nhiên   (mixin substation, mapper thiết bị thử)
--
-- Import Word chạy CẢ HAI cho cùng một trạm, nên sinh hai dòng. Truy vấn cây nào JOIN
-- bảng này mà thiếu DISTINCT sẽ trả node ra HAI LẦN — đúng triệu chứng "hai node ADMIN".
--
-- Tầng ghi đã tự dọn từ bản này trở đi. File này để dọn dữ liệu đã lỡ sinh trước đó.
--
-- CÁCH DÙNG: chạy phần 1 xem trước, rồi phần 2 để dọn, rồi phần 3 để kiểm lại.
-- ============================================================================

-- ── 1. XEM TRƯỚC: cặp nào đang có nhiều hơn một dòng ───────────────────────
SELECT
    uio.user_id,
    uio.identified_object_id,
    COUNT(*)                       AS so_dong,
    GROUP_CONCAT(uio.mrid, ' | ')  AS cac_mrid,
    io.name                        AS ten_node
FROM user_identified_object uio
LEFT JOIN identified_object io ON io.mrid = uio.identified_object_id
GROUP BY uio.user_id, uio.identified_object_id
HAVING COUNT(*) > 1
ORDER BY so_dong DESC;


-- ── 2. DỌN: mỗi cặp giữ đúng MỘT dòng ──────────────────────────────────────
--
-- Giữ dòng theo quy ước '@u-' nếu có, vì đó là quy ước mà `ensureUserOwnership` sẽ tính
-- ra ở những lần ghi sau — giữ đúng nó thì lần ghi sau nhận diện được và không sinh thêm.
-- Không có dòng nào theo quy ước đó thì giữ dòng có rowid nhỏ nhất.
DELETE FROM user_identified_object
WHERE rowid NOT IN (
    SELECT COALESCE(
        -- ưu tiên dòng đúng quy ước '@u-'
        MIN(CASE WHEN mrid = identified_object_id || '@u-' || user_id THEN rowid END),
        MIN(rowid)
    )
    FROM user_identified_object
    GROUP BY user_id, identified_object_id
);


-- ── 3. KIỂM LẠI: phải ra 0 dòng ────────────────────────────────────────────
SELECT COUNT(*) AS con_cap_trung FROM (
    SELECT user_id, identified_object_id
    FROM user_identified_object
    GROUP BY user_id, identified_object_id
    HAVING COUNT(*) > 1
);


-- ── 4. KIỂM THÊM: không node nào bị mất chủ sau khi dọn ────────────────────
--
-- Phần 2 chỉ xoá dòng THỪA của một cặp, không bao giờ xoá dòng cuối cùng. Câu này để
-- khẳng định điều đó bằng số liệu chứ không bằng lời.
SELECT
    (SELECT COUNT(DISTINCT identified_object_id) FROM user_identified_object) AS so_doi_tuong_co_chu,
    (SELECT COUNT(*) FROM user_identified_object)                             AS tong_so_dong;
