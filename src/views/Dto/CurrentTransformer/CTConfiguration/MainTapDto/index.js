import ClassRatingSmallDto from "../ClassRatingSmallDto";
import TableDto from "../TableDto";
class MainTapDto {
    constructor() { 
        this.data = [
            {
                table : new TableDto(),
                classRating : new ClassRatingSmallDto()
            },
        ]
        this.data[0].table.type = 'maintap';
    }
}

export default MainTapDto;