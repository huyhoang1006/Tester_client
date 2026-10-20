import testMap from '@/config/test-definitions/PowerCable'
import conditionMap from '@/config/testing-condition/PowerCable'
import assessmentMap from '@/config/testing-assessment/PowerCable'
import { createJobServerMapper } from '../TransformerJob'

const mapper = createJobServerMapper(testMap, conditionMap, assessmentMap, 'powerCableTestingEquipmentTestType')
export const mapDtoToServer = mapper.mapDtoToServer
export const mapServerToDto = mapper.mapServerToDto
