import db from '../../datacontext/index'

/**
 * ĐIỂM ĐO CỦA ĐƯỜNG CONG TỪ HOÁ (CT Excitation).
 *
 * Mỗi dòng của bảng test — tức một cuộn / một tổ hợp tap — có một đường cong riêng gồm
 * 32–39 cặp (dòng, áp). Bảng chính chỉ giữ đúng ĐIỂM KNEE; toàn bộ phần còn lại của
 * đường cong nằm ở đây.
 *
 * ─── VÌ SAO ĐẶT TÊN RIÊNG CHO CT, KHÔNG LÀM BẢNG CHUNG ───────────────────────
 *
 * Bản đầu tôi làm bảng chung `test_curve_point` với hai trục `x`/`y`. Kiểm lại thì trong
 * CẢ HAI file .ptm mẫu, chỉ `tCTExcitationTest` có chuỗi điểm trong XML. Đường cong hành
 * trình, dòng cuộn cắt, dòng động cơ của CIBANO nằm trong file `.blob` nhị phân — định
 * dạng riêng của OMICRON, chưa đọc được và có thể không bao giờ đọc.
 *
 * Nên bảng chung là khái quát cho trường hợp CHƯA XÁC MINH là có. Cái giá có thật: ai đọc
 * `x_value` cũng phải đi tra `curve_type` mới biết đó là đại lượng gì, trong khi hôm nay
 * chỉ có một câu trả lời. Ngày nào đọc được blob thì dựng bảng cho loại đó — lúc ấy đã
 * biết nó thật sự cần cột gì.
 *
 * ─── HAI RÀNG BUỘC ĐÃ KIỂM BẰNG SQLITE THẬT ──────────────────────────────────
 *
 *   sequence_number NOT NULL — đường cong CÓ thứ tự, SQLite không hứa gì nếu thiếu
 *   ORDER BY. Mất thứ tự thì nối điểm ra zigzag, nhìn vào không phân biệt được dữ liệu
 *   sai hay vẽ sai.
 *
 *   ON DELETE CASCADE theo procedure_dataset — xoá dòng test là điểm đo đi theo. Đúng thứ
 *   bảng `attachment` không có, và hậu quả là hàng nghìn dòng mồ côi phải dọn tay.
 */

/**
 * Ghi TOÀN BỘ đường cong của một dòng: xoá sạch điểm cũ rồi chèn điểm mới.
 *
 * Không cập nhật từng điểm. Số điểm mỗi lần đo một khác (39, 32, 33…); sửa từng điểm thì
 * lần đo mới ít điểm hơn sẽ để lại đuôi thừa của lần trước — và cái đuôi đó nối vào đồ
 * thị trông y hệt dữ liệu thật.
 *
 * @param {string} datasetId procedure_dataset.mrid — dòng trong bảng test
 * @param {Array}  points    [{ mrid, current, voltage }] theo ĐÚNG thứ tự đo
 * @param {object} dbsql     kết nối đang trong transaction
 */
export const replaceCtExcitationPointsTransaction = (datasetId, points, dbsql) => {
    return new Promise((resolve, reject) => {
        if (!datasetId) {
            return resolve({ success: true, data: [], message: 'No dataset id, nothing to write' })
        }
        dbsql.run(
            'DELETE FROM ct_excitation_point WHERE procedure_dataset_id = ?',
            [datasetId],
            function (err) {
                if (err) return reject({ success: false, err, message: `Delete CT excitation points failed: ${err.message}` })

                const list = Array.isArray(points) ? points.filter(Boolean) : []
                if (list.length === 0) {
                    return resolve({ success: true, data: [], message: 'Curve cleared' })
                }

                const stmt = dbsql.prepare(
                    `INSERT INTO ct_excitation_point(
                        mrid, procedure_dataset_id, sequence_number, current, voltage
                    ) VALUES (?, ?, ?, ?, ?)`
                )
                let pending = list.length
                let failed = null

                list.forEach((p, index) => {
                    stmt.run(
                        [
                            p.mrid,
                            datasetId,
                            // Thứ tự lấy theo VỊ TRÍ trong mảng, không theo `p.sequence_number`.
                            // Chỗ gọi truyền mảng đã đúng thứ tự; một nguồn thứ tự thì không
                            // thể lệch với chính nó.
                            index,
                            p.current === null || p.current === undefined ? null : String(p.current),
                            p.voltage === null || p.voltage === undefined ? null : String(p.voltage),
                        ],
                        (runErr) => {
                            if (runErr && !failed) failed = runErr
                            if (--pending === 0) {
                                stmt.finalize(() => {
                                    if (failed) {
                                        return reject({ success: false, err: failed, message: `Insert CT excitation points failed: ${failed.message}` })
                                    }
                                    resolve({ success: true, data: list, message: 'Curve written' })
                                })
                            }
                        }
                    )
                })
            }
        )
    })
}

/** Đường cong của MỘT dòng, đã sắp theo thứ tự đo. */
export const getCtExcitationPointsByDatasetId = (datasetId) => {
    return new Promise((resolve, reject) => {
        if (!datasetId) return resolve({ success: true, data: [], message: 'No dataset id' })
        db.all(
            `SELECT * FROM ct_excitation_point
              WHERE procedure_dataset_id = ?
              ORDER BY sequence_number ASC`,
            [datasetId],
            (err, rows) => {
                if (err) return reject({ success: false, err, message: `Get CT excitation points failed: ${err.message}` })
                return resolve({ success: true, data: rows || [], message: 'Get CT excitation points completed' })
            }
        )
    })
}

/**
 * Đường cong của NHIỀU dòng một lượt, gom sẵn theo dòng.
 *
 * Bảng CT excitation có 12 dòng. Gọi 12 truy vấn để vẽ một đồ thị là 12 vòng IPC — lấy
 * một lượt rồi gom ở đây.
 */
