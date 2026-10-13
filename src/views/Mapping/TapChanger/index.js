import TapChangersEntity from "@/views/Flatten/TapChanger";
export const tapChangersDtoToEntity = (dto) => {
    const entity = new TapChangersEntity();
    Object.assign(entity, dto)

    return entity;
}
