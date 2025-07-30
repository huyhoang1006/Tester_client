import TapChangersEntity from "@/views/Entity/TapChanger";
import TapChangersDto from "@/views/Dto/";
export const tapChangersDtoToEntity = (dto) => {
    const entity = new TapChangersEntity();
    const dto = new TapChangersDto();

    return entity;
}