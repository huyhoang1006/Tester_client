-- ============================================================================
-- DỌN ĐƠN VỊ ĐO HỎNG TRONG CSDL
--
-- Máy chủ từ chối upload với những lỗi kiểu:
--
--   [VALIDATE_ERROR_0037] Value "null|Hz" is not a valid FrequencyUnitEnum
--   [SURGE_ERROR_0017] Duration unit in item 1 is invalid
--
-- Đơn vị của client lưu dạng `<bội>|<đơn vị>` (ví dụ `k|V`); không có bội thì phải là `V`
-- trơn. Nhưng trong CSDL đang có ô ghi thẳng chữ `null` vào chỗ bội — `null|Hz`, `null|s`.
--
-- Bản mới đã chuẩn hoá ngay trước khi gửi lên máy chủ, nên upload chạy được mà không cần
-- file này. NHƯNG dữ liệu trong CSDL vẫn hỏng: xuất JSON, tìm kiếm, hiển thị vẫn thấy
-- chuỗi đó. File này dọn tận nơi.
--
-- Quét cả 20 bảng có cột đơn vị.
--
-- CÁCH DÙNG: chạy phần 1 xem trước → phần 2 dọn → phần 3 kiểm lại.
-- SAO LƯU FILE CSDL TRƯỚC KHI CHẠY PHẦN 2.
-- ============================================================================

-- ── 1. XEM TRƯỚC ───────────────────────────────────────────────────────────
SELECT 'active_power' AS bang, mrid, multiplier, unit, value FROM active_power
 WHERE multiplier IN ('null','undefined','NaN','none')
    OR unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE 'NaN|%' OR unit LIKE 'none|%'
    OR unit LIKE '%|' OR unit LIKE '|%'
    OR unit IN ('null','undefined','NaN')
UNION ALL
SELECT 'angle_degrees' AS bang, mrid, multiplier, unit, value FROM angle_degrees
 WHERE multiplier IN ('null','undefined','NaN','none')
    OR unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE 'NaN|%' OR unit LIKE 'none|%'
    OR unit LIKE '%|' OR unit LIKE '|%'
    OR unit IN ('null','undefined','NaN')
UNION ALL
SELECT 'apparent_power' AS bang, mrid, multiplier, unit, value FROM apparent_power
 WHERE multiplier IN ('null','undefined','NaN','none')
    OR unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE 'NaN|%' OR unit LIKE 'none|%'
    OR unit LIKE '%|' OR unit LIKE '|%'
    OR unit IN ('null','undefined','NaN')
UNION ALL
SELECT 'area' AS bang, mrid, multiplier, unit, value FROM area
 WHERE multiplier IN ('null','undefined','NaN','none')
    OR unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE 'NaN|%' OR unit LIKE 'none|%'
    OR unit LIKE '%|' OR unit LIKE '|%'
    OR unit IN ('null','undefined','NaN')
UNION ALL
SELECT 'capacitance' AS bang, mrid, multiplier, unit, value FROM capacitance
 WHERE multiplier IN ('null','undefined','NaN','none')
    OR unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE 'NaN|%' OR unit LIKE 'none|%'
    OR unit LIKE '%|' OR unit LIKE '|%'
    OR unit IN ('null','undefined','NaN')
UNION ALL
SELECT 'current_flow' AS bang, mrid, multiplier, unit, value FROM current_flow
 WHERE multiplier IN ('null','undefined','NaN','none')
    OR unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE 'NaN|%' OR unit LIKE 'none|%'
    OR unit LIKE '%|' OR unit LIKE '|%'
    OR unit IN ('null','undefined','NaN')
UNION ALL
SELECT 'frequency' AS bang, mrid, multiplier, unit, value FROM frequency
 WHERE multiplier IN ('null','undefined','NaN','none')
    OR unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE 'NaN|%' OR unit LIKE 'none|%'
    OR unit LIKE '%|' OR unit LIKE '|%'
    OR unit IN ('null','undefined','NaN')
UNION ALL
SELECT 'impedance' AS bang, mrid, multiplier, unit, value FROM impedance
 WHERE multiplier IN ('null','undefined','NaN','none')
    OR unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE 'NaN|%' OR unit LIKE 'none|%'
    OR unit LIKE '%|' OR unit LIKE '|%'
    OR unit IN ('null','undefined','NaN')
