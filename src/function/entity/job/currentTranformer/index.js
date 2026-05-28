import db from '../../../datacontext/index.js'
import * as attachmentContext from '../../../attachmentcontext/index'
import path from 'path'
import { uploadAttachmentTransaction, deleteAttachmentByIdTransaction, backupAllFilesInDir, deleteBackupFiles, restoreFiles, syncFilesWithDeletion, getAttachmentByForeignIdAndType } from '@/function/entity/attachment'
import { insertOldWorkTransaction, getOldWorkById, deleteOldWorkByIdTransaction } from "@/function/cim/oldWork/index"
import { insertTestingEquipmentTransaction, getTestingEquipmentByWorkId, deleteTestingEquipmentByIdTransaction } from '../../testingEquipment/index.js'
import CurrentTransformerJobEntity from '@/views/Flatten/Job/CurrentTransformer/index.js'
import { insertWorkTaskTransaction, getWorkTaskByWork, deleteWorkTaskByIdTransaction } from '@/function/cim/workTask/index.js'
import { insertCurrentTransformerTestingEquipmentTestTypeTransaction, getCurrentTransformerTestingEquipmentTestingEqId, deleteCurrentTransformerTestingEquipmentTestTypeByIdTransaction } from '../../currentTranformerTestingEquipmentTestType/index.js'
import { insertTestDataSetTransaction, getTestDataSetByWorkTaskId, deleteTestDataSetByIdTransaction } from '@/function/cim/testDataSet'
import { insertAnalogValueTransaction, getAnalogValueByTestDataSetMrids, deleteAnalogValueByIdTransaction } from '@/function/cim/analogValue/index.js'
import { insertStringMeasurementValueTransaction, getStringMeasurementValueByTestDataSetMrids, deleteStringMeasurementValueByIdTransaction } from '@/function/cim/stringMeasurementValue/index.js'
import { insertDiscreteValueTransaction, getDiscreteValueByTestDataSetMrids, deleteDiscreteValueByIdTransaction } from '@/function/cim/discreteValue/index.js'
import { insertProcedureDataSetMeasurementValueTransaction } from '@/function/cim/procedureDataSetMeasurementValue/index.js'
import { insertProcedureAssetTransaction } from '@/function/cim/procedureAsset/index.js'
import { insertCustomizedStandardTransaction, deleteCustomizedStandardByIdTransaction, getCustomizedStandardById } from '@/function/cim/customizedStandard/index.js'
import { insertTestStandardTransaction, deleteTestStandardByIdTransaction, getTestStandardByWorkTaskId } from '@/function/cim/testStandard/index.js'
import { insertAssessmentTransaction, deleteAssessmentByIdTransaction, getAssessmentInGroupIds } from '@/function/cim/assessment/index.js'
import { insertAssessmentGroupTransaction, deleteAssessmentGroupByIdTransaction, getAssessmentGroupByParentId, getAssessmentGroupByRuleId } from '@/function/cim/assessmentGroup/index.js'
import { insertAssessmentRuleTransaction, deleteAssessmentRuleByIdTransaction, getAssessmentRuleByStandardId } from '@/function/cim/assessmentRule/index.js'


