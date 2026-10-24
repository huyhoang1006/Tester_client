export const equipmentStatuses = [
    { value: 'Available', label: 'Available', cls: 'green' },
    { value: 'DeliveredToCustomer', label: 'Delivered to customer', cls: 'blue' },
    { value: 'UnderRepair', label: 'Under Repair', cls: 'orange' },
    { value: 'UnderCalibration', label: 'Under Calibration', cls: 'yellow' },
    { value: 'InStorage', label: 'In Storage', cls: 'gray' },
    { value: 'Scrap', label: 'Scrap', cls: 'red' }
]

export const equipmentStatusTag = (value) =>
    equipmentStatuses.find(status => status.value === value) ||
    { label: value || '—', cls: 'gray' }
