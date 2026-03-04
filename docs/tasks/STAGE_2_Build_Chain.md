# STAGE 2: BUILD CHAIN (ANCESTORS)

## Mục tiêu
Xây dựng chuỗi các tổ tiên (ancestors) từ root đến selected organisation
**Chỉ xây dựng chain, KHÔNG fetch descendants**

## Chức năng chính
- `buildAncestors()`

## Tasks

### Task 2.1: Get parentArr from node
- [ ] Lấy mảng `parentArr` từ tree node
- [ ] Kiểm tra parentArr tồn tại và là mảng
- [ ] Log số lượng ancestors

### Task 2.2: Process each ancestor
- [ ] Duyệt qua từng ancestor trong parentArr
- [ ] Thứ tự: ROOT → Parent_1 → ... → (parent of selected)
- [ ] Với mỗi ancestor:
  - [ ] Lấy `mrid` hoặc `id`
  - [ ] Kiểm tra có `_serverData` không
  - [ ] Nếu không có → Fetch từ API `getOrganisationById()`
  - [ ] Build ancestor object với:
    - `id`: ancestor id
    - `mrid`: ancestor id
    - `name`: ancestor name
    - `parentId`: id của parent trước đó
    - `_type`: 'organisation'
    - `_serverData`: data từ server

### Task 2.3: Add selected organisation
- [ ] Thêm selected organisation vào cuối chain
- [ ] Lấy `mrid` và `name` từ node
- [ ] Fetch data từ API nếu cần
- [ ] Set `parentId` = parent cuối cùng trong chain

### Task 2.4: Update Progress
- [ ] Cập nhật progress: 10% → 30%
- [ ] Emit progress event

## Code Template

```javascript
async function buildAncestors(node) {
  console.log('[STAGE 2] buildAncestors - START')
  console.log('[STAGE 2] node:', node)
  console.log('[STAGE 2] parentArr:', node.parentArr)

  const chain = []
  let prevParentId = '' // ROOT sẽ được gán sau

  // Task 2.1: Get parentArr from node
  if (!node.parentArr || !Array.isArray(node.parentArr)) {
    console.warn('[STAGE 2] parentArr is missing or not an array')
  } else {
    console.log('[STAGE 2] Processing', node.parentArr.length, 'ancestors')
  }

  // Task 2.2: Process each ancestor
  if (node.parentArr && Array.isArray(node.parentArr)) {
    for (let i = 0; i < node.parentArr.length; i++) {
      const ancestor = node.parentArr[i]
      const ancestorId = ancestor.mrid || ancestor.id

      if (!ancestorId) continue

      // Fetch data nếu chưa có
      let ancestorData = null
      if (ancestor._serverData) {
        ancestorData = ancestor._serverData
      } else {
        try {
          const response = await demoAPI.getOrganisationById(ancestorId)
          ancestorData = response.data || response
        } catch (e) {
          console.warn('[STAGE 2] Could not fetch ancestor:', ancestorId, e.message)
        }
      }

      // Build ancestor object
      chain.push({
        id: ancestorId,
        mrid: ancestorId,
        name: ancestor.parent || ancestor.name || '',
        parentId: prevParentId,
        _type: 'organisation',
        _serverData: ancestorData || { id: ancestorId, name: ancestor.parent }
      })

      prevParentId = ancestorId
    }
  }

  // Task 2.3: Add selected organisation
  const selectedOrgId = node.mrid || node.id

  // Fetch selected org data
  let orgData = null
  if (node._serverData) {
    orgData = node._serverData
  } else {
    try {
      const response = await demoAPI.getChildOrganisation(selectedOrgId)
      if (response.data && Array.isArray(response.data)) {
        orgData = response.data.find(org => org.id == selectedOrgId || org.mrid == selectedOrgId)
      }
    } catch (e) {
      console.warn('[STAGE 2] Could not fetch selected org:', selectedOrgId, e.message)
    }
  }

  chain.push({
    id: selectedOrgId,
    mrid: selectedOrgId,
    name: node.name || node.aliasName || '',
    parentId: node.parentId || prevParentId,
    _type: 'organisation',
    _serverData: orgData || { id: selectedOrgId, name: node.name }
  })

  console.log('[STAGE 2] Chain built:', chain)
  console.log('[STAGE 2] buildAncestors - END')

  // Task 2.4: Update Progress
  updateProgress(30, 'building_chain', 'Đã xây dựng chain')

  return chain
}
```

## Progress Values
- Start: 10%
- End: 30%

## Error Handling

| Error | Action |
|-------|--------|
| parentArr missing | Tiếp tục với chỉ selected org |
| Network timeout | Retry 3 lần → Skip + Log |
| Server 404 | Skip + Log warning |
| Server 500 | Throw error |

## Dependencies
- API: `getOrganisationById()`, `getChildOrganisation()`
- Input: `node` với `parentArr`

## Previous Stage
- Input: `node` từ Stage 1

## Next Stage
- Output: `chain` array → Stage 3: Download Chain
