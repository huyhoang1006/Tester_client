/* eslint-disable no-control-regex */
export const safePathSegment = (value) => {
    if (value === null || value === undefined || value === '') return '_'
    return String(value)
        .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
        .replace(/[. ]+$/g, '_')
}
