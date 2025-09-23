import ClassRatingDto from "../ClassRatingDto";
import TableDto from "../TableDto";
class FullTapDto {
    constructor() { 
        this.table = new TableDto();
        this.classRating = new ClassRatingDto();
    }
}

export default FullTapDto;