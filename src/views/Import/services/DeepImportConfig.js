/**
 * DeepImportConfig.js
 * 
 * Tập trung tất cả constants, mappings, và configs cho deepImportService.
 * Thêm asset type mới hoặc job type mới → chỉ cần sửa file này.
 */

// ── DTO Classes ───────────────────────────────────────────────────────────────
import VoltageTransformerDto  from '@/views/Dto/VoltageTransformer'
import CurrentTransformerDto  from '@/views/Dto/CurrentTransformer'
import TransformerDto         from '@/views/Dto/Transformer'
import CircuitBreakerDto      from '@/views/Dto/CircuitBreaker'
import PowerCableDto          from '@/views/Dto/PowerCable'
import SurgeArresterDto       from '@/views/Dto/SurgeAsset'
import ReactorDto             from '@/views/Dto/Reactor'
import CapacitorDto           from '@/views/Dto/Capacitor'
import DisconnectorDto        from '@/views/Dto/Disconnector'
import RotatingMachineDto     from '@/views/Dto/RotatingMachine'
import BushingDto             from '@/views/Dto/BushingAsset'

// ── Asset Mappers (DtoToEntity) ───────────────────────────────────────────────
import { mapDtoToEntity as vtMapDtoToEntity }                          from '@/views/Mapping/VoltageTransformer/index'
import { mapDtoToEntity as ctMapDtoToEntity }                          from '@/views/Mapping/CurrentTransformer/index'
import { transformerDtoToEntity as tfMapDtoToEntity }                  from '@/views/Mapping/Transformer/index'
import { mapDtoToEntity as breakerMapDtoToEntity }                     from '@/views/Mapping/Breaker/index'
import { mapDtoToEntity as cableMapDtoToEntity }                       from '@/views/Mapping/PowerCable/index'
import { mapDtoToEntity as saMapDtoToEntity }                          from '@/views/Mapping/SurgeArrester/index'
import { mapDtoToEntity as reactorMapDtoToEntity }                     from '@/views/Mapping/Reactor/index'
import { mapDtoToEntity as capacitorMapDtoToEntity }                   from '@/views/Mapping/Capacitor/index'
import { disconnectorDtoToEntity as disconnectorMapDtoToEntity }       from '@/views/Mapping/Disconnector/index'
import { mapDtoToEntity as rotatingMapDtoToEntity }                    from '@/views/Mapping/RotatingMachine/index'
import { mapDtoToEntity as bushingMapDtoToEntity }                     from '@/views/Mapping/Bushing/index'

// ── Job Mappers ───────────────────────────────────────────────────────────────
import { jobDtoToEntity as vtJobDtoToEntity }  from '@/views/Mapping/VoltageTransformerJob/index'
import { jobDtoToEntity as ctJobDtoToEntity }  from '@/views/Mapping/CurrentTransformerJob/index'
import { jobDtoToEntity as tfJobDtoToEntity }  from '@/views/Mapping/TransformerJob/index'
import { jobDtoToEntity as brJobDtoToEntity }  from '@/views/Mapping/CircuitBreakerJob/index'
import { jobDtoToEntity as caJobDtoToEntity }  from '@/views/Mapping/PowerCableJob/index'
import { jobDtoToEntity as saJobDtoToEntity }  from '@/views/Mapping/SurgerArresterJob/index'
import { jobDtoToEntity as reJobDtoToEntity }  from '@/views/Mapping/ReactorJob/index'
import { jobDtoToEntity as cpJobDtoToEntity }  from '@/views/Mapping/CapacitorJob/index'
import { jobDtoToEntity as dcJobDtoToEntity }  from '@/views/Mapping/DisconnectorJob/index'
import { jobDtoToEntity as rmJobDtoToEntity }  from '@/views/Mapping/RotatingMachineJob/index'
import { jobDtoToEntity as buJobDtoToEntity }  from '@/views/Mapping/BushingJob/index'

// ══════════════════════════════════════════════════════════════════════════════
// REQUIRED FIELD — field bắt buộc để xác định entity
// ══════════════════════════════════════════════════════════════════════════════
export const ASSET_REQ_FIELD = 'serial_no'
export const JOB_REQ_FIELD   = 'job_name'

// ══════════════════════════════════════════════════════════════════════════════
// ASSET_KIND_MAP — catKey → kind string đúng với getAssetByPsrIdAndKind API
// Nguồn: constants.js (FEATURE_TREE) và Import/index.vue line 699-711
// ══════════════════════════════════════════════════════════════════════════════
export const ASSET_KIND_MAP = {
  'Asset_TransformerDataDto':    'Transformer',
  'Asset_VoltageTransformerDto': 'Voltage transformer',
  'Asset_CurrentTransformerDto': 'Current transformer',
  'Asset_CircuitBreakerDto':     'Circuit breaker',
  'Asset_PowerCableDTO':         'Power cable',
  'Asset_SurgeArresterDto':      'Surge arrester',
  'Asset_ReactorDto':            'Reactor',
  'Asset_BushingAssetDto':       'Bushing',
  'Asset_CapacitorsDTO':         'Capacitor',
  'Asset_DisconnectorDTO':       'Disconnector',
  'Asset_RotatingMachineDTO':    'Rotating machine',
}

