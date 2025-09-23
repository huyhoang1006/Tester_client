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
      
    }
}

export default MainTapDto;