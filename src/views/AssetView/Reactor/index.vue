<template>
    <div>
        <PropertiesReactor :properties="reactor.properties"></PropertiesReactor>
        <el-row style="margin-top: 20px;" :gutter="20" class="content">
            <el-col :span="12" class="col-content">    
                <RatingsReactor :ratings="reactor.reactorRating"></RatingsReactor>
            </el-col>
            <el-col :span="12" class="col-content">    
                <OthersReactor :other="reactor.reactorOther"></OthersReactor>
            </el-col>
        </el-row>
    </div>
</template>
<script>
import PropertiesReactor from './components/properties.vue'
import OthersReactor from './components/others.vue'
import RatingsReactor from './components/ratings.vue'
import ReactorDto from '@/views/Dto/Reactor';
export default {
    name: 'Reactor',
    components: {
        PropertiesReactor,
        OthersReactor,
        RatingsReactor
    },
    data() {
        return {
            reactor : new ReactorDto(),
        }
    },
    methods: {
        resetForm() {
        },
    },
}

</script>
<style scoped>
</style>