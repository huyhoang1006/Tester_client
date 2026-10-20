import testMap from '@/config/test-definitions/RotatingMachine'
import conditionMap from '@/config/testing-condition/RotatingMachine'
import assessmentMap from '@/config/testing-assessment/RotatingMachine'
import { createJobServerMapper } from '../TransformerJob'

const mapper = createJobServerMapper(testMap, conditionMap, assessmentMap, 'rotatingMachineTestingEquipmentTestType')
export const mapDtoToServer = mapper.mapDtoToServer
export const mapServerToDto = mapper.mapServerToDto
