import currentTransformer from './current-transformer.json'

/**
 * CẤU HÌNH IMPORT PTM.
 *
 * Gom bảng ánh xạ của từng loại thiết bị, và cho tra hai chiều:
 *
 *   loai bai PTM ('CTExcitationTest')  ->  ma bai client ('CTExcitation')
 *   ma bai client                      ->  cach lay tung cot
 *
 * ─── RANH GIỚI GIỮA FILE NÀY VÀ CODE ─────────────────────────────────────────
 *
 * Ở ĐÂY (dữ liệu, đổi được mà không build lại):
 *   - tên bài test hai phía khớp nhau thế nào
 *   - cột nào lấy từ trường nào, nhân hệ số bao nhiêu
 *   - từ vựng đánh giá quy đổi ra sao
 *
 * TRONG CODE (`ptmToCtJobDto.js`):
 *   - đi trong cấu trúc XML: 12 phép đo lồng trong `Measurements`, ba lớp knee point…
 *   - dựng mrid, ghép DTO, đối chiếu trùng
 *
 * Ép phần "đi trong cấu trúc" vào JSON là bắt đầu phát minh một ngôn ngữ nhỏ trong file
 * cấu hình — khó đọc hơn code, không debug được, không ai kiểm được.
 */

const ASSET_CONFIGS = {
    CurrentTransformer: currentTransformer,
}

/** Loại thiết bị PTM nào đang hỗ trợ import. */
export const SUPPORTED_ASSET_TYPES = Object.keys(ASSET_CONFIGS)

/**
 * Cấu hình một bài test theo loại PTM.
 *
 * @param {string} assetType loại thiết bị PTM, vd 'CurrentTransformer'
 * @param {string} ptmType   loại bài test PTM, vd 'CTExcitationTest'
 * @returns {{ testCode, config }|null} null nghĩa là chưa hỗ trợ bài này
 */
export const findTestConfig = (assetType, ptmType) => {
    const assetConfig = ASSET_CONFIGS[assetType]
    if (!assetConfig) return null
    for (const testCode of Object.keys(assetConfig)) {
        if (testCode.indexOf('_') === 0) continue      // bỏ khoá tài liệu `_doc`
        const config = assetConfig[testCode]
        if (config && config.ptmType === ptmType) return { testCode, config }
    }
    return null
}

/** Mọi mã bài test client đang hỗ trợ cho một loại thiết bị. */
export const supportedTestCodes = (assetType) => {
    const assetConfig = ASSET_CONFIGS[assetType]
    if (!assetConfig) return []
    return Object.keys(assetConfig).filter(k => k.indexOf('_') !== 0)
}

export default { ASSET_CONFIGS, SUPPORTED_ASSET_TYPES, findTestConfig, supportedTestCodes }