export const getCtExcitationPointsByDatasetIds = (datasetIds) => {
    return new Promise((resolve, reject) => {
        const ids = (Array.isArray(datasetIds) ? datasetIds : []).filter(Boolean)
        if (ids.length === 0) return resolve({ success: true, data: {}, message: 'No dataset' })

        const holes = ids.map(() => '?').join(',')
        db.all(
            `SELECT * FROM ct_excitation_point
              WHERE procedure_dataset_id IN (${holes})
              ORDER BY procedure_dataset_id ASC, sequence_number ASC`,
            ids,
            (err, rows) => {
                if (err) return reject({ success: false, err, message: `Get CT excitation points failed: ${err.message}` })
                const grouped = {}
                for (const row of (rows || [])) {
                    if (!grouped[row.procedure_dataset_id]) grouped[row.procedure_dataset_id] = []
                    grouped[row.procedure_dataset_id].push(row)
                }
                return resolve({ success: true, data: grouped, message: 'Get CT excitation points completed' })
            }
        )
    })
}

/**
 * Xoá đường cong của một dòng.
 *
 * Bình thường KHÔNG cần gọi — khoá ngoại đã CASCADE theo procedure_dataset. Hàm này dành
 * cho trường hợp muốn bỏ riêng đường cong mà giữ dòng.
 */
export const deleteCtExcitationPointsByDatasetIdTransaction = (datasetId, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            'DELETE FROM ct_excitation_point WHERE procedure_dataset_id = ?',
            [datasetId],
            function (err) {
                if (err) return reject({ success: false, err, message: `Delete CT excitation points failed: ${err.message}` })
                return resolve({ success: true, message: 'CT excitation points deleted' })
            }
        )
    })
}

// ─── Điểm knee theo từng tiêu chuẩn ──────────────────────────────────────────

/**
 * Ghi toàn bộ điểm knee của một dòng: xoá hết rồi chèn lại.
 *
 * Cùng lý do với đường cong: số tiêu chuẩn có thể khác giữa hai lần đo, sửa từng dòng sẽ
 * để lại tiêu chuẩn thừa của lần trước.
 *
 * @param {string} datasetId procedure_dataset.mrid
 * @param {Array}  kneePoints [{ mrid, method, voltage, current, isSelected }]
 */
export const replaceCtExcitationKneePointsTransaction = (datasetId, kneePoints, dbsql) => {
    return new Promise((resolve, reject) => {
        if (!datasetId) {
            return resolve({ success: true, data: [], message: 'No dataset id, nothing to write' })
        }
        dbsql.run(
            'DELETE FROM ct_excitation_knee_point WHERE procedure_dataset_id = ?',
            [datasetId],
            function (err) {
                if (err) return reject({ success: false, err, message: `Delete knee points failed: ${err.message}` })

                const list = Array.isArray(kneePoints) ? kneePoints.filter(Boolean) : []
                if (list.length === 0) {
                    return resolve({ success: true, data: [], message: 'Knee points cleared' })
                }

                const stmt = dbsql.prepare(
                    `INSERT INTO ct_excitation_knee_point(
                        mrid, procedure_dataset_id, method, voltage, current, is_selected
                    ) VALUES (?, ?, ?, ?, ?, ?)`
                )
                let pending = list.length
                let failed = null

                for (const k of list) {
                    stmt.run(
                        [
                            k.mrid,
                            datasetId,
                            String(k.method || ''),
                            k.voltage === null || k.voltage === undefined ? null : String(k.voltage),
                            k.current === null || k.current === undefined ? null : String(k.current),
                            // Nhận CẢ HAI tên: mapper import dựng `isSelected`, còn vòng
                            // đọc-ghi lại (đọc job lên rồi lưu xuống) trả về `is_selected`
                            // đúng như tên cột. Chỉ nhận một tên là lần lưu thứ hai đánh
                            // rơi cờ, và bảng vẫn đầy đủ nên không ai thấy.
                            (k.isSelected !== undefined ? k.isSelected : k.is_selected) ? 1 : 0,
                        ],
                        (runErr) => {
                            if (runErr && !failed) failed = runErr
                            if (--pending === 0) {
                                stmt.finalize(() => {
                                    if (failed) {
                                        return reject({ success: false, err: failed, message: `Insert knee points failed: ${failed.message}` })
                                    }
                                    resolve({ success: true, data: list, message: 'Knee points written' })
                                })
                            }
                        }
                    )
                }
            }
        )
    })
}

/** Điểm knee của NHIỀU dòng một lượt, gom sẵn theo dòng. */
export const getCtExcitationKneePointsByDatasetIds = (datasetIds) => {
    return new Promise((resolve, reject) => {
        const ids = (Array.isArray(datasetIds) ? datasetIds : []).filter(Boolean)
        if (ids.length === 0) return resolve({ success: true, data: {}, message: 'No dataset' })

        const holes = ids.map(() => '?').join(',')
        db.all(
            `SELECT * FROM ct_excitation_knee_point
              WHERE procedure_dataset_id IN (${holes})
              ORDER BY procedure_dataset_id ASC, is_selected DESC, method ASC`,
            ids,
            (err, rows) => {
                if (err) return reject({ success: false, err, message: `Get knee points failed: ${err.message}` })
                const grouped = {}
                for (const row of (rows || [])) {
                    if (!grouped[row.procedure_dataset_id]) grouped[row.procedure_dataset_id] = []
                    grouped[row.procedure_dataset_id].push(row)
                }
                return resolve({ success: true, data: grouped, message: 'Get knee points completed' })
            }
        )
    })
}
