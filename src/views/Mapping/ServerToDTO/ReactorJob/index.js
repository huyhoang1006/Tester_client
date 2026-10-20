import testMap from '@/config/test-definitions/Reactor'
import conditionMap from '@/config/testing-condition/Reactor'
import assessmentMap from '@/config/testing-assessment/Reactor'
import { createJobServerMapper } from '../TransformerJob'

const mapper = createJobServerMapper(testMap, conditionMap, assessmentMap, 'reactorTestingEquipmentTestType')
export const mapDtoToServer = mapper.mapDtoToServer
export const mapServerToDto = mapper.mapServerToDto
