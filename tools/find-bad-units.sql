-- ============================================================================
-- SOI ĐƠN VỊ ĐO HỎNG TRONG CSDL
--
-- Máy chủ trả về những lỗi kiểu:
--
--   [VALIDATE_ERROR_0037] Value "null|Hz" is not a valid FrequencyUnitEnum
--   [SURGE_ERROR_0017] Duration unit in item 1 is invalid
--
-- Chuỗi "null|Hz" nghĩa là đâu đó đã nối chữ `null` vào đơn vị rồi LƯU LẠI. Tôi đã rà
-- toàn bộ mapper phía client và KHÔNG tìm thấy chỗ nào còn tạo ra chuỗi đó, nên nhiều khả
-- năng nó đã nằm sẵn trong CSDL từ trước (hoặc do một bản cũ, hoặc do tải về từ máy chủ).
--
-- Câu này soi cả 20 bảng có cột đơn vị. Chạy xong gửi kết quả để biết chính xác bảng nào,
-- dòng nào — rồi mới sửa đúng chỗ thay vì đoán.
-- ============================================================================

-- ── 1. LIỆT KÊ mọi dòng có đơn vị hỏng ─────────────────────────────────────
SELECT 'active_power' AS bang, mrid, multiplier, unit, value
  FROM active_power
 WHERE multiplier IN ('null','undefined','NaN','')
    OR unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE '%|'
    OR unit IN ('null','undefined','NaN')
UNION ALL
SELECT 'angle_degrees' AS bang, mrid, multiplier, unit, value
  FROM angle_degrees
 WHERE multiplier IN ('null','undefined','NaN','')
    OR unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE '%|'
    OR unit IN ('null','undefined','NaN')
UNION ALL
SELECT 'apparent_power' AS bang, mrid, multiplier, unit, value
  FROM apparent_power
 WHERE multiplier IN ('null','undefined','NaN','')
    OR unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE '%|'
    OR unit IN ('null','undefined','NaN')
UNION ALL
SELECT 'area' AS bang, mrid, multiplier, unit, value
  FROM area
 WHERE multiplier IN ('null','undefined','NaN','')
    OR unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE '%|'
    OR unit IN ('null','undefined','NaN')
UNION ALL
SELECT 'capacitance' AS bang, mrid, multiplier, unit, value
  FROM capacitance
 WHERE multiplier IN ('null','undefined','NaN','')
    OR unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE '%|'
    OR unit IN ('null','undefined','NaN')
UNION ALL
SELECT 'current_flow' AS bang, mrid, multiplier, unit, value
  FROM current_flow
 WHERE multiplier IN ('null','undefined','NaN','')
    OR unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE '%|'
    OR unit IN ('null','undefined','NaN')
UNION ALL
SELECT 'frequency' AS bang, mrid, multiplier, unit, value
  FROM frequency
 WHERE multiplier IN ('null','undefined','NaN','')
    OR unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE '%|'
    OR unit IN ('null','undefined','NaN')
UNION ALL
SELECT 'impedance' AS bang, mrid, multiplier, unit, value
  FROM impedance
 WHERE multiplier IN ('null','undefined','NaN','')
    OR unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE '%|'
    OR unit IN ('null','undefined','NaN')
UNION ALL
SELECT 'inductance' AS bang, mrid, multiplier, unit, value
  FROM inductance
 WHERE multiplier IN ('null','undefined','NaN','')
    OR unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE '%|'
    OR unit IN ('null','undefined','NaN')
UNION ALL
SELECT 'length' AS bang, mrid, multiplier, unit, value
  FROM length
 WHERE multiplier IN ('null','undefined','NaN','')
    OR unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE '%|'
    OR unit IN ('null','undefined','NaN')
UNION ALL
SELECT 'mass' AS bang, mrid, multiplier, unit, value
  FROM mass
 WHERE multiplier IN ('null','undefined','NaN','')
    OR unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE '%|'
    OR unit IN ('null','undefined','NaN')
