import ClassRatingDto from "../ClassRatingDto";
import TableDto from "../TableDto";
class FullTapDto {
    constructor() { 
        this.table = new TableDto();
        this.classRating = new ClassRatingDto();
        this.table.type = 'fulltap';
        this.table.name = 'S1 - S2';
    }
}

export default FullTapDto;