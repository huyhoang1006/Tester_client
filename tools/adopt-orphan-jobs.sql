-- ============================================================================
-- NHẬN LẠI JOB MỒ CÔI — job nằm trong CSDL nhưng KHÔNG có chủ sở hữu.
--
-- Mọi truy vấn cây đều join `user_identified_object`. Bản ghi không có dòng ở bảng đó thì
-- nằm im trong CSDL mà không hiện trên cây, và bấm refresh bao nhiêu lần cũng vô ích vì
-- chính câu truy vấn đã loại nó ra.
--
-- Sinh ra từ bản import PTM đầu: nó lưu job xong nhưng quên ghi quyền sở hữu (luồng lưu
-- job bình thường có gọi, import thì không). Lỗi đã sửa ở mã nguồn; file này để dọn những
-- job đã lỡ tạo trước khi sửa.
--
-- CÁCH DÙNG: thay :user_id bằng id người dùng thật rồi chạy từng phần một.
-- ============================================================================

-- ── 1. XEM TRƯỚC: có bao nhiêu job mồ côi, của ai ──────────────────────────
-- Chạy phần này TRƯỚC. Nếu ra 0 dòng thì không có gì phải làm.
SELECT
    ow.mrid                AS job_mrid,
    io.name                AS job_name,
    ow.execution_date      AS execution_date,
    ow.asset_id            AS asset_mrid,
    aio.name               AS asset_name,
    CASE WHEN uio_asset.identified_object_id IS NULL
         THEN 'asset cung mo coi'
         ELSE 'asset co chu' END AS asset_status
FROM old_work ow
LEFT JOIN identified_object io  ON io.mrid  = ow.mrid
LEFT JOIN identified_object aio ON aio.mrid = ow.asset_id
LEFT JOIN user_identified_object uio       ON uio.identified_object_id = ow.mrid
LEFT JOIN user_identified_object uio_asset ON uio_asset.identified_object_id = ow.asset_id
WHERE uio.identified_object_id IS NULL
ORDER BY ow.execution_date DESC;


-- ── 2. NHẬN LẠI: gán job mồ côi cho ĐÚNG chủ của asset chứa nó ─────────────
--
-- Lấy chủ theo ASSET chứ không gán cứng một user: nếu máy có nhiều tài khoản thì gán bừa
-- là đẩy job sang cây của người khác. Job nào có asset cũng mồ côi thì phần này bỏ qua —
-- xử lý asset trước.
--
-- `mrid` của dòng quyền sở hữu theo đúng quy ước mã nguồn đang dùng: '<id>@u-<user_id>'.
INSERT INTO user_identified_object (mrid, user_id, identified_object_id)
SELECT
    ow.mrid || '@u-' || uio_asset.user_id,
    uio_asset.user_id,
    ow.mrid
FROM old_work ow
JOIN user_identified_object uio_asset ON uio_asset.identified_object_id = ow.asset_id
LEFT JOIN user_identified_object uio  ON uio.identified_object_id = ow.mrid
WHERE uio.identified_object_id IS NULL;


-- ── 3. KIỂM LẠI: phải ra 0 dòng ────────────────────────────────────────────
SELECT COUNT(*) AS con_mo_coi
FROM old_work ow
LEFT JOIN user_identified_object uio ON uio.identified_object_id = ow.mrid
WHERE uio.identified_object_id IS NULL;


-- ── 4. XOÁ HẲN thay vì nhận lại (nếu muốn import lại từ đầu) ───────────────
--
-- CHỈ chạy nếu chắc chắn muốn bỏ. Khoá ngoại CASCADE sẽ kéo theo work_task,
-- procedure_dataset, các giá trị đo, đường cong và điểm knee.
--
-- Bật khoá ngoại trước, nếu không CASCADE không chạy và để lại một đống dòng mồ côi mới.
--
--   PRAGMA foreign_keys = ON;
--
--   DELETE FROM old_work
--   WHERE mrid IN (
--       SELECT ow.mrid FROM old_work ow
--       LEFT JOIN user_identified_object uio ON uio.identified_object_id = ow.mrid
--       WHERE uio.identified_object_id IS NULL
--   );
