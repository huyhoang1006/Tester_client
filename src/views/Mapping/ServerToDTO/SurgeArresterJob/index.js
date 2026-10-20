import testMap from '@/config/test-definitions/SurgeArrester'
import conditionMap from '@/config/testing-condition/SurgeArrester'
import assessmentMap from '@/config/testing-assessment/SurgeArrester'
import { createJobServerMapper } from '../TransformerJob'

const mapper = createJobServerMapper(testMap, conditionMap, assessmentMap, 'surgeArresterTestingEquipmentTestType')
export const mapDtoToServer = mapper.mapDtoToServer
export const mapServerToDto = mapper.mapServerToDto