export const insertCurrentTransformerJobEntity = async (old_entity, entity) => {
    try {
        if (entity.oldWork.mrid === null || entity.oldWork.mrid === '') {
            const result = {
                success: false,
                error: new Error("MRID is required for Current Transformer Job Entity"),
                message: '',
            }
            return result;
        } else {
            const syncResult = syncFilesWithDeletion(JSON.parse(entity.attachment.path), null, entity.oldWork.mrid);
            if (!syncResult.success) {
                restoreFiles(null, null, entity.oldWork.mrid);
                deleteBackupFiles(null, entity.oldWork.mrid);
                const result = {
                    success: false,
                    error: new Error("MRID is required for Current Transformer Job Entity"),
                    message: '',
                }
                return result;
            }

            for (const attachment of entity.attachmentTest) {
                if (attachment.id && Array.isArray(JSON.parse(attachment.path))) {
                    const syncResult = syncFilesWithDeletion(JSON.parse(attachment.path), null, attachment.id_foreign);
                    if (!syncResult.success) {
                        restoreFiles(null, null, attachment.id_foreign);
                        deleteBackupFiles(null, attachment.id_foreign);
                        const result = {
                            success: false,
                            error: new Error("MRID is required for Current Transformer Job Entity"),
                            message: '',
                        }
                        return result;
                    }
                }
            }

            await runAsync('BEGIN TRANSACTION');
            await insertOldWorkTransaction(entity.oldWork, db);
            if (entity.attachment.id && Array.isArray(JSON.parse(entity.attachment.path))) {
                const pathData = JSON.parse(entity.attachment.path);
                const newPath = []
                for (let i = 0; i < pathData.length; i++) {
                    const namefile = path.basename(pathData[i].path);
                    pathData[i].path = path.join(attachmentContext.getAttachmentDir(), namefile);
                    newPath.push(pathData[i]);
                }
                entity.attachment.path = JSON.stringify(newPath);
                await uploadAttachmentTransaction(entity.attachment, db);
            }

            for (const procedureAsset of entity.procedureAsset) {
                await insertProcedureAssetTransaction(procedureAsset, db);
            }

            //testing equipment
            const newIds = entity.testingEquipment.map(v => v.mrid).filter(id => id); // bỏ null/empty
            const oldIds = old_entity.testingEquipment.map(v => v.mrid).filter(id => id);

            const toAdd = entity.testingEquipment.filter(v => v.mrid && !oldIds.includes(v.mrid));
            const toDelete = old_entity.testingEquipment.filter(v => v.mrid && !newIds.includes(v.mrid));
            const toUpdate = entity.testingEquipment.filter(v => v.mrid && oldIds.includes(v.mrid));
            for (const equipment of toAdd) {
                await insertTestingEquipmentTransaction(equipment, db);
            }
            for (const equipment of toUpdate) {
                await insertTestingEquipmentTransaction(equipment, db);
            }

            //currentTransformerTestingEquipmentTestType
            const newIdsSet = entity.currentTransformerTestingEquipmentTestType.map(v => v.mrid).filter(id => id); // bỏ null/empty
            const oldIdsSet = old_entity.currentTransformerTestingEquipmentTestType.map(v => v.mrid).filter(id => id);

            const toAddSet = entity.currentTransformerTestingEquipmentTestType.filter(v => v.mrid && !oldIdsSet.includes(v.mrid));
            const toDeleteSet = old_entity.currentTransformerTestingEquipmentTestType.filter(v => v.mrid && !newIdsSet.includes(v.mrid));
            const toUpdateSet = entity.currentTransformerTestingEquipmentTestType.filter(v => v.mrid && oldIdsSet.includes(v.mrid));

            for (const equipmentTestType of toAddSet) {
                await insertCurrentTransformerTestingEquipmentTestTypeTransaction(equipmentTestType, db);
            }

            for (const equipmentTestType of toUpdateSet) {
                await insertCurrentTransformerTestingEquipmentTestTypeTransaction(equipmentTestType, db);
            }

            //customized standard
            const newCustomizedIds = entity.standardCustomized.map(v => v.mrid).filter(id => id); // bỏ null/empty
            const oldCustomizedIds = old_entity.standardCustomized.map(v => v.mrid).filter(id => id);

            const toAddCustomized = entity.standardCustomized.filter(v => v.mrid && !oldCustomizedIds.includes(v.mrid));
            const toDeleteCustomized = old_entity.standardCustomized.filter(v => v.mrid && !newCustomizedIds.includes(v.mrid));
            const toUpdateCustomized = entity.standardCustomized.filter(v => v.mrid && oldCustomizedIds.includes(v.mrid));
            for (const customized of toAddCustomized) {
                await insertCustomizedStandardTransaction(customized, db);
            }
            for (const customized of toUpdateCustomized) {
                await insertCustomizedStandardTransaction(customized, db);
            }

            //insert work tasks
            const newIdsWorkTask = entity.workTasks.map(v => v.mrid).filter(id => id); // bỏ null/empty
            const oldIdsWorkTask = old_entity.workTasks.map(v => v.mrid).filter(id => id);

            const toAddWorkTask = entity.workTasks.filter(v => v.mrid && !oldIdsWorkTask.includes(v.mrid));
            const toDeleteWorkTask = old_entity.workTasks.filter(v => v.mrid && !newIdsWorkTask.includes(v.mrid));
            const toUpdateWorkTask = entity.workTasks.filter(v => v.mrid && oldIdsWorkTask.includes(v.mrid));

            for (const workTask of toAddWorkTask) {
                await insertWorkTaskTransaction(workTask, db);
            }

            for (const workTask of toUpdateWorkTask) {
                await insertWorkTaskTransaction(workTask, db);
            }

            //attachemt
            if (entity.attachment.id && Array.isArray(JSON.parse(entity.attachment.path))) {
                const pathData = JSON.parse(entity.attachment.path);
                const newPath = []
                for (let i = 0; i < pathData.length; i++) {
                    const namefile = path.basename(pathData[i].path);
                    pathData[i].path = path.join(attachmentContext.getAttachmentDir(), entity.attachment.id_foreign, namefile);
                    newPath.push(pathData[i]);
                }
                entity.attachment.path = JSON.stringify(newPath);
                await uploadAttachmentTransaction(entity.attachment, db);
            }

            //attachment test
            for (const attachment of entity.attachmentTest) {
                if (attachment.id && Array.isArray(JSON.parse(attachment.path))) {
                    const pathData = JSON.parse(attachment.path);
                    const newPath = []
                    for (let i = 0; i < pathData.length; i++) {
                        const namefile = path.basename(pathData[i].path);
                        pathData[i].path = path.join(attachmentContext.getAttachmentDir(), attachment.id_foreign, namefile);
                        newPath.push(pathData[i]);
                    }
                    attachment.path = JSON.stringify(newPath);
                    await uploadAttachmentTransaction(attachment, db);
                }
            }

            //test standard
            const newTestStandardIds = entity.testStandard.map(v => v.mrid).filter(id => id); // bỏ null/empty
            const oldTestStandardIds = old_entity.testStandard.map(v => v.mrid).filter(id => id);

            const toAddTestStandard = entity.testStandard.filter(v => v.mrid && !oldTestStandardIds.includes(v.mrid));
            const toDeleteTestStandard = old_entity.testStandard.filter(v => v.mrid && !newTestStandardIds.includes(v.mrid));
            const toUpdateTestStandard = entity.testStandard.filter(v => v.mrid && oldTestStandardIds.includes(v.mrid));
            for (const testStandard of toAddTestStandard) {
                await insertTestStandardTransaction(testStandard, db);
            }
            for (const testStandard of toUpdateTestStandard) {
                await insertTestStandardTransaction(testStandard, db);
            }

            //assessment rule
            const newAssessmentRuleIds = entity.assessment_rule.map(v => v.mrid).filter(id => id); // bỏ null/empty
            const oldAssessmentRuleIds = old_entity.assessment_rule.map(v => v.mrid).filter(id => id);

            const toAddAssessmentRule = entity.assessment_rule.filter(v => v.mrid && !oldAssessmentRuleIds.includes(v.mrid));
            const toDeleteAssessmentRule = old_entity.assessment_rule.filter(v => v.mrid && !newAssessmentRuleIds.includes(v.mrid));
            const toUpdateAssessmentRule = entity.assessment_rule.filter(v => v.mrid && oldAssessmentRuleIds.includes(v.mrid));

            for (const assessmentRule of toAddAssessmentRule) {
                await insertAssessmentRuleTransaction(assessmentRule, db);
            }

            for (const assessmentRule of toUpdateAssessmentRule) {
                await insertAssessmentRuleTransaction(assessmentRule, db);
            }

            //assessment group
            const newAssessmentGroupIds = entity.assessment_group.map(v => v.mrid).filter(id => id); // bỏ null/empty
            const oldAssessmentGroupIds = old_entity.assessment_group.map(v => v.mrid).filter(id => id);

            const toAddAssessmentGroup = entity.assessment_group.filter(v => v.mrid && !oldAssessmentGroupIds.includes(v.mrid));
            const toDeleteAssessmentGroup = old_entity.assessment_group.filter(v => v.mrid && !newAssessmentGroupIds.includes(v.mrid));
            const toUpdateAssessmentGroup = entity.assessment_group.filter(v => v.mrid && oldAssessmentGroupIds.includes(v.mrid));
            for (const assessmentGroup of toAddAssessmentGroup) {
                await insertAssessmentGroupTransaction(assessmentGroup, db);
            }
            for (const assessmentGroup of toUpdateAssessmentGroup) {
                await insertAssessmentGroupTransaction(assessmentGroup, db);
            }

            //assessment
            const newAssessmentIds = entity.assessment.map(v => v.mrid).filter(id => id); // bỏ null/empty
            const oldAssessmentIds = old_entity.assessment.map(v => v.mrid).filter(id => id);
            const toAddAssessment = entity.assessment.filter(v => v.mrid && !oldAssessmentIds.includes(v.mrid));
            const toDeleteAssessment = old_entity.assessment.filter(v => v.mrid && !newAssessmentIds.includes(v.mrid));
            const toUpdateAssessment = entity.assessment.filter(v => v.mrid && oldAssessmentIds.includes(v.mrid));
            for (const assessment of toAddAssessment) {
                await insertAssessmentTransaction(assessment, db);
            }
            for (const assessment of toUpdateAssessment) {
                await insertAssessmentTransaction(assessment, db);
            }

            //testdataset
            const newIdsTestDataSet = entity.testDataSet.map(v => v.mrid).filter(id => id); // bỏ null/empty
            const oldIdsTestDataSet = old_entity.testDataSet.map(v => v.mrid).filter(id => id);

            const toAddTestDataSet = entity.testDataSet.filter(v => v.mrid && !oldIdsTestDataSet.includes(v.mrid));
            const toUpdateTestDataSet = entity.testDataSet.filter(v => v.mrid && oldIdsTestDataSet.includes(v.mrid));
            const toDeleteTestDataSet = old_entity.testDataSet.filter(v => v.mrid && !newIdsTestDataSet.includes(v.mrid));

            for (const testData of toAddTestDataSet) {
                await insertTestDataSetTransaction(testData, db);
            }

            for (const testData of toUpdateTestDataSet) {
                await insertTestDataSetTransaction(testData, db);
            }

            //analog value
            const newIdsAnalogValue = entity.analogValues.map(v => v.mrid).filter(id => id); // bỏ null/empty
            const oldIdsAnalogValue = old_entity.analogValues.map(v => v.mrid).filter(id => id);

            const toAddAnalogValue = entity.analogValues.filter(v => v.mrid && !oldIdsAnalogValue.includes(v.mrid));
            const toUpdateAnalogValue = entity.analogValues.filter(v => v.mrid && oldIdsAnalogValue.includes(v.mrid));
            const toDeleteAnalogValue = old_entity.analogValues.filter(v => v.mrid && !newIdsAnalogValue.includes(v.mrid));
            for (const analogValue of toAddAnalogValue) {
                await insertAnalogValueTransaction(analogValue, db);
            }

            for (const analogValue of toUpdateAnalogValue) {
                await insertAnalogValueTransaction(analogValue, db);
            }

            //string measurement value
            const newIdsStringMeasurementValue = entity.stringMeasurementValues.map(v => v.mrid).filter(id => id); // bỏ null/empty
            const oldIdsStringMeasurementValue = old_entity.stringMeasurementValues.map(v => v.mrid).filter(id => id);

            const toAddStringMeasurementValue = entity.stringMeasurementValues.filter(v => v.mrid && !oldIdsStringMeasurementValue.includes(v.mrid));
            const toUpdateStringMeasurementValue = entity.stringMeasurementValues.filter(v => v.mrid && oldIdsStringMeasurementValue.includes(v.mrid));
            const toDeleteStringMeasurementValue = old_entity.stringMeasurementValues.filter(v => v.mrid && !newIdsStringMeasurementValue.includes(v.mrid));
            for (const stringMeasurementValue of toAddStringMeasurementValue) {
                await insertStringMeasurementValueTransaction(stringMeasurementValue, db);
            }

            for (const stringMeasurementValue of toUpdateStringMeasurementValue) {
                await insertStringMeasurementValueTransaction(stringMeasurementValue, db);
            }

            //discrete value
            const newIdsDiscreteValue = entity.discreteValues.map(v => v.mrid).filter(id => id);
            const oldIdsDiscreteValue = old_entity.discreteValues.map(v => v.mrid).filter(id => id);

            const toAddDiscreteValue = entity.discreteValues.filter(v => v.mrid && !oldIdsDiscreteValue.includes(v.mrid));
            const toUpdateDiscreteValue = entity.discreteValues.filter(v => v.mrid && oldIdsDiscreteValue.includes(v.mrid));
            const toDeleteDiscreteValue = old_entity.discreteValues.filter(v => v.mrid && !newIdsDiscreteValue.includes(v.mrid));
            for (const discreteValue of toAddDiscreteValue) {
                await insertDiscreteValueTransaction(discreteValue, db);
            }
            for (const discreteValue of toUpdateDiscreteValue) {
                await insertDiscreteValueTransaction(discreteValue, db);
            }

            //procedure dataset measurement value
            for (const procedureDataSetMeasurementValue of entity.procedureDataSetMeasurementValue) {
                await insertProcedureDataSetMeasurementValueTransaction(procedureDataSetMeasurementValue, db);
            }


            //delete section
            // ── 1. Leaf measurement values ───────────────────────────────────────────
            for(const analogValue of toDeleteAnalogValue) {
                await deleteAnalogValueByIdTransaction(analogValue.mrid, db);
            }
            for(const stringMeasurementValue of toDeleteStringMeasurementValue) {
                await deleteStringMeasurementValueByIdTransaction(stringMeasurementValue.mrid, db);
            }
            for(const discreteValue of toDeleteDiscreteValue) {
                await deleteDiscreteValueByIdTransaction(discreteValue.mrid, db);
            }

            // ── 2. TestDataSet ────────────────────────────────────────────────────────
            for (const testData of toDeleteTestDataSet) {
                await deleteTestDataSetByIdTransaction(testData.mrid, db);
            }

            // ── 3. Equipment (equipTestType.test_type_id có thể ref workTask → xóa trước)
            for (const equipmentTestType of toDeleteSet) {
                await deleteCurrentTransformerTestingEquipmentTestTypeByIdTransaction(equipmentTestType.mrid, db);
            }
            for (const equipment of toDelete) {
                await deleteTestingEquipmentByIdTransaction(equipment.mrid, db);
            }

            // ── 4. TestStandard: xóa trước workTask (FK: testStandard.work_task_id → workTask)
            // Nếu customized → query và xóa toàn bộ chain: assessment→group→rule→standardCustomized
            for(const testStandard of toDeleteTestStandard) {
                if(testStandard.test_standard_customize) {
                    const assessmentRuleData = await getAssessmentRuleByStandardId(testStandard.test_standard_customize)
                    if(assessmentRuleData.success && assessmentRuleData.data.length > 0) {
                        for(const rule of assessmentRuleData.data) {
                            const assessmentGroupData = await getAssessmentGroupByRuleId(rule.mrid)
                            if(assessmentGroupData.success && assessmentGroupData.data) {
                                const childGroupList = [assessmentGroupData.data]
                                await collectAssessmentGroupChildren(assessmentGroupData.data, childGroupList)
                                const allGroupIds = childGroupList.map(g => g.mrid)
                                const assessmentData = await getAssessmentInGroupIds(allGroupIds)
                                if(assessmentData.success) {
                                    for(const assessment of assessmentData.data) {
                                        await deleteAssessmentByIdTransaction(assessment.mrid, db)
                                    }
                                }
                                for(const group of [...childGroupList].reverse()) {
                                    await deleteAssessmentGroupByIdTransaction(group.mrid, db)
                                }
                            }
                            await deleteAssessmentRuleByIdTransaction(rule.mrid, db)
                        }
                    }
                    await deleteTestStandardByIdTransaction(testStandard.mrid, db)
                    await deleteCustomizedStandardByIdTransaction(testStandard.test_standard_customize, db)
                } else {
                    await deleteTestStandardByIdTransaction(testStandard.mrid, db)
                }
            }

            // ── 5. WorkTask (an toàn sau khi testStandard đã xóa) ────────────────────
            for (const workTask of toDeleteWorkTask) {
                await deleteWorkTaskByIdTransaction(workTask.mrid, db);
            }

            await runAsync('COMMIT');
            return { success: true, data: entity, message: 'Current Transformer Job entity inserted successfully' };

        }
    } catch (error) {
        await runAsync('ROLLBACK');
        console.error('Error retrieving Current Transformer entity:', error);
        return { success: false, error, message: 'Error retrieving Current Transformer entity' };
    }
}

export const getCurrentTransformerJobEntity = async (id) => {
    try {
        if (id == null || id === '') {
            return { success: false, error: new Error('Invalid ID') };
        } else {
            const entity = new CurrentTransformerJobEntity()
            const dataOldWork = await getOldWorkById(id);
            if (dataOldWork.success) {
                entity.oldWork = dataOldWork.data;

                const dataAttachment = await getAttachmentByForeignIdAndType(entity.oldWork.mrid, 'job');
                if (dataAttachment.success) {
                    entity.attachment = dataAttachment.data;
                }

                const dataTestingEquipment = await getTestingEquipmentByWorkId(entity.oldWork.mrid);
                if (dataTestingEquipment.success) {
                    entity.testingEquipment = dataTestingEquipment.data;
                } else {
                    entity.testingEquipment = [];
                }

                for (const equipment of entity.testingEquipment) {
                    const dataEquipmentTestType = await getCurrentTransformerTestingEquipmentTestingEqId(equipment.mrid);
                    if (dataEquipmentTestType.success) {
                        entity.currentTransformerTestingEquipmentTestType = entity.currentTransformerTestingEquipmentTestType.concat(dataEquipmentTestType.data);
                    }
                }

                const dataWorkTask = await getWorkTaskByWork(entity.oldWork.mrid, db);
                if (dataWorkTask.success) {
                    entity.workTasks = dataWorkTask.data;
                } else {
                    entity.workTasks = [];
                }

                for (let i = 0; i < entity.workTasks.length; i++) {
                    const workTask = entity.workTasks[i];

                    const dataAttachmentTest = await getAttachmentByForeignIdAndType(workTask.mrid, 'test');
                    if (dataAttachmentTest.success) {
                        entity.attachmentTest.push(dataAttachmentTest.data);
                    }

                    const dataTestStandard = await getTestStandardByWorkTaskId(workTask.mrid);
                    if (dataTestStandard.success) {
                        entity.testStandard = entity.testStandard.concat(dataTestStandard.data);
                    }

                    if (dataTestStandard.data) {
                        if (dataTestStandard.data.test_standard_customize) {
                            const customizedStandard = await getCustomizedStandardById(dataTestStandard.data.test_standard_customize);
                            if (customizedStandard.success) {
                                entity.standardCustomized = entity.standardCustomized.concat(customizedStandard.data);
                                const assessmentRule = await getAssessmentRuleByStandardId(customizedStandard.data.mrid);
                                if (assessmentRule.success) {
                                    entity.assessment_rule = entity.assessment_rule.concat(assessmentRule.data);
                                    for (const rule of assessmentRule.data) {
                                        const assessmentGroupParent = await getAssessmentGroupByRuleId(rule.mrid);
                                        if (assessmentGroupParent.success) {
                                            entity.assessment_group.push(assessmentGroupParent.data)
                                            await getAssessmentGroupChild(assessmentGroupParent.data, entity.assessment_group);
                                        }
                                    }
                                }
                            }
                        }
                    }

                    const dataAssessment = await getAssessmentInGroupIds(entity.assessment_group.map(g => g.mrid));
                    if (dataAssessment.success) {
                        entity.assessment = entity.assessment.concat(dataAssessment.data);
                    }

                    const dataTestDataSet = await getTestDataSetByWorkTaskId(workTask.mrid)
                    if (dataTestDataSet.success) {
                        entity.testDataSet = entity.testDataSet.concat(dataTestDataSet.data)
                    }
                }

                const mrids = entity.testDataSet.map(x => x.mrid);
                const analogValue = await getAnalogValueByTestDataSetMrids(mrids);
                if (analogValue.success) {
                    entity.analogValues = analogValue.data;
                }

                const stringMeasurementValue = await getStringMeasurementValueByTestDataSetMrids(mrids);
                if (stringMeasurementValue.success) {
                    entity.stringMeasurementValues = stringMeasurementValue.data;
                }

                const discreteValue = await getDiscreteValueByTestDataSetMrids(mrids);
                if (discreteValue.success) {
                    entity.discreteValues = discreteValue.data;
                }

                return {
                    success: true,
                    data: entity,
                    message: 'Current Transformer job entity retrieved successfully'
                }
            } else {
                return { success: false, error: dataOldWork.error, message: 'Error retrieving old work data' };
            }
        }
    } catch (error) {
        console.error('Error retrieving Current Transformer job entity:', error);
        return { success: false, error, message: 'Error retrieving Current Transformer job entity' };
    }
}

