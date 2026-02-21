export default function mapJobProperties(data = {}) {
    return {
        name: data.name || '',
        work_order: data.work_order || '',
        creation_date: data.creation_date || '',
        execution_date: data.execution_date || '',
        approved_by: data.approved_by || '',
        ambient_condition: data.ambient_condition || '',
        tested_by: data.tested_by || '',
        standard: data.standard || ''
    };
}