import testMap from '@/config/test-definitions/CurrentTransformer'
import conditionMap from '@/config/testing-condition/CurrentTransformer'
import assessmentMap from '@/config/testing-assessment/CurrentTransformer'
import { createJobServerMapper } from '../TransformerJob'

const mapper = createJobServerMapper(testMap, conditionMap, assessmentMap, 'currentTransformerTestingEquipmentTestType', { series: ['ctExcitationPoints', 'ctExcitationKneePoints'] })
export const mapDtoToServer = mapper.mapDtoToServer
export const mapServerToDto = mapper.mapServerToDto
