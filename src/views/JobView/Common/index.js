/* eslint-disable */
import uuid from "@/utils/uuid";
export const buildEmptyTestRow = (columns) => {
  const row = {
    mrid: '', // mrid của cả row test
  }
  columns.forEach(col => {
    row[col.code] = {
      mrid: '',                // mrid của measurement
      value: "",                     // giá trị test (user nhập sau)
      unit: col.unit || "",
      type: col.type,
      measurement_id: col.mrid, // id của measurement
    }
  })

  return row
}

export const buildEmptyTestAssessment = (standardArr) => {
  const result = []

  for (const st of standardArr) {

    let workingStandard = JSON.parse(JSON.stringify(st))
    const stJson = JSON.parse(JSON.stringify(st))

    // ===== 1. CLONE + REMAP nếu customized =====
    if (st.type === 'customized') {

      const ruleMap = {}
      const groupMap = {}

      const newStandardId = uuid.newUuid()

      // RULE
      const newRules = stJson.assessment_rule.map(r => {
        const newId = uuid.newUuid()
        ruleMap[r.mrid] = newId
        return {
          ...r,
          mrid: newId,
          standard_id: newStandardId
        }
      })

      // GROUP
      const newGroups = stJson.assessment_group.map(g => {
        const newId = uuid.newUuid()
        groupMap[g.mrid] = newId
        return {
          ...g,
          mrid: newId,
          rule_id: ruleMap[g.rule_id]
        }
      })

      // fix parent_id
      const fixedGroups = newGroups.map(g => ({
        ...g,
        parent_id: g.parent_id ? groupMap[g.parent_id] : ''
      }))

      // ASSESSMENT
      const newAssessment = stJson.assessment.map(a => ({
        ...a,
        mrid: uuid.newUuid(),
        group_id: groupMap[a.group_id]
      }))

      workingStandard = {
        ...st,
        mrid: newStandardId,
        assessment_rule: newRules,
        assessment_group: fixedGroups,
        assessment: newAssessment
      }
    }

    // ===== 2. BUILD TREE (FORM UI) =====

    // map group
    const groupNodeMap = {}
    const roots = []

    workingStandard.assessment_group.forEach(g => {
      groupNodeMap[g.mrid] = {
        ...g,
        children: [],
        conditions: []
      }
    })

    // build tree
    workingStandard.assessment_group.forEach(g => {
      if (g.parent_id) {
        groupNodeMap[g.parent_id]?.children.push(groupNodeMap[g.mrid])
      } else {
        roots.push(groupNodeMap[g.mrid])
      }
    })

    // attach conditions
    workingStandard.assessment.forEach(a => {
      const group = groupNodeMap[a.group_id]
      if (group) {
        group.conditions.push(a) // 👈 giữ reference để bind
      }
    })

    // attach result
    const ruleMapFinal = {}
    workingStandard.assessment_rule.forEach(r => {
      ruleMapFinal[r.mrid] = r.result
    })

    Object.values(groupNodeMap).forEach(g => {
      g.result = ruleMapFinal[g.rule_id] || ''
    })

    // ===== 3. PUSH KẾT QUẢ =====
    result.push({
      mrid: workingStandard.mrid,
      name: workingStandard.name,
      type: workingStandard.type,
      code: workingStandard.code,
      tree: roots // 👈 dùng cho UI
    })
  }

  return result
}

export const buildEmptyTestAssessmentOriginal = (standardArr) => {
  const result = []

  for (const st of standardArr) {

    let workingStandard = JSON.parse(JSON.stringify(st))

    // ===== 2. BUILD TREE (FORM UI) =====

    // map group
    const groupNodeMap = {}
    const roots = []

    workingStandard.assessment_group.forEach(g => {
      groupNodeMap[g.mrid] = {
        ...g,
        children: [],
        conditions: []
      }
    })

    // build tree
    workingStandard.assessment_group.forEach(g => {
      if (g.parent_id) {
        groupNodeMap[g.parent_id]?.children.push(groupNodeMap[g.mrid])
      } else {
        roots.push(groupNodeMap[g.mrid])
      }
    })

    // attach conditions
    workingStandard.assessment.forEach(a => {
      const group = groupNodeMap[a.group_id]
      if (group) {
        group.conditions.push(a) // 👈 giữ reference để bind
      }
    })

    // attach result
    const ruleMapFinal = {}
    workingStandard.assessment_rule.forEach(r => {
      ruleMapFinal[r.mrid] = r.result
    })

    Object.values(groupNodeMap).forEach(g => {
      g.result = ruleMapFinal[g.rule_id] || ''
    })

    // ===== 3. PUSH KẾT QUẢ =====
    result.push({
      mrid: workingStandard.mrid,
      name: workingStandard.name,
      type: workingStandard.type,
      code: workingStandard.code,
      tree: roots // 👈 dùng cho UI
    })
  }

  return result
}