// ══════════════════════════════════════════════════════════════════════════════
// ASSET_CONFIG — catKey → { DtoClass, mapper, api }
// ══════════════════════════════════════════════════════════════════════════════
export const ASSET_CONFIG = {
  'Asset_VoltageTransformerDto': { DtoClass: VoltageTransformerDto, mapper: vtMapDtoToEntity,          api: 'insertVoltageTransformerEntity' },
  'Asset_CurrentTransformerDto': { DtoClass: CurrentTransformerDto, mapper: ctMapDtoToEntity,          api: 'insertCurrentTransformerEntity' },
  'Asset_TransformerDataDto':    { DtoClass: TransformerDto,        mapper: tfMapDtoToEntity,          api: 'insertTransformerEntity'        },
  'Asset_CircuitBreakerDto':     { DtoClass: CircuitBreakerDto,     mapper: breakerMapDtoToEntity,     api: 'insertBreakerEntity'     },
  'Asset_PowerCableDTO':         { DtoClass: PowerCableDto,         mapper: cableMapDtoToEntity,       api: 'insertPowerCableEntity'         },
  'Asset_SurgeArresterDto':      { DtoClass: SurgeArresterDto,      mapper: saMapDtoToEntity,          api: 'insertSurgeArresterEntity'      },
  'Asset_ReactorDto':            { DtoClass: ReactorDto,            mapper: reactorMapDtoToEntity,     api: 'insertReactorEntity'            },
  'Asset_CapacitorsDTO':         { DtoClass: CapacitorDto,          mapper: capacitorMapDtoToEntity,   api: 'insertCapacitorEntity'          },
  'Asset_DisconnectorDTO':       { DtoClass: DisconnectorDto,       mapper: disconnectorMapDtoToEntity, api: 'insertDisconnectorEntity',  singleArg: true  },
  'Asset_RotatingMachineDTO':    { DtoClass: RotatingMachineDto,    mapper: rotatingMapDtoToEntity,    api: 'insertRotatingMachineEntity'    , singleArg: true  },
  'Asset_BushingAssetDto':       { DtoClass: BushingDto,            mapper: bushingMapDtoToEntity,     api: 'insertBushingEntity',       singleArg: true  },
}

// ══════════════════════════════════════════════════════════════════════════════
// JOB_CONFIG — catKey → { mapper, api, testTypeKey }
// ══════════════════════════════════════════════════════════════════════════════
export const JOB_CONFIG = {
  'Job_TransformerJobDto':        { mapper: tfJobDtoToEntity, api: 'insertTransformerJob',        testTypeKey: 'transformerTestingEquipmentTestType'        },
  'Job_VoltageTransformerJobDto': { mapper: vtJobDtoToEntity, api: 'insertVoltageTransformerJob', testTypeKey: 'voltageTransformerTestingEquipmentTestType' },
  'Job_CurrentTransformerJobDto': { mapper: ctJobDtoToEntity, api: 'insertCurrentTransformerJob', testTypeKey: 'currentTransformerTestingEquipmentTestType' },
  'Job_CircuitBreakerJobDto':     { mapper: brJobDtoToEntity, api: 'insertCircuitBreakerJob',     testTypeKey: 'circuitBreakerTestingEquipmentTestType'     },
  'Job_PowerCableJobDto':         { mapper: caJobDtoToEntity, api: 'insertPowerCableJob',         testTypeKey: 'powerCableTestingEquipmentTestType'         },
  'Job_SurgeArresterJobDto':      { mapper: saJobDtoToEntity, api: 'insertSurgeArresterJob',      testTypeKey: 'surgeArresterTestingEquipmentTestType'      },
  'Job_ReactorJobDto':            { mapper: reJobDtoToEntity, api: 'insertReactorJob',            testTypeKey: 'reactorTestingEquipmentTestType'            },
  'Job_CapacitorJobDto':          { mapper: cpJobDtoToEntity, api: 'insertCapacitorJob',          testTypeKey: 'capacitorTestingEquipmentTestType'          },
  'Job_DisconnectorJobDto':       { mapper: dcJobDtoToEntity, api: 'insertDisconnectorJob',       testTypeKey: 'disconnectorTestingEquipmentTestType'       },
  'Job_RotatingMachineJobDto':    { mapper: rmJobDtoToEntity, api: 'insertRotatingMachineJob',    testTypeKey: 'rotatingMachineTestingEquipmentTestType'    },
  'Job_BushingJobDto':            { mapper: buJobDtoToEntity, api: 'insertBushingJob',            testTypeKey: 'bushingTestingEquipmentTestType'            },
}