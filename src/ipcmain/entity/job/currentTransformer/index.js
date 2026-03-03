'use strict'
import {ipcMain} from 'electron'
import {entityFunc} from "@/function"

export const insertCurrentTransformerJob = () => {
    ipcMain.handle('insertCurrentTransformerJob', async function (event,old_data, data) {
        console.log('=== IPC MAIN INSERT CURRENT TRANSFORMER JOB DEBUG START ===');
        console.log('Received old_data:', old_data);
        console.log('Received data:', data);
        
        try {
            console.log('Calling insertCurrentTransformerJobEntity...');
            const rs = await entityFunc.jobEntityFunc.currentTransformerJob.insertCurrentTransformerJobEntity(old_data, data);
            console.log('insertCurrentTransformerJobEntity result:', rs);
            
            if (rs.success == true) {
                console.log('✅ Success - returning data:', rs.data);
                console.log('=== IPC MAIN INSERT CURRENT TRANSFORMER JOB DEBUG END ===');
                return {
                    success: true,
                    message: "Success",
                    data : rs.data
                }
            }
            else {
                console.log('❌ Failed - rs.success is false');
                console.log('Full rs object:', rs);
                console.log('=== IPC MAIN INSERT CURRENT TRANSFORMER JOB DEBUG END ===');
                return {
                    success: false,
                    message: rs.message || "fail",
                }
            }
        } catch (error) {
            console.error('❌ Exception in insertCurrentTransformerJob IPC:', error);
            console.error('Error stack:', error.stack);
            console.log('=== IPC MAIN INSERT CURRENT TRANSFORMER JOB DEBUG END ===');
            return {
                error: error,
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
            }
        }
    })
}

export const getCurrentTransformerJobByMrid = () => {
    ipcMain.handle('getCurrentTransformerJobByMrid', async function (event, mrid) {
        try {
            const rs = await entityFunc.jobEntityFunc.currentTransformerJob.getCurrentTransformerJobEntity(mrid)
            if (rs.success == true) {
                return {
                    success: true,
                    message: "Success",
                    data : rs.data
                }
            }
            else {
                return {
                    success: false,
                    message: "fail",
                }
            }
        } catch (error) {
            return {
                error: error,
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
            }
        }
    })
}

export const deleteCurrentTransformerJobByMrid = () => {
    ipcMain.handle('deleteCurrentTransformerJobByMrid', async function (event, data) {
        try {
            const rs = await entityFunc.jobEntityFunc.currentTransformerJob.deleteCurrentTransformerJobEntity(data)
            if (rs.success == true) {
                return {
                    success: true,
                    message: "Success",
                    data : data
                }
            }
            else {
                return {
                    success: false,
                    message: "fail",
                }
            }
        } catch (error) {
            return {
                error: error,
                success: false,
                message: (error && error.message) ? error.message : "Internal error",
            }
        }
    })
}


export const active = () => {
    insertCurrentTransformerJob()
    getCurrentTransformerJobByMrid()
    deleteCurrentTransformerJobByMrid()
}