UNION ALL
SELECT 'inductance' AS bang, mrid, multiplier, unit, value FROM inductance
 WHERE multiplier IN ('null','undefined','NaN','none')
    OR unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE 'NaN|%' OR unit LIKE 'none|%'
    OR unit LIKE '%|' OR unit LIKE '|%'
    OR unit IN ('null','undefined','NaN')
UNION ALL
SELECT 'length' AS bang, mrid, multiplier, unit, value FROM length
 WHERE multiplier IN ('null','undefined','NaN','none')
    OR unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE 'NaN|%' OR unit LIKE 'none|%'
    OR unit LIKE '%|' OR unit LIKE '|%'
    OR unit IN ('null','undefined','NaN')
UNION ALL
SELECT 'mass' AS bang, mrid, multiplier, unit, value FROM mass
 WHERE multiplier IN ('null','undefined','NaN','none')
    OR unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE 'NaN|%' OR unit LIKE 'none|%'
    OR unit LIKE '%|' OR unit LIKE '|%'
    OR unit IN ('null','undefined','NaN')
UNION ALL
SELECT 'percent' AS bang, mrid, multiplier, unit, value FROM percent
 WHERE multiplier IN ('null','undefined','NaN','none')
    OR unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE 'NaN|%' OR unit LIKE 'none|%'
    OR unit LIKE '%|' OR unit LIKE '|%'
    OR unit IN ('null','undefined','NaN')
UNION ALL
SELECT 'pressure' AS bang, mrid, multiplier, unit, value FROM pressure
 WHERE multiplier IN ('null','undefined','NaN','none')
    OR unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE 'NaN|%' OR unit LIKE 'none|%'
    OR unit LIKE '%|' OR unit LIKE '|%'
    OR unit IN ('null','undefined','NaN')
UNION ALL
SELECT 'quantity_value' AS bang, mrid, multiplier, unit, value FROM quantity_value
 WHERE multiplier IN ('null','undefined','NaN','none')
    OR unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE 'NaN|%' OR unit LIKE 'none|%'
    OR unit LIKE '%|' OR unit LIKE '|%'
    OR unit IN ('null','undefined','NaN')
UNION ALL
SELECT 'reactive_power' AS bang, mrid, multiplier, unit, value FROM reactive_power
 WHERE multiplier IN ('null','undefined','NaN','none')
    OR unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE 'NaN|%' OR unit LIKE 'none|%'
    OR unit LIKE '%|' OR unit LIKE '|%'
    OR unit IN ('null','undefined','NaN')
UNION ALL
SELECT 'resistance' AS bang, mrid, multiplier, unit, value FROM resistance
 WHERE multiplier IN ('null','undefined','NaN','none')
    OR unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE 'NaN|%' OR unit LIKE 'none|%'
    OR unit LIKE '%|' OR unit LIKE '|%'
    OR unit IN ('null','undefined','NaN')
UNION ALL
SELECT 'seconds' AS bang, mrid, multiplier, unit, value FROM seconds
 WHERE multiplier IN ('null','undefined','NaN','none')
    OR unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE 'NaN|%' OR unit LIKE 'none|%'
    OR unit LIKE '%|' OR unit LIKE '|%'
    OR unit IN ('null','undefined','NaN')
UNION ALL
SELECT 'temperature' AS bang, mrid, multiplier, unit, value FROM temperature
 WHERE multiplier IN ('null','undefined','NaN','none')
    OR unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE 'NaN|%' OR unit LIKE 'none|%'
    OR unit LIKE '%|' OR unit LIKE '|%'
    OR unit IN ('null','undefined','NaN')
UNION ALL
SELECT 'voltage' AS bang, mrid, multiplier, unit, value FROM voltage
 WHERE multiplier IN ('null','undefined','NaN','none')
    OR unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE 'NaN|%' OR unit LIKE 'none|%'
    OR unit LIKE '%|' OR unit LIKE '|%'
    OR unit IN ('null','undefined','NaN')
UNION ALL
SELECT 'volume' AS bang, mrid, multiplier, unit, value FROM volume
 WHERE multiplier IN ('null','undefined','NaN','none')
    OR unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE 'NaN|%' OR unit LIKE 'none|%'
    OR unit LIKE '%|' OR unit LIKE '|%'
    OR unit IN ('null','undefined','NaN')
ORDER BY bang;


-- ── 2. DỌN ─────────────────────────────────────────────────────────────────
--
-- Ba luật, theo đúng thứ tự:
--   'null|Hz' -> 'Hz'   cắt phần bội hỏng, GIỮ đơn vị thật
--   'k|'      -> ''     có bội mà không có đơn vị thì bản thân nó đã vô nghĩa
--   multiplier = chuỗi 'null' -> NULL thật
--
-- KHÔNG đụng tới 'k|V', 'm|s' và các đơn vị hợp lệ khác.

-- active_power
UPDATE active_power SET unit = TRIM(SUBSTR(unit, INSTR(unit, '|') + 1))
 WHERE unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE 'NaN|%'
    OR unit LIKE 'none|%' OR unit LIKE '|%';
UPDATE active_power SET unit = '' WHERE unit LIKE '%|' OR unit IN ('null','undefined','NaN');
UPDATE active_power SET multiplier = NULL WHERE multiplier IN ('null','undefined','NaN','none');

-- angle_degrees
UPDATE angle_degrees SET unit = TRIM(SUBSTR(unit, INSTR(unit, '|') + 1))
 WHERE unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE 'NaN|%'
    OR unit LIKE 'none|%' OR unit LIKE '|%';
UPDATE angle_degrees SET unit = '' WHERE unit LIKE '%|' OR unit IN ('null','undefined','NaN');
UPDATE angle_degrees SET multiplier = NULL WHERE multiplier IN ('null','undefined','NaN','none');

-- apparent_power
UPDATE apparent_power SET unit = TRIM(SUBSTR(unit, INSTR(unit, '|') + 1))
 WHERE unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE 'NaN|%'
    OR unit LIKE 'none|%' OR unit LIKE '|%';
UPDATE apparent_power SET unit = '' WHERE unit LIKE '%|' OR unit IN ('null','undefined','NaN');
UPDATE apparent_power SET multiplier = NULL WHERE multiplier IN ('null','undefined','NaN','none');

-- area
UPDATE area SET unit = TRIM(SUBSTR(unit, INSTR(unit, '|') + 1))
 WHERE unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE 'NaN|%'
    OR unit LIKE 'none|%' OR unit LIKE '|%';
UPDATE area SET unit = '' WHERE unit LIKE '%|' OR unit IN ('null','undefined','NaN');
UPDATE area SET multiplier = NULL WHERE multiplier IN ('null','undefined','NaN','none');

-- capacitance
UPDATE capacitance SET unit = TRIM(SUBSTR(unit, INSTR(unit, '|') + 1))
 WHERE unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE 'NaN|%'
    OR unit LIKE 'none|%' OR unit LIKE '|%';
UPDATE capacitance SET unit = '' WHERE unit LIKE '%|' OR unit IN ('null','undefined','NaN');
UPDATE capacitance SET multiplier = NULL WHERE multiplier IN ('null','undefined','NaN','none');

-- current_flow
UPDATE current_flow SET unit = TRIM(SUBSTR(unit, INSTR(unit, '|') + 1))
 WHERE unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE 'NaN|%'
    OR unit LIKE 'none|%' OR unit LIKE '|%';
UPDATE current_flow SET unit = '' WHERE unit LIKE '%|' OR unit IN ('null','undefined','NaN');
UPDATE current_flow SET multiplier = NULL WHERE multiplier IN ('null','undefined','NaN','none');

-- frequency
UPDATE frequency SET unit = TRIM(SUBSTR(unit, INSTR(unit, '|') + 1))
 WHERE unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE 'NaN|%'
    OR unit LIKE 'none|%' OR unit LIKE '|%';
UPDATE frequency SET unit = '' WHERE unit LIKE '%|' OR unit IN ('null','undefined','NaN');
UPDATE frequency SET multiplier = NULL WHERE multiplier IN ('null','undefined','NaN','none');

-- impedance
UPDATE impedance SET unit = TRIM(SUBSTR(unit, INSTR(unit, '|') + 1))
 WHERE unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE 'NaN|%'
    OR unit LIKE 'none|%' OR unit LIKE '|%';
UPDATE impedance SET unit = '' WHERE unit LIKE '%|' OR unit IN ('null','undefined','NaN');
UPDATE impedance SET multiplier = NULL WHERE multiplier IN ('null','undefined','NaN','none');