UNION ALL
SELECT 'percent' AS bang, mrid, multiplier, unit, value
  FROM percent
 WHERE multiplier IN ('null','undefined','NaN','')
    OR unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE '%|'
    OR unit IN ('null','undefined','NaN')
UNION ALL
SELECT 'pressure' AS bang, mrid, multiplier, unit, value
  FROM pressure
 WHERE multiplier IN ('null','undefined','NaN','')
    OR unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE '%|'
    OR unit IN ('null','undefined','NaN')
UNION ALL
SELECT 'quantity_value' AS bang, mrid, multiplier, unit, value
  FROM quantity_value
 WHERE multiplier IN ('null','undefined','NaN','')
    OR unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE '%|'
    OR unit IN ('null','undefined','NaN')
UNION ALL
SELECT 'reactive_power' AS bang, mrid, multiplier, unit, value
  FROM reactive_power
 WHERE multiplier IN ('null','undefined','NaN','')
    OR unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE '%|'
    OR unit IN ('null','undefined','NaN')
UNION ALL
SELECT 'resistance' AS bang, mrid, multiplier, unit, value
  FROM resistance
 WHERE multiplier IN ('null','undefined','NaN','')
    OR unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE '%|'
    OR unit IN ('null','undefined','NaN')
UNION ALL
SELECT 'seconds' AS bang, mrid, multiplier, unit, value
  FROM seconds
 WHERE multiplier IN ('null','undefined','NaN','')
    OR unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE '%|'
    OR unit IN ('null','undefined','NaN')
UNION ALL
SELECT 'temperature' AS bang, mrid, multiplier, unit, value
  FROM temperature
 WHERE multiplier IN ('null','undefined','NaN','')
    OR unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE '%|'
    OR unit IN ('null','undefined','NaN')
UNION ALL
SELECT 'voltage' AS bang, mrid, multiplier, unit, value
  FROM voltage
 WHERE multiplier IN ('null','undefined','NaN','')
    OR unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE '%|'
    OR unit IN ('null','undefined','NaN')
UNION ALL
SELECT 'volume' AS bang, mrid, multiplier, unit, value
  FROM volume
 WHERE multiplier IN ('null','undefined','NaN','')
    OR unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE '%|'
    OR unit IN ('null','undefined','NaN')
ORDER BY bang;


