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
        this.data[0].table.type = 'intertap';
    }
}

export default InterTapDto;