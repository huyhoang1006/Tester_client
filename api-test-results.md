# API Test Results

**Date:** 2026-03-02 10:06:31

**Base URL:** http://222.252.22.158:8087

**Token:** eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY3Rpb25Vc...

## Test Results

| Method | Endpoint | Name | Status | Status Code |
|--------|----------|------|--------|-------------|
| GET | /api/voltage-transformer/1 | Get Voltage Transformer by ID | SUCCESS | 200 |
| GET | /api/voltage-level/get-by-substation/1 | Get Voltage Level by Substation | ERROR | 400 |
| GET | /api/transformer/1 | Get Transformer by ID | SUCCESS | 200 |
| GET | /api/surge-arrester/1 | Get Surge Arrester by ID | SUCCESS | 200 |
| GET | /api/substation/get-by-organisation/1 | Get Substation by Organisation | SUCCESS | 200 |
| GET | /api/organisation/get-owner-organisation | Get Owner Organisation | SUCCESS | 200 |
| GET | /api/organisation/get-child-organisation/1 | Get Child Organisation | SUCCESS | 200 |
| GET | /api/disconnector/1 | Get Disconnector by ID | SUCCESS | 200 |
| GET | /api/current-transformer/1 | Get Current Transformer by ID | SUCCESS | 200 |
| GET | /api/circuit-breaker/1 | Get Circuit Breaker by ID | ERROR | 400 |
| GET | /api/circuit-breaker/operating/1 | Get Operating by ID | ERROR | 400 |
| GET | /api/bushing/1 | Get Bushing by ID | SUCCESS | 200 |
| GET | /api/bay/get-by-voltage-level/1 | Get Bay by Voltage Level | SUCCESS | 200 |
| GET | /api/bay/get-by-substation/1 | Get Bay by Substation | ERROR | 400 |
| GET | /api/asset/get-by-owner/1/Organisation | Get Asset by Owner | SUCCESS | 200 |
| GET | /api/asset-tree/by-owner?ownerId=1 | Get Asset Tree by Owner | SUCCESS | 200 |
| GET | /api/asset-tree/asset-path?assetId=1&assetType=Organisation | Get Asset Path | SUCCESS | 200 |
| GET | /api/cim/voltage-transformer/test | Get CIM Voltage Transformer | SUCCESS | 200 |
| GET | /api/cim/voltage-level/test | Get CIM Voltage Level | SUCCESS | 200 |
| GET | /api/cim/substation/test | Get CIM Substation | SUCCESS | 200 |
| GET | /api/cim/power-cable/test | Get CIM Power Cable | SUCCESS | 200 |
| GET | /api/cim/organisation/test | Get CIM Organisation | SUCCESS | 200 |
| GET | /api/cim/current-transformer/test | Get CIM Current Transformer | SUCCESS | 200 |
| GET | /api/cim/circuit-breaker/test | Get CIM Circuit Breaker | SUCCESS | 200 |
| GET | /api/cim/bay/test | Get CIM Bay | SUCCESS | 200 |

## Details

### GET /api/voltage-transformer/1
**Name:** Get Voltage Transformer by ID

**Status:** SUCCESS

**Status Code:** 200

**Response:**
`json
{"status":"200","success":true,"message":"Get Voltage Transformer Success","data":{"assetInfoResponseDTO":{"id":103,"ownerId":44,"ownerType":"BAY","serialNo":"TU131vt","manufacturerName":"General Electric","manufacturingYear":2020,"countryName":"United States","apparatusId":"TU131","description":null},"voltageTransformerCoreResponseDTO":{"id":1,"assetType":"CVT_CCVT","assetInfoId":103,"standard":"IEC_61869","ratedFrequency":50.0,"ratedFrequencyUnit":"Hz","uprValue":110.0,"windings":null,"uprMult... (truncated)
``n
### GET /api/voltage-level/get-by-substation/1
**Name:** Get Voltage Level by Substation

**Status:** ERROR

**Status Code:** 400

**Response:**
`json
The remote server returned an error: (400) Bad Request.
``n
### GET /api/transformer/1
**Name:** Get Transformer by ID

**Status:** SUCCESS

**Status Code:** 200