-- ── 2. ĐẾM theo bảng, xem mức độ ───────────────────────────────────────────
SELECT bang, COUNT(*) AS so_dong FROM (
SELECT 'active_power' AS bang, mrid, multiplier, unit, value
  FROM active_power
 WHERE multiplier IN ('null','undefined','NaN','')
    OR unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE '%|'
    OR unit IN ('null','undefined','NaN')
UNION ALL
SELECT 'angle_degrees' AS bang, mrid, multiplier, unit, value
  FROM angle_degrees
 WHERE multiplier IN ('null','undefined','NaN','')
    OR unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE '%|'
    OR unit IN ('null','undefined','NaN')
UNION ALL
SELECT 'apparent_power' AS bang, mrid, multiplier, unit, value
  FROM apparent_power
 WHERE multiplier IN ('null','undefined','NaN','')
    OR unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE '%|'
    OR unit IN ('null','undefined','NaN')
UNION ALL
SELECT 'area' AS bang, mrid, multiplier, unit, value
  FROM area
 WHERE multiplier IN ('null','undefined','NaN','')
    OR unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE '%|'
    OR unit IN ('null','undefined','NaN')
UNION ALL
SELECT 'capacitance' AS bang, mrid, multiplier, unit, value
  FROM capacitance
 WHERE multiplier IN ('null','undefined','NaN','')
    OR unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE '%|'
    OR unit IN ('null','undefined','NaN')
UNION ALL
SELECT 'current_flow' AS bang, mrid, multiplier, unit, value
  FROM current_flow
 WHERE multiplier IN ('null','undefined','NaN','')
    OR unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE '%|'
    OR unit IN ('null','undefined','NaN')
UNION ALL
SELECT 'frequency' AS bang, mrid, multiplier, unit, value
  FROM frequency
 WHERE multiplier IN ('null','undefined','NaN','')
    OR unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE '%|'
    OR unit IN ('null','undefined','NaN')
UNION ALL
SELECT 'impedance' AS bang, mrid, multiplier, unit, value
  FROM impedance
 WHERE multiplier IN ('null','undefined','NaN','')
    OR unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE '%|'
    OR unit IN ('null','undefined','NaN')
UNION ALL
SELECT 'inductance' AS bang, mrid, multiplier, unit, value
  FROM inductance
 WHERE multiplier IN ('null','undefined','NaN','')
    OR unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE '%|'
    OR unit IN ('null','undefined','NaN')
UNION ALL
SELECT 'length' AS bang, mrid, multiplier, unit, value
  FROM length
 WHERE multiplier IN ('null','undefined','NaN','')
    OR unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE '%|'
    OR unit IN ('null','undefined','NaN')
UNION ALL
SELECT 'mass' AS bang, mrid, multiplier, unit, value
  FROM mass
 WHERE multiplier IN ('null','undefined','NaN','')
    OR unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE '%|'
    OR unit IN ('null','undefined','NaN')
UNION ALL
SELECT 'percent' AS bang, mrid, multiplier, unit, value
  FROM percent
 WHERE multiplier IN ('null','undefined','NaN','')
    OR unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE '%|'
    OR unit IN ('null','undefined','NaN')
UNION ALL
SELECT 'pressure' AS bang, mrid, multiplier, unit, value
  FROM pressure
 WHERE multiplier IN ('null','undefined','NaN','')
    OR unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE '%|'
    OR unit IN ('null','undefined','NaN')
UNION ALL
SELECT 'quantity_value' AS bang, mrid, multiplier, unit, value
  FROM quantity_value
 WHERE multiplier IN ('null','undefined','NaN','')
    OR unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE '%|'
    OR unit IN ('null','undefined','NaN')
UNION ALL
SELECT 'reactive_power' AS bang, mrid, multiplier, unit, value
  FROM reactive_power
 WHERE multiplier IN ('null','undefined','NaN','')
    OR unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE '%|'
    OR unit IN ('null','undefined','NaN')
UNION ALL
SELECT 'resistance' AS bang, mrid, multiplier, unit, value
  FROM resistance
 WHERE multiplier IN ('null','undefined','NaN','')
    OR unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE '%|'
    OR unit IN ('null','undefined','NaN')
UNION ALL
SELECT 'seconds' AS bang, mrid, multiplier, unit, value
  FROM seconds
 WHERE multiplier IN ('null','undefined','NaN','')
    OR unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE '%|'
    OR unit IN ('null','undefined','NaN')
UNION ALL
SELECT 'temperature' AS bang, mrid, multiplier, unit, value
  FROM temperature
 WHERE multiplier IN ('null','undefined','NaN','')
    OR unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE '%|'
    OR unit IN ('null','undefined','NaN')
UNION ALL
SELECT 'voltage' AS bang, mrid, multiplier, unit, value
  FROM voltage
 WHERE multiplier IN ('null','undefined','NaN','')
    OR unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE '%|'
    OR unit IN ('null','undefined','NaN')
UNION ALL
SELECT 'volume' AS bang, mrid, multiplier, unit, value
  FROM volume
 WHERE multiplier IN ('null','undefined','NaN','')
    OR unit LIKE 'null|%' OR unit LIKE 'undefined|%' OR unit LIKE '%|'
    OR unit IN ('null','undefined','NaN')
) GROUP BY bang ORDER BY so_dong DESC;
