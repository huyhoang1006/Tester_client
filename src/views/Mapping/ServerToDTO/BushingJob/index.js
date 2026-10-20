import testMap from '@/config/test-definitions/Bushing'
import conditionMap from '@/config/testing-condition/Bushing'
import assessmentMap from '@/config/testing-assessment/Bushing'
import { createJobServerMapper } from '../TransformerJob'

const mapper = createJobServerMapper(testMap, conditionMap, assessmentMap, 'bushingTestingEquipmentTestType')
export const mapDtoToServer = mapper.mapDtoToServer
export const mapServerToDto = mapper.mapServerToDto
