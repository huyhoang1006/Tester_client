import testMap from '@/config/test-definitions/VoltageTransformer'
import conditionMap from '@/config/testing-condition/VoltageTransformer'
import assessmentMap from '@/config/testing-assessment/VoltageTransformer'
import { createJobServerMapper } from '../TransformerJob'

const mapper = createJobServerMapper(testMap, conditionMap, assessmentMap, 'voltageTransformerTestingEquipmentTestType')
export const mapDtoToServer = mapper.mapDtoToServer
export const mapServerToDto = mapper.mapServerToDto
