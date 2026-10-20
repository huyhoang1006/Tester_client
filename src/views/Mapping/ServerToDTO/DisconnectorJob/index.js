import testMap from '@/config/test-definitions/Disconnector'
import conditionMap from '@/config/testing-condition/Disconnector'
import assessmentMap from '@/config/testing-assessment/Disconnector'
import { createJobServerMapper } from '../TransformerJob'

const mapper = createJobServerMapper(testMap, conditionMap, assessmentMap, 'disconnectorTestingEquipmentTestType')
export const mapDtoToServer = mapper.mapDtoToServer
export const mapServerToDto = mapper.mapServerToDto
