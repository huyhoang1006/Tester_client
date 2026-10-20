import testMap from '@/config/test-definitions/CircuitBreaker'
import conditionMap from '@/config/testing-condition/CircuitBreaker'
import assessmentMap from '@/config/testing-assessment/CircuitBreaker'
import { createJobServerMapper } from '../TransformerJob'

const mapper = createJobServerMapper(testMap, conditionMap, assessmentMap, 'circuitBreakerTestingEquipmentTestType', { normalizeTables: true, series: ['cbMotorCurrentPoints', 'cbTimingTraces'] })
export const mapDtoToServer = mapper.mapDtoToServer
export const mapServerToDto = mapper.mapServerToDto