export const deleteCurrentTransformerJobEntity = async (entity) => {
    try {
        await runAsync('BEGIN TRANSACTION');

        // 1. Xóa các giá trị đo lường chi tiết (Measurement Values)
        if (entity.analogValues && entity.analogValues.length > 0) {
            for (const item of entity.analogValues) {
                await deleteAnalogValueByIdTransaction(item.mrid, db);
            }
        }
        if (entity.stringMeasurementValues && entity.stringMeasurementValues.length > 0) {
            for (const item of entity.stringMeasurementValues) {
                await deleteStringMeasurementValueByIdTransaction(item.mrid, db);
            }
        }
        if (entity.discreteValues && entity.discreteValues.length > 0) {
            for (const item of entity.discreteValues) {
                await deleteDiscreteValueByIdTransaction(item.mrid, db);
            }
        }

        // 2. Xóa Test Data Sets
        if (entity.testDataSet && entity.testDataSet.length > 0) {
            for (const item of entity.testDataSet) {
                await deleteTestDataSetByIdTransaction(item.mrid, db);
            }
        }

        // 3. Xóa Quan hệ thiết bị kiểm tra (Test Type relation)
        if (entity.currentTransformerTestingEquipmentTestType && entity.currentTransformerTestingEquipmentTestType.length > 0) {
            for (const item of entity.currentTransformerTestingEquipmentTestType) {
                await deleteCurrentTransformerTestingEquipmentTestTypeByIdTransaction(item.mrid, db);
            }
        }

        // 4. Xóa Thiết bị kiểm tra (Testing Equipment)
        if (entity.testingEquipment && entity.testingEquipment.length > 0) {
            for (const item of entity.testingEquipment) {
                await deleteTestingEquipmentByIdTransaction(item.mrid, db);
            }
        }

        if(entity.testStandard && entity.testStandard.length > 0) {
            for(const item of entity.testStandard) {
                await deleteTestStandardByIdTransaction(item.mrid, db);
            }
        }

        if(entity.assessment && entity.assessment.length > 0) {
            for(const item of entity.assessment) {
                await deleteAssessmentByIdTransaction(item.mrid, db);
            }
        }

        if(entity.assessment_group && entity.assessment_group.length > 0) {
            await deleteAssessmentGroupSafe(entity.assessment_group);
        }


        if(entity.assessment_rule && entity.assessment_rule.length > 0) {
            for(const item of entity.assessment_rule) {
                await deleteAssessmentRuleByIdTransaction(item.mrid, db);
            }
        }

        if(entity.standardCustomized && entity.standardCustomized.length > 0) {
            for(const item of entity.standardCustomized) {
                await deleteCustomizedStandardByIdTransaction(item.mrid, db);
            }
        }

        // 5. Xóa Work Tasks
        if (entity.workTasks && entity.workTasks.length > 0) {
            for (const item of entity.workTasks) {
                await deleteWorkTaskByIdTransaction(item.mrid, db);
            }
        }

        // 6. Xóa bản ghi Attachment trong Database
        // Xóa Main Attachment
        if (entity.attachment && entity.attachment.id) {
            await deleteAttachmentByIdTransaction(entity.attachment.id, db);
        }
        // Xóa Attachment của từng WorkTask (Test Attachments)
        if (entity.attachmentTest && entity.attachmentTest.length > 0) {
            for (const attachment of entity.attachmentTest) {
                if (attachment.id) {
                    await deleteAttachmentByIdTransaction(attachment.id, db)
                }
            }
        }

        // 7. Xóa Job chính (OldWork)
        if (entity.oldWork && entity.oldWork.mrid) {
            await deleteOldWorkByIdTransaction(entity.oldWork.mrid, db);
        }

        await runAsync('COMMIT');

        // 8. Xóa file vật lý sau khi Commit DB thành công (Tránh mất file nếu DB rollback)
        // Xóa file Main Attachment
        if (entity.attachment && entity.attachment.path) {
            const pathData = JSON.parse(entity.attachment.path || '[]');
            if (Array.isArray(pathData) && pathData.length > 0) {
                syncFilesWithDeletion(pathData, null, entity.oldWork.mrid);
            }
        }
        // Xóa file Test Attachments
        if (entity.attachmentTest && entity.attachmentTest.length > 0) {
            for (const attachment of entity.attachmentTest) {
                if (attachment.path) {
                    const pathData = JSON.parse(attachment.path || '[]');
                    if (Array.isArray(pathData) && pathData.length > 0) {
                        syncFilesWithDeletion(pathData, null, attachment.id_foreign);
                    }
                }
            }
        }

        return { success: true, message: 'Current Transformer Job entity deleted successfully' };

    } catch (error) {
        await runAsync('ROLLBACK');
        console.error('Delete Current Transformer Job Error:', error);
        return { success: false, error, message: 'Error deleting Current Transformer Job entity' };
    }
}