**Response:**
`json
{"status":"200","success":true,"message":"Get transformer successful","data":{"assetInfo":{"id":14,"ownerId":4,"ownerType":"BAY","serialNo":"AT1tra","manufacturerName":"Siemens","manufacturingYear":2020,"countryName":"Germany","apparatusId":"AT1","description":null},"transformer":{"id":1,"assetType":"AUTO_WITH_TERT","assetInfo":14,"phases":"THREE","vectorGroup":"Yna0d11","vectorGroupPrim":null,"vectorGroupSec":null,"vectorGroupSecVal":null,"vectorGroupTertiary":null,"vectorGroupTertiaryVal":null... (truncated)
``n
### GET /api/surge-arrester/1
**Name:** Get Surge Arrester by ID

**Status:** SUCCESS

**Status Code:** 200

**Response:**
`json
{"status":"200","success":true,"message":"Get surge arrester successful","data":{"assetInfo":{"id":1,"ownerId":7,"ownerType":"BAY","serialNo":"CS572sa","manufacturerName":"TRIDELTA","manufacturingYear":2020,"countryName":"Germany","apparatusId":"CS572","description":null},"surgeArrester":{"id":1,"assetType":null,"assetInfoId":1},"surgeArresterRatingList":["@{id=1; surgeArresterId=1; position=1; serialNo=unit1; ratedVoltage=420.0; maxSystemVoltage=800.0; continousOperatingVoltage=336.0; voltageUn... (truncated)
``n
### GET /api/substation/get-by-organisation/1
**Name:** Get Substation by Organisation

**Status:** SUCCESS

**Status Code:** 200

**Response:**
`json
{"status":"200","success":true,"message":"Get child substation by organisation parentId successful","data":[]}
``n
### GET /api/organisation/get-owner-organisation
**Name:** Get Owner Organisation

**Status:** SUCCESS

**Status Code:** 200

**Response:**
`json
{"status":"200","success":true,"message":"Get child organisation by parentId successful","data":{"id":20,"name":"Tá»NG CÃNG TY ÄIá»N Lá»°C THÃNH PHá» Há» CHÃ MINH TNHH","shortName":"EVNHCMC","aliasName":null,"mode":"organisation","parentOrganisation":1000,"taxCode":"0300951119","address":null,"contact":null,"description":""}}
``n
### GET /api/organisation/get-child-organisation/1
**Name:** Get Child Organisation

**Status:** SUCCESS

**Status Code:** 200

**Response:**
`json
{"status":"200","success":true,"message":"Get child organisation by parentId successful","data":[]}
``n
### GET /api/disconnector/1
**Name:** Get Disconnector by ID

**Status:** SUCCESS

**Status Code:** 200

**Response:**
`json
{"status":"200","success":true,"message":"Get Disconnector successfully!","data":{"assetInfo":{"id":172,"ownerId":44,"ownerType":"BAY","serialNo":"131-1dis","manufacturerName":"ABB","manufacturingYear":2020,"countryName":"Switzerland","apparatusId":"131-1","description":null},"core":{"id":1,"assetType":"HORIZONTAL_KNEE","ratedVoltage":110.0,"ratedVoltageUnit":"kV","ratedFrequency":50.0,"ratedFrequencyUnit":"Hz","ratedCurrent":1250.0,"ratedCurrentUnit":"A","shortTimeWithstandCurrent":31.5,"shortT... (truncated)
``n
### GET /api/current-transformer/1
**Name:** Get Current Transformer by ID

**Status:** SUCCESS

**Status Code:** 200

**Response:**
`json
{"status":"200","success":true,"message":"Get Current Transformer Success","data":{"assetInfo":{"id":null,"ownerId":44,"ownerType":"BAY","serialNo":"TI131ct","manufacturerName":"General Electric","manufacturingYear":2020,"countryName":"United States","apparatusId":"TI131","description":null},"currentTransformerCoreResponse":{"id":1,"assetType":"INDUCTIVE","assetInfoId":102,"standard":"IEC_61869","ratedFrequency":50.0,"ratedFrequencyUnit":"Hz","primaryWinding":1,"um":110.0,"icth":null,"icthUnit":... (truncated)
``n
### GET /api/circuit-breaker/1
**Name:** Get Circuit Breaker by ID

**Status:** ERROR

**Status Code:** 400

**Response:**
`json
The remote server returned an error: (400) Bad Request.
``n
### GET /api/circuit-breaker/operating/1
**Name:** Get Operating by ID

**Status:** ERROR

**Status Code:** 400

**Response:**
`json
The remote server returned an error: (400) Bad Request.
``n
### GET /api/bushing/1
**Name:** Get Bushing by ID

**Status:** SUCCESS

**Status Code:** 200

**Response:**
`json
{"status":"200","success":true,"message":"Get bushing successful","data":{"assetInfo":{"id":3,"ownerId":4,"ownerType":"BAY","serialNo":"prim1","manufacturerName":"Trench","manufacturingYear":null,"countryName":null,"apparatusId":null,"description":null},"bushing":{"id":1,"assetType":"WITH_TEST_TAP","assetInfoId":3,"position":"A","ratedFrequency":null,"ratedFrequencyUnit":null,"insulLevelLLL":1550.0,"insulLevelUnit":"kV","voltageLGround":550.0,"voltageLGroundUnit":"kV","maxSystemVoltage":null,"ma... (truncated)
``n
### GET /api/bay/get-by-voltage-level/1
**Name:** Get Bay by Voltage Level

**Status:** SUCCESS

**Status Code:** 200

**Response:**
`json
{"status":"200","success":true,"message":"Get bay  by voltage level Id successful","data":[{"mrid":1,"name":"C52","aliasName":null,"description":null,"breakerConfiguration":null,"busBarConfiguration":null,"substationId":null,"voltageLevelId":1},{"mrid":2,"name":"C51","aliasName":null,"description":null,"breakerConfiguration":null,"busBarConfiguration":null,"substationId":null,"voltageLevelId":1},{"mrid":3,"name":"AT2","aliasName":null,"description":null,"breakerConfiguration":null,"busBarConfigu... (truncated)
``n
### GET /api/bay/get-by-substation/1
**Name:** Get Bay by Substation

**Status:** ERROR

**Status Code:** 400

**Response:**
`json
The remote server returned an error: (400) Bad Request.
``n
### GET /api/asset/get-by-owner/1/Organisation
**Name:** Get Asset by Owner

**Status:** SUCCESS

**Status Code:** 200

**Response:**
`json
{"status":"200","success":true,"message":"Asset found successfully","data":[]}
``n
### GET /api/asset-tree/by-owner?ownerId=1
**Name:** Get Asset Tree by Owner

**Status:** SUCCESS

**Status Code:** 200

**Response:**
`json
{"status":"200","success":true,"message":"Get asset tree by owner success","data":{"id":"1","name":"BAN QUáº¢N LÃ Dá»° ÃN CÃC CÃNG TRÃNH ÄIá»N MIá»N Báº®C","type":"Organisation","description":"","children":[]}}
``n
### GET /api/asset-tree/asset-path?assetId=1&assetType=Organisation
**Name:** Get Asset Path

**Status:** SUCCESS

**Status Code:** 200

**Response:**
`json
{"status":"200","success":true,"message":"Get asset path success","data":"ADMIN/Tá»NG CÃNG TY TRUYá»N Táº¢I ÄIá»N QUá»C GIA/BAN QUáº¢N LÃ Dá»° ÃN CÃC CÃNG TRÃNH ÄIá»N MIá»N Báº®C"}
``n
### GET /api/cim/voltage-transformer/test
**Name:** Get CIM Voltage Transformer

**Status:** SUCCESS

**Status Code:** 200

**Response:**
`json
{"status":"200","success":true,"message":"Voltage transformer retrieved successfully","data":{"name":"CÃ¡p ngáº§m 24kV lá» 471","aliasName":"CN-471-E1.8","description":"Tuyáº¿n cÃ¡p xuáº¥t tuyáº¿n tá»« tá»§ trung tháº¿ Äáº¿n RMU sá» 1","acceptanceTest":null,"critical":null,"electronicAddress":null,"initialCondition":null,"initialLossOfLife":null,"inUseDate":null,"inUseState":null,"kind":null,"lifecycleDate":null,"lifecycleState":null,"lotNumber":null,"position":null,"retiredReason":null,"seri... (truncated)
``n
### GET /api/cim/voltage-level/test
**Name:** Get CIM Voltage Level

**Status:** SUCCESS

**Status Code:** 200

**Response:**
`json
{"status":"200","success":true,"message":"Voltage level retrieved successfully","data":{"name":"CÃ¡p ngáº§m 24kV lá» 471","aliasName":"CN-471-E1.8","description":"Tuyáº¿n cÃ¡p xuáº¥t tuyáº¿n tá»« tá»§ trung tháº¿ Äáº¿n RMU sá» 1","psrType":null,"assetDatasheet":null,"location":null,"highVoltageLimit":null,"lowVoltageLimit":null,"baseVoltage":null,"mRID":"test"}}
``n
### GET /api/cim/substation/test
**Name:** Get CIM Substation

**Status:** SUCCESS

**Status Code:** 200

**Response:**
`json
{"status":"200","success":true,"message":"Substation retrieved successfully","data":{"name":"CÃ¡p ngáº§m 24kV lá» 471","aliasName":"CN-471-E1.8","description":"Tuyáº¿n cÃ¡p xuáº¥t tuyáº¿n tá»« tá»§ trung tháº¿ Äáº¿n RMU sá» 1","generation":null,"industry":null,"psrType":null,"assetDatasheet":null,"location":null,"mRID":"test"}}
``n
### GET /api/cim/power-cable/test
**Name:** Get CIM Power Cable

**Status:** SUCCESS

**Status Code:** 200

**Response:**
`json
{"status":"200","success":true,"message":"Power cable retrieved successfully","data":{"name":"CÃ¡p ngáº§m 24kV lá» 471","aliasName":"CN-471-E1.8","description":"Tuyáº¿n cÃ¡p xuáº¥t tuyáº¿n tá»« tá»§ trung tháº¿ Äáº¿n RMU sá» 1","assetData":{"name":null,"aliasName":null,"description":null,"acceptanceTest":"@{dateTime=2023-06-22T00:00:00; success=True; type=SiteAcceptanceTest; mRID=}","critical":false,"electronicAddress":"@{email=contact@evn.com.vn; lan=; password=; mac=; radio=; userId=; web=h... (truncated)
``n
### GET /api/cim/organisation/test
**Name:** Get CIM Organisation

**Status:** SUCCESS

**Status Code:** 200

**Response:**
`json
{"status":"200","success":true,"message":"Organisation retrieved successfully","data":{"name":"CÃ¡p ngáº§m 24kV lá» 471","aliasName":"CN-471-E1.8","description":"Tuyáº¿n cÃ¡p xuáº¥t tuyáº¿n tá»« tá»§ trung tháº¿ Äáº¿n RMU sá» 1","organisation":null,"attachment":null,"positionPoints":null,"mRID":"test"}}
``n
### GET /api/cim/current-transformer/test
**Name:** Get CIM Current Transformer

**Status:** SUCCESS

**Status Code:** 200

**Response:**
`json
{"status":"200","success":true,"message":"Current transformer retrieved successfully","data":{"name":"CÃ¡p ngáº§m 24kV lá» 471","aliasName":"CN-471-E1.8","description":"Tuyáº¿n cÃ¡p xuáº¥t tuyáº¿n tá»« tá»§ trung tháº¿ Äáº¿n RMU sá» 1","acceptanceTest":null,"critical":null,"electronicAddress":null,"initialCondition":null,"initialLossOfLife":null,"inUseDate":null,"inUseState":null,"kind":null,"lifecycleDate":null,"lifecycleState":null,"lotNumber":null,"position":null,"retiredReason":null,"seri... (truncated)
``n
### GET /api/cim/circuit-breaker/test
**Name:** Get CIM Circuit Breaker

**Status:** SUCCESS

**Status Code:** 200

**Response:**
`json
{"status":"200","success":true,"message":"Circuit breaker retrieved successfully","data":{"name":"CÃ¡p ngáº§m 24kV lá» 471","aliasName":"CN-471-E1.8","description":"Tuyáº¿n cÃ¡p xuáº¥t tuyáº¿n tá»« tá»§ trung tháº¿ Äáº¿n RMU sá» 1","acceptanceTest":null,"critical":null,"electronicAddress":null,"initialCondition":null,"initialLossOfLife":null,"inUseDate":null,"inUseState":null,"kind":null,"lifecycleDate":null,"lifecycleState":null,"lotNumber":null,"position":null,"retiredReason":null,"serialNu... (truncated)
``n
### GET /api/cim/bay/test
**Name:** Get CIM Bay

**Status:** SUCCESS

**Status Code:** 200

**Response:**
`json
{"status":"200","success":true,"message":"Bay retrieved successfully","data":{"name":"CÃ¡p ngáº§m 24kV lá» 471","aliasName":"CN-471-E1.8","description":"Tuyáº¿n cÃ¡p xuáº¥t tuyáº¿n tá»« tá»§ trung tháº¿ Äáº¿n RMU sá» 1","psrType":null,"assetDatasheet":null,"location":null,"bayEnergyMeasFlag":null,"bayPowerMeasFlag":null,"breakerConfiguration":null,"busBarConfiguration":null,"mRID":"test"}}
``n