-- inductance
UPDATE inductance SET unit = TRIM(SUBSTR(unit, INSTR(unit, '|') + 1))
 WHERE unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE 'NaN|%'
    OR unit LIKE 'none|%' OR unit LIKE '|%';
UPDATE inductance SET unit = '' WHERE unit LIKE '%|' OR unit IN ('null','undefined','NaN');
UPDATE inductance SET multiplier = NULL WHERE multiplier IN ('null','undefined','NaN','none');

-- length
UPDATE length SET unit = TRIM(SUBSTR(unit, INSTR(unit, '|') + 1))
 WHERE unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE 'NaN|%'
    OR unit LIKE 'none|%' OR unit LIKE '|%';
UPDATE length SET unit = '' WHERE unit LIKE '%|' OR unit IN ('null','undefined','NaN');
UPDATE length SET multiplier = NULL WHERE multiplier IN ('null','undefined','NaN','none');

-- mass
UPDATE mass SET unit = TRIM(SUBSTR(unit, INSTR(unit, '|') + 1))
 WHERE unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE 'NaN|%'
    OR unit LIKE 'none|%' OR unit LIKE '|%';
UPDATE mass SET unit = '' WHERE unit LIKE '%|' OR unit IN ('null','undefined','NaN');
UPDATE mass SET multiplier = NULL WHERE multiplier IN ('null','undefined','NaN','none');

-- percent
UPDATE percent SET unit = TRIM(SUBSTR(unit, INSTR(unit, '|') + 1))
 WHERE unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE 'NaN|%'
    OR unit LIKE 'none|%' OR unit LIKE '|%';
UPDATE percent SET unit = '' WHERE unit LIKE '%|' OR unit IN ('null','undefined','NaN');
UPDATE percent SET multiplier = NULL WHERE multiplier IN ('null','undefined','NaN','none');

-- pressure
UPDATE pressure SET unit = TRIM(SUBSTR(unit, INSTR(unit, '|') + 1))
 WHERE unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE 'NaN|%'
    OR unit LIKE 'none|%' OR unit LIKE '|%';
UPDATE pressure SET unit = '' WHERE unit LIKE '%|' OR unit IN ('null','undefined','NaN');
UPDATE pressure SET multiplier = NULL WHERE multiplier IN ('null','undefined','NaN','none');

-- quantity_value
UPDATE quantity_value SET unit = TRIM(SUBSTR(unit, INSTR(unit, '|') + 1))
 WHERE unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE 'NaN|%'
    OR unit LIKE 'none|%' OR unit LIKE '|%';
UPDATE quantity_value SET unit = '' WHERE unit LIKE '%|' OR unit IN ('null','undefined','NaN');
UPDATE quantity_value SET multiplier = NULL WHERE multiplier IN ('null','undefined','NaN','none');

-- reactive_power
UPDATE reactive_power SET unit = TRIM(SUBSTR(unit, INSTR(unit, '|') + 1))
 WHERE unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE 'NaN|%'
    OR unit LIKE 'none|%' OR unit LIKE '|%';
UPDATE reactive_power SET unit = '' WHERE unit LIKE '%|' OR unit IN ('null','undefined','NaN');
UPDATE reactive_power SET multiplier = NULL WHERE multiplier IN ('null','undefined','NaN','none');

-- resistance
UPDATE resistance SET unit = TRIM(SUBSTR(unit, INSTR(unit, '|') + 1))
 WHERE unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE 'NaN|%'
    OR unit LIKE 'none|%' OR unit LIKE '|%';
UPDATE resistance SET unit = '' WHERE unit LIKE '%|' OR unit IN ('null','undefined','NaN');
UPDATE resistance SET multiplier = NULL WHERE multiplier IN ('null','undefined','NaN','none');

-- seconds
UPDATE seconds SET unit = TRIM(SUBSTR(unit, INSTR(unit, '|') + 1))
 WHERE unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE 'NaN|%'
    OR unit LIKE 'none|%' OR unit LIKE '|%';
UPDATE seconds SET unit = '' WHERE unit LIKE '%|' OR unit IN ('null','undefined','NaN');
UPDATE seconds SET multiplier = NULL WHERE multiplier IN ('null','undefined','NaN','none');

-- temperature
UPDATE temperature SET unit = TRIM(SUBSTR(unit, INSTR(unit, '|') + 1))
 WHERE unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE 'NaN|%'
    OR unit LIKE 'none|%' OR unit LIKE '|%';
UPDATE temperature SET unit = '' WHERE unit LIKE '%|' OR unit IN ('null','undefined','NaN');
UPDATE temperature SET multiplier = NULL WHERE multiplier IN ('null','undefined','NaN','none');

-- voltage
UPDATE voltage SET unit = TRIM(SUBSTR(unit, INSTR(unit, '|') + 1))
 WHERE unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE 'NaN|%'
    OR unit LIKE 'none|%' OR unit LIKE '|%';
UPDATE voltage SET unit = '' WHERE unit LIKE '%|' OR unit IN ('null','undefined','NaN');
UPDATE voltage SET multiplier = NULL WHERE multiplier IN ('null','undefined','NaN','none');

-- volume
UPDATE volume SET unit = TRIM(SUBSTR(unit, INSTR(unit, '|') + 1))
 WHERE unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE 'NaN|%'
    OR unit LIKE 'none|%' OR unit LIKE '|%';
UPDATE volume SET unit = '' WHERE unit LIKE '%|' OR unit IN ('null','undefined','NaN');
UPDATE volume SET multiplier = NULL WHERE multiplier IN ('null','undefined','NaN','none');


