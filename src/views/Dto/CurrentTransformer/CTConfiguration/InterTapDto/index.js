import ClassRatingSmallDto from "../ClassRatingSmallDto";
import TableDto from "../TableDto";
class InterTapDto {
    constructor() {
        this.data = [
            {
                table : new TableDto(),
                classRating : new ClassRatingSmallDto()
            },
        ]
    }
}

export default InterTapDto;