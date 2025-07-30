class WindingConfigurationDto {
    constructor() {
        this.vector_group_custom = '';
        this.unsupported_vector_group = '';
        this.phases = ''
        this.vector_group = {
            prim: '',
            sec: {
                i: '',
                value: ''
            },
            tert: {
                i: '',
                value: '',
                accessible: ''
            }
        }
        this.vector_group_data = ''
    }
}

export default WindingConfigurationDto;