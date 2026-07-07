// Bảng nối n-n accessory_testing_equipment (tự tham chiếu testing_equipment)
class AccessoryTestingEquipment {
    constructor() {
        this.equipment = null;   // máy chính  -> testing_equipment.mrid
        this.accessory = null;   // phụ kiện   -> testing_equipment.mrid
    }
}

export default AccessoryTestingEquipment;