const collectAssessmentGroupChildren = async (parentData, groupList) => {
    const child = await getAssessmentGroupByParentId(parentData.mrid)
    if(child.success && child.data.length > 0) {
        for(const group of child.data) {
            groupList.push(group)
            await collectAssessmentGroupChildren(group, groupList)
        }
    }
}

const runAsync = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve();
        });
    });
};

const getAssessmentGroupChild = async (parentData, assessmentGroupList) => {
    const child = await getAssessmentGroupByParentId(parentData.mrid)
    if(child.success && child.data.length > 0) {
        for(const group of child.data) {
            assessmentGroupList.push(group)  // ✅ push từng item, mutate trực tiếp
            await getAssessmentGroupChild(group, assessmentGroupList)
        }
    }
}

const deleteAssessmentGroupSafe = async (groups) => {
    // Sắp xếp: children trước, parents sau
    // Node có parent_id → xóa trước; node không có parent_id → xóa sau
    const sorted = [...groups].sort((a, b) => {
        if (a.parent_id && !b.parent_id) return -1  // a là child → lên trước
        if (!a.parent_id && b.parent_id) return 1   // b là child → b lên trước
        return 0
    })

    for (const group of sorted) {
        await deleteAssessmentGroupByIdTransaction(group.mrid, db);
    }
}