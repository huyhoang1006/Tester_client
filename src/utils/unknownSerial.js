import uuid from '@/utils/uuid'

const UNKNOWN_SERIAL_PATTERN = /^_UNKNOWN_[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export const isUnknownSerial = value => typeof value === 'string' && UNKNOWN_SERIAL_PATTERN.test(value)

export const newUnknownSerial = () => `_UNKNOWN_${uuid.newUuid()}`

export const displaySerialNumber = value => isUnknownSerial(value) ? 'Unknown' : value