-- ── 3. KIỂM LẠI: phải ra 0 dòng ────────────────────────────────────────────
SELECT COUNT(*) AS con_hong FROM (
SELECT 'active_power' AS bang, mrid, multiplier, unit, value FROM active_power
 WHERE multiplier IN ('null','undefined','NaN','none')
    OR unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE 'NaN|%' OR unit LIKE 'none|%'
    OR unit LIKE '%|' OR unit LIKE '|%'
    OR unit IN ('null','undefined','NaN')
UNION ALL
SELECT 'angle_degrees' AS bang, mrid, multiplier, unit, value FROM angle_degrees
 WHERE multiplier IN ('null','undefined','NaN','none')
    OR unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE 'NaN|%' OR unit LIKE 'none|%'
    OR unit LIKE '%|' OR unit LIKE '|%'
    OR unit IN ('null','undefined','NaN')
UNION ALL
SELECT 'apparent_power' AS bang, mrid, multiplier, unit, value FROM apparent_power
 WHERE multiplier IN ('null','undefined','NaN','none')
    OR unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE 'NaN|%' OR unit LIKE 'none|%'
    OR unit LIKE '%|' OR unit LIKE '|%'
    OR unit IN ('null','undefined','NaN')
UNION ALL
SELECT 'area' AS bang, mrid, multiplier, unit, value FROM area
 WHERE multiplier IN ('null','undefined','NaN','none')
    OR unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE 'NaN|%' OR unit LIKE 'none|%'
    OR unit LIKE '%|' OR unit LIKE '|%'
    OR unit IN ('null','undefined','NaN')
UNION ALL
SELECT 'capacitance' AS bang, mrid, multiplier, unit, value FROM capacitance
 WHERE multiplier IN ('null','undefined','NaN','none')
    OR unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE 'NaN|%' OR unit LIKE 'none|%'
    OR unit LIKE '%|' OR unit LIKE '|%'
    OR unit IN ('null','undefined','NaN')
UNION ALL
SELECT 'current_flow' AS bang, mrid, multiplier, unit, value FROM current_flow
 WHERE multiplier IN ('null','undefined','NaN','none')
    OR unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE 'NaN|%' OR unit LIKE 'none|%'
    OR unit LIKE '%|' OR unit LIKE '|%'
    OR unit IN ('null','undefined','NaN')
UNION ALL
SELECT 'frequency' AS bang, mrid, multiplier, unit, value FROM frequency
 WHERE multiplier IN ('null','undefined','NaN','none')
    OR unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE 'NaN|%' OR unit LIKE 'none|%'
    OR unit LIKE '%|' OR unit LIKE '|%'
    OR unit IN ('null','undefined','NaN')
UNION ALL
SELECT 'impedance' AS bang, mrid, multiplier, unit, value FROM impedance
 WHERE multiplier IN ('null','undefined','NaN','none')
    OR unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE 'NaN|%' OR unit LIKE 'none|%'
    OR unit LIKE '%|' OR unit LIKE '|%'
    OR unit IN ('null','undefined','NaN')
UNION ALL
SELECT 'inductance' AS bang, mrid, multiplier, unit, value FROM inductance
 WHERE multiplier IN ('null','undefined','NaN','none')
    OR unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE 'NaN|%' OR unit LIKE 'none|%'
    OR unit LIKE '%|' OR unit LIKE '|%'
    OR unit IN ('null','undefined','NaN')
UNION ALL
SELECT 'length' AS bang, mrid, multiplier, unit, value FROM length
 WHERE multiplier IN ('null','undefined','NaN','none')
    OR unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE 'NaN|%' OR unit LIKE 'none|%'
    OR unit LIKE '%|' OR unit LIKE '|%'
    OR unit IN ('null','undefined','NaN')
UNION ALL
SELECT 'mass' AS bang, mrid, multiplier, unit, value FROM mass
 WHERE multiplier IN ('null','undefined','NaN','none')
    OR unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE 'NaN|%' OR unit LIKE 'none|%'
    OR unit LIKE '%|' OR unit LIKE '|%'
    OR unit IN ('null','undefined','NaN')
UNION ALL
SELECT 'percent' AS bang, mrid, multiplier, unit, value FROM percent
 WHERE multiplier IN ('null','undefined','NaN','none')
    OR unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE 'NaN|%' OR unit LIKE 'none|%'
    OR unit LIKE '%|' OR unit LIKE '|%'
    OR unit IN ('null','undefined','NaN')
UNION ALL
SELECT 'pressure' AS bang, mrid, multiplier, unit, value FROM pressure
 WHERE multiplier IN ('null','undefined','NaN','none')
    OR unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE 'NaN|%' OR unit LIKE 'none|%'
    OR unit LIKE '%|' OR unit LIKE '|%'
    OR unit IN ('null','undefined','NaN')
UNION ALL
SELECT 'quantity_value' AS bang, mrid, multiplier, unit, value FROM quantity_value
 WHERE multiplier IN ('null','undefined','NaN','none')
    OR unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE 'NaN|%' OR unit LIKE 'none|%'
    OR unit LIKE '%|' OR unit LIKE '|%'
    OR unit IN ('null','undefined','NaN')
UNION ALL
SELECT 'reactive_power' AS bang, mrid, multiplier, unit, value FROM reactive_power
 WHERE multiplier IN ('null','undefined','NaN','none')
    OR unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE 'NaN|%' OR unit LIKE 'none|%'
    OR unit LIKE '%|' OR unit LIKE '|%'
    OR unit IN ('null','undefined','NaN')
UNION ALL
SELECT 'resistance' AS bang, mrid, multiplier, unit, value FROM resistance
 WHERE multiplier IN ('null','undefined','NaN','none')
    OR unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE 'NaN|%' OR unit LIKE 'none|%'
    OR unit LIKE '%|' OR unit LIKE '|%'
    OR unit IN ('null','undefined','NaN')
UNION ALL
SELECT 'seconds' AS bang, mrid, multiplier, unit, value FROM seconds
 WHERE multiplier IN ('null','undefined','NaN','none')
    OR unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE 'NaN|%' OR unit LIKE 'none|%'
    OR unit LIKE '%|' OR unit LIKE '|%'
    OR unit IN ('null','undefined','NaN')
UNION ALL
SELECT 'temperature' AS bang, mrid, multiplier, unit, value FROM temperature
 WHERE multiplier IN ('null','undefined','NaN','none')
    OR unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE 'NaN|%' OR unit LIKE 'none|%'
    OR unit LIKE '%|' OR unit LIKE '|%'
    OR unit IN ('null','undefined','NaN')
UNION ALL
SELECT 'voltage' AS bang, mrid, multiplier, unit, value FROM voltage
 WHERE multiplier IN ('null','undefined','NaN','none')
    OR unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE 'NaN|%' OR unit LIKE 'none|%'
    OR unit LIKE '%|' OR unit LIKE '|%'
    OR unit IN ('null','undefined','NaN')
UNION ALL
SELECT 'volume' AS bang, mrid, multiplier, unit, value FROM volume
 WHERE multiplier IN ('null','undefined','NaN','none')
    OR unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE 'NaN|%' OR unit LIKE 'none|%'
    OR unit LIKE '%|' OR unit LIKE '|%'
    OR unit IN ('null','undefined','NaN')
);
