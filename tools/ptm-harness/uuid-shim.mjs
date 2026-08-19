let n = 0
export const v4 = () => `uuid-${String(++n).padStart(6, '0')}`
export const NIL = '00000000-0000-0000-0000-000000000000'
export const validate = (v) => typeof v === 'string' && v.length > 0
export const version = () => 4
export default { v4, NIL, validate, version }
