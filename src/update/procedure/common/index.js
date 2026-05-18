// Standard type imports
import * as ieeeStandardFunc        from '@/function/cim/ieeeStandard/index'
import * as iecStandardFunc         from '@/function/cim/iecStandard/index'
import * as astmStandardFunc        from '@/function/cim/astmStandard/index'
import * as cigreStandardFunc       from '@/function/cim/cigreStandard/index'
import * as dinStandardFunc         from '@/function/cim/dinStandard/index'
import * as dobleStandardFunc       from '@/function/cim/dobleStandard/index'
import * as epaStandardFunc         from '@/function/cim/epaStandard/index'
import * as isoStandardFunc         from '@/function/cim/isoStandard/index'
import * as laborelecStandardFunc   from '@/function/cim/laborelecStandard/index'
import * as tappiStandardFunc       from '@/function/cim/tappiStandard/index'
import * as ukministryStandardFunc  from '@/function/cim/ukministryOfDefenceStandard/index'
import * as wepStandardFunc         from '@/function/cim/wepStandard/index'
import * as customizedStandardFunc  from '@/function/cim/customizedStandard/index'
// Assessment imports
import * as assessmentRuleFunc  from '@/function/cim/assessmentRule/index'
import * as assessmentGroupFunc from '@/function/cim/assessmentGroup/index'
import * as assessmentFunc      from '@/function/cim/assessment/index'

export const seedStandard = async (standard, dbsql) => {
    if (!standard || !standard.mrid) return

    var data = {
        mrid:             standard.mrid,
        name:             standard.name,
        code:             standard.code,
        standard_edition: standard.standard_edition || '',
        standard_number:  standard.standard_number  || ''
    }

    // 1. Insert standard + type-specific child table
    switch (standard.type) {
        case 'ieee':
            await ieeeStandardFunc.insertIeeeStandardTransaction(data, dbsql)
            break
        case 'iec':
            await iecStandardFunc.insertIecStandardTransaction(data, dbsql)
            break
        case 'astm':
            await astmStandardFunc.insertAstmStandardTransaction(data, dbsql)
            break
        case 'cigre':
            await cigreStandardFunc.insertCigreStandardTransaction(data, dbsql)
            break
        case 'din':
            await dinStandardFunc.insertDinStandardTransaction(data, dbsql)
            break
        case 'doble':
            await dobleStandardFunc.insertDobleStandardTransaction(data, dbsql)
            break
        case 'epa':
            await epaStandardFunc.insertEpaStandardTransaction(data, dbsql)
            break
        case 'iso':
            await isoStandardFunc.insertIsoStandardTransaction(data, dbsql)
            break
        case 'laborelec':
            await laborelecStandardFunc.insertLaborelecStandardTransaction(data, dbsql)
            break
        case 'tappi':
            await tappiStandardFunc.insertTappiStandardTransaction(data, dbsql)
            break
        case 'ukministry_of_defence':
            await ukministryStandardFunc.insertUkministryOfDefenceStandardTransaction(data, dbsql)
            break
        case 'wep':
            await wepStandardFunc.insertWepStandardTransaction(data, dbsql)
            break
        case 'customized':
            // Customized không seed ở đây — được tạo per-job
            return
        default:
            console.warn('seedStandard: unknown type', standard.type, '— skipping')
            return
    }

    // 2. assessment_rule (FK → standard.mrid đã tồn tại)
    var rules = standard.assessment_rule || []
    for (var ri = 0; ri < rules.length; ri++) {
        await assessmentRuleFunc.insertAssessmentRuleTransaction({
            mrid:        rules[ri].mrid,
            standard_id: rules[ri].standard_id || standard.mrid,
            result:      rules[ri].result,
            priority:    rules[ri].priority || ''
        }, dbsql)
    }

    // 3. assessment_group (FK → assessment_rule.mrid)
    var groups = standard.assessment_group || []
    for (var gi = 0; gi < groups.length; gi++) {
        await assessmentGroupFunc.insertAssessmentGroupTransaction({
            mrid:       groups[gi].mrid,
            rule_id:    groups[gi].rule_id,
            parent_id:  groups[gi].parent_id || null,
            logic:      groups[gi].logic || '',
            is_default: groups[gi].is_default ? 1 : 0
        }, dbsql)
    }

    // 4. assessment conditions (FK → assessment_group.mrid)
    var conditions = standard.assessment || []
    for (var ai = 0; ai < conditions.length; ai++) {
        var cond = conditions[ai]
        if (!cond.mrid) continue
        await assessmentFunc.insertAssessmentTransaction({
            mrid:           cond.mrid,
            group_id:       cond.group_id,
            measurement_id: cond.measurement_id,
            operator:       cond.operator,
            threshold:      cond.threshold,
            label:          cond.label || ''
        }, dbsql)
    }
}