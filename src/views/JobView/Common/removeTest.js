export const removeTest = async (confirm, testList, test, confirmButtonText = 'Remove') => {
    try {
        await confirm('Remove this test and its data from the job?', 'Warning', {
            confirmButtonText,
            cancelButtonText: 'Cancel',
            type: 'warning'
        })
    } catch {
        return false
    }

    const index = testList.indexOf(test)
    if (index === -1) return false
    testList.splice(index, 1)
    return true
}