export const buildConfigFromAssessmentTree = (assessmentData) => {
  const result = []

  for (const st of assessmentData) {

    const groups = []
    const rules = {}
    const assessments = []

    let order = 0 // 👈 optional (debug / sort)

    // ===== DFS flatten =====
    const traverse = (node, parentId = '') => {

      // 1. GROUP (đảm bảo thứ tự push đúng)
      groups.push({
        mrid: node.mrid || null,
        rule_id: node.rule_id || null,
        parent_id: parentId || null,
        logic: node.logic || '',
        is_default: node.is_default || false
      })

      // 2. RULE (unique)
      if (node.rule_id && !rules[node.rule_id]) {
        rules[node.rule_id] = {
          mrid: node.rule_id || null,
          standard_id: st.mrid || null,
          result: node.result || '',
          priority: ''
        }
      }

      // 3. CONDITIONS → ASSESSMENT
      ; (node.conditions || []).forEach(cond => {
        assessments.push({
          ...cond,
          group_id: node.mrid || null
        })
      })

        // 4. CHILDREN (DFS → đảm bảo thứ tự)
        ; (node.children || []).forEach(child => {
          traverse(child, node.mrid)
        })
    }

      // ROOT nodes (giữ nguyên thứ tự root)
      ; (st.tree || []).forEach(root => traverse(root))

    // ===== BUILD STANDARD =====
    result.push({
      mrid: st.mrid,
      name: st.name,
      type: st.type,
      code: st.code,

      assessment_rule: Object.values(rules),

      // 👇 groups đã đúng thứ tự insert DB
      assessment_group: groups,

      assessment: assessments
    })
  }

  return result
}

export const buildEmptyTestCondition = (columns) => {
  const row = {
  }
  columns.forEach(col => {
    row[col.code] = {
      mrid: '',                // mrid của measurement
      value: "",                     // giá trị test (user nhập sau)
      unit: col.unit || "",
      type: col.type,
      measurement_id: col.mrid, // id của measurement
    }
  })

  return row
}

export const assessmentToValue = (assessment) => {
  if (assessment == 'Pass') {
    return 1
  } else if (assessment == 'Fail') {
    return 0
  }
}

export const conditionIndicatorToValue = (conditionIndicator) => {
  if (conditionIndicator == 'Good') {
    return 3
  } else if (conditionIndicator == 'Fair') {
    return 2
  } else if (conditionIndicator == 'Poor') {
    return 1
  } else if (conditionIndicator == 'Bad') {
    return 0
  }
}

const operatorMap = {
  '≥': '>=',
  '≤': '<=',
  '>': '>',
  '<': '<',
  '=': '===',
  '≠': '!==',
}

const getOperator = (symbol) => {
  return operatorMap[symbol] || '==='
}

export const compare = (value, operator, threshold) => {

  const op = getOperator(operator)

  const left = Number(value)
  const right = Number(threshold)

  switch (op) {

    case '>=' || '≥':
      return left >= right

    case '<=' || '≤':
      return left <= right

    case '>':
      return left > right

    case '<':
      return left < right

    case '===':
      return left === right

    case '!==':
      return left !== right

    default:
      return false
  }
}

export const traverseAndFillMrid = async (obj) => {
  if (Array.isArray(obj)) {
    for (const item of obj) {
      await traverseAndFillMrid(item);  // ✅ await đúng cách
    }
  } else if (obj !== null && typeof obj === "object") {
    if ("mrid" in obj) {
      if (!obj.mrid || obj.mrid === "") {
        obj.mrid = uuid.newUuid();
      }
    }
    for (const val of Object.values(obj)) {
      await traverseAndFillMrid(val);  // ✅ await đúng cách
    }
  }
  return obj;
}

export const changeTestStandard = async (id, type, testStandard) => {
  const typeToColumn = {
    astm: 'test_standard_astm',
    cigre: 'test_standard_cigre',
    din: 'test_standard_din',
    doble: 'test_standard_doble',
    epa: 'test_standard_epa',
    iec: 'test_standard_iec',
    ieee: 'test_standard_ieee',
    iso: 'test_standard_iso',
    laborelec: 'test_standard_laborelec',
    tappi: 'test_standard_tappi',
    ukministry_of_defence: 'test_standard_ukministry_of_defence',
    wep: 'test_standard_wep',
    customized: 'test_standard_customize'
  }
  if (typeToColumn[type]) {
    testStandard[typeToColumn[type]] = id
  }
}

export const getFullAssessmentGroupByRuleId = (assessmentGroupList, ruleId) => {
  const resultFull = []

  // lấy root theo rule
  const roots = assessmentGroupList.filter(group => group.rule_id === ruleId)

  const dfs = (group) => {
    resultFull.push(group)

    const children = assessmentGroupList.filter(
      data => data.parent_id === group.mrid
    )

    for (const child of children) {
      dfs(child)
    }
  }

  for (const root of roots) {
    dfs(root)
  }

  return resultFull
}

export const uniqueByMrid = (arr) => {
  const map = new Map()

  for (const item of arr) {
    map.set(item.mrid, item) // trùng thì overwrite
  }

  return Array.from(map.values())
}

export const testStandardDataToOption = (testStandardData) => {
  if(testStandardData) {
    const columnToType = {
        test_standard_astm: 'astm',
        test_standard_cigre: 'cigre',
        test_standard_din: 'din',
        test_standard_doble: 'doble',
        test_standard_epa: 'epa',
        test_standard_iec: 'iec',
        test_standard_ieee: 'ieee',
        test_standard_iso: 'iso',
        test_standard_laborelec: 'laborelec',
        test_standard_tappi: 'tappi',
        test_standard_ukministry_of_defence: 'ukministry_of_defence',
        test_standard_wep: 'wep',
        test_standard_customize: 'customized'
    }
    for(const [column, type] of Object.entries(columnToType)) {
      if(testStandardData[column]) {
          return type
      }
    }
    return null
  } else {
    return null
  }
}