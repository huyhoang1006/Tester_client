-- ============================================================================
-- DON RAC BANG `attachment`
-- ============================================================================
--
-- Bang `attachment` khong co khoa ngoai nao. `id_foreign` la con tro DA HINH:
-- cung mot cot tro sang asset / old_work / work_task / substation / organisation,
-- phan biet bang cot `type`. SQLite khong the cascade tren mot cot nhu vay, nen
-- moi duong xoa phai tu don — va cho nao quen thi dong do nam lai mai mai.
--
-- Ban va trong code (uploadAttachmentTransaction) chan KHONG SINH THEM rac tu gio.
-- File nay don so da tich luy TRUOC do.
--
-- CACH DUNG: mo trong DB Browser for SQLite (nho nhap mat khau sqlcipher).
-- Chay tung phan. PHAN 1 va 2 chi DEM, khong sua gi — xem so truoc da.
-- ============================================================================


-- ── PHAN 1: dong MO COI (chu da bi xoa) ────────────────────────────────────
-- Moi dong o day la rac chac chan: khong con doi tuong nao tro toi.

SELECT 'asset'        AS loai, COUNT(*) AS so_dong FROM attachment
 WHERE type = 'asset'        AND id_foreign NOT IN (SELECT mrid FROM asset)
UNION ALL
SELECT 'job',          COUNT(*) FROM attachment
 WHERE type = 'job'          AND id_foreign NOT IN (SELECT mrid FROM old_work)
UNION ALL
SELECT 'test',         COUNT(*) FROM attachment
 WHERE type = 'test'         AND id_foreign NOT IN (SELECT mrid FROM work_task)
UNION ALL
SELECT 'substation',   COUNT(*) FROM attachment
 WHERE type = 'substation'   AND id_foreign NOT IN (SELECT mrid FROM substation)
UNION ALL
SELECT 'organisation', COUNT(*) FROM attachment
 WHERE type = 'organisation' AND id_foreign NOT IN (SELECT mrid FROM organisation)
UNION ALL
SELECT 'type LA (khong ro chu)', COUNT(*) FROM attachment
 WHERE type IS NULL OR type NOT IN ('asset','job','test','substation','organisation')
UNION ALL
SELECT '--- TONG BANG ---', COUNT(*) FROM attachment;


-- ── PHAN 2: dong TRUNG CHU (chu con song nhung co >1 dong) ─────────────────
-- Day la dau vet cua loi cu: ON CONFLICT(id) khong chan duoc dong thu hai cho
-- cung mot (id_foreign, type). Doc chi thay mot dong, xoa cung chi xoa mot dong.
--
-- Chay SELECT nay TRUOC khi don, de biet co bao nhieu va cua ai.

SELECT type, id_foreign, COUNT(*) AS so_dong, GROUP_CONCAT(id, ' | ') AS cac_id
  FROM attachment
 GROUP BY type, id_foreign
HAVING COUNT(*) > 1
 ORDER BY so_dong DESC;


-- ── PHAN 3: DON (chi chay sau khi da xem PHAN 1 va 2) ──────────────────────
--
-- SAO LUU FILE DB TRUOC. Khong co Undo.
--
-- Bo dau `--` o cac dong duoi de chay.
--
-- 3a) Xoa dong mo coi.
--
--   Luu y: chi xoa BAN GHI trong DB. File vat ly nam trong thu muc attachment
--   theo mrid cua chu; chu da bi xoa thi thu muc do le ra cung da bi xoa cung
--   luc (deleteDirectory). Neu con sot thi phai don bang tay ngoai file system.

-- DELETE FROM attachment WHERE type = 'asset'        AND id_foreign NOT IN (SELECT mrid FROM asset);
-- DELETE FROM attachment WHERE type = 'job'          AND id_foreign NOT IN (SELECT mrid FROM old_work);
-- DELETE FROM attachment WHERE type = 'test'         AND id_foreign NOT IN (SELECT mrid FROM work_task);
-- DELETE FROM attachment WHERE type = 'substation'   AND id_foreign NOT IN (SELECT mrid FROM substation);
-- DELETE FROM attachment WHERE type = 'organisation' AND id_foreign NOT IN (SELECT mrid FROM organisation);

-- 3b) Voi chu con song co nhieu dong: giu dong CO DU LIEU path, bo cac dong con lai.
--
--     Chon theo path chu khong theo rowid: dong duoc giu phai la dong dang tro
--     tới file thật. Sap xep de dong co path khac '[]' va khac rong len dau, roi
--     giu dong dau tien cua moi nhom.

-- DELETE FROM attachment
--  WHERE rowid NOT IN (
--      SELECT rowid FROM (
--          SELECT rowid,
--                 ROW_NUMBER() OVER (
--                     PARTITION BY type, id_foreign
--                     ORDER BY CASE
--                                  WHEN path IS NULL      THEN 3
--                                  WHEN path IN ('', '[]') THEN 2
--                                  ELSE 1
--                              END,
--                              rowid
--                 ) AS uu_tien
--            FROM attachment
--      )
--      WHERE uu_tien = 1
--  );


-- ── PHAN 4: kiem lai sau khi don ───────────────────────────────────────────
-- Chay lai PHAN 1 va PHAN 2. Ca hai phai ve 0 (tru dong TONG BANG).
--
-- Sau do bat mot rang buoc de van de nay khong the tai dien o tang DB, khong chi
-- o tang code. Chi chay khi PHAN 2 da ve 0 — con dong trung thi lenh nay se loi.

-- CREATE UNIQUE INDEX IF NOT EXISTS idx_attachment_owner
--     ON attachment (id_foreign, type);
