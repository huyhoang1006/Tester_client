import testMap from '@/config/test-definitions/Capacitor'
import conditionMap from '@/config/testing-condition/Capacitor'
import assessmentMap from '@/config/testing-assessment/Capacitor'
import { createJobServerMapper } from '../TransformerJob'

const mapper = createJobServerMapper(testMap, conditionMap, assessmentMap, 'capacitorTestingEquipmentTestType')
export const mapDtoToServer = mapper.mapDtoToServer
export const mapServerToDto = mapper.mapServerToDto
