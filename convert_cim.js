const fs = require('fs');
const path = require('path');

// ==========================================
// CẤU HÌNH ĐƯỜNG DẪN
// ==========================================
const SOURCE_DIR = path.join(__dirname, 'src', 'views', 'Cim');
const DEST_DIR = path.join(__dirname, 'src', 'views', 'CimEntity');

// ==========================================
// 1. TỪ ĐIỂN MAPPING (DỰA TRÊN DB SCHEMA)
// ==========================================
// Định nghĩa các quy tắc ánh xạ từ tên biến (hoặc một phần tên) sang Class
const TYPE_MAPPING = {
    // --- Điện áp (Voltage) ---
    'voltage': 'Voltage',
    'rated_u': 'Voltage',
    'rated_ln': 'Voltage',
    'insulation_u': 'Voltage',
    'neutral_step': 'Voltage',
    'bil': 'Voltage',
    'dielectric_strength': 'Voltage',
    
    // --- Dòng điện (CurrentFlow) ---
    'current': 'CurrentFlow',
    'amps': 'CurrentFlow',
    'breaking_capacity': 'CurrentFlow',
    'ct_rating': 'CurrentFlow',
    
    // --- Công suất (Power) ---
    'apparent_power': 'ApparentPower',
    'rated_s': 'ApparentPower',
    'emergency_s': 'ApparentPower',
    'short_term_s': 'ApparentPower',
    'active_power': 'ActivePower',
    'reactive_power': 'ReactivePower',
    'rated_power': 'ApparentPower', // Default mapping, có thể là Active/Reactive tùy ngữ cảnh
    
    // --- Vật lý & Đo lường ---
    'frequency': 'Frequency',
    'resistance': 'Resistance',
    'impedance': 'Impedance',
    'temperature': 'Temperature',
    'temp': 'Temperature',
    'pressure': 'Pressure',
    'mass': 'Mass',
    'weight': 'Mass',
    'length': 'Length',
    'radius': 'Length',
    'diameter': 'Length',
    'gmr': 'Length',
    'width': 'Length',
    'height': 'Length',
    'depth': 'Length',
    'thickness': 'Length',
    'distance': 'Length',
    'volume': 'Volume',
    'angle': 'AngleDegrees',
    'speed': 'RotationSpeed', // Nếu có class này
    
    // --- Thời gian (Seconds) ---
    'seconds': 'Seconds',
    'duration': 'Seconds',
    'time_delay': 'Seconds',
    'damping_time': 'Seconds',
    'interrupting_time': 'Seconds',
    
    // --- Khác ---
    'percent': 'Percent',
    'ratio': 'Ratio', // Hoặc Float
    'factor': 'Percent' // Thường là hệ số %
};

// ==========================================
// 2. CÁC HÀM TIỆN ÍCH (HELPER FUNCTIONS)
// ==========================================

function toCamelCase(str) {
    return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
}

function toPascalCase(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Hàm đoán Class dựa trên tên thuộc tính snake_case
function guessClassFromProperty(propName, classMap) {
    // 1. Kiểm tra mapping chính xác hoặc chứa từ khóa
    for (const [key, className] of Object.entries(TYPE_MAPPING)) {
        if (propName === key || propName.endsWith('_' + key) || propName.includes(key + '_')) {
            // Kiểm tra xem Class này có tồn tại trong project không
            if (classMap[className]) return className;
        }
    }

    // 2. Kiểm tra tên biến có trùng với tên Class không (ví dụ: asset_info -> AssetInfo)
    const pascalName = toPascalCase(toCamelCase(propName));
    if (classMap[pascalName]) {
        return pascalName;
    }

    return null;
}

// Hàm đệ quy duyệt thư mục
function walk(dir) {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.js')) {
                results.push(file);
            }
        }
    });
    return results;
}

// ==========================================
// 3. BƯỚC 1: INDEXING (TẠO DANH SÁCH CLASS)
// ==========================================
const classMap = {}; // { 'AssetInfo': 'rel/path/to/index.js' }

console.log('--- Bắt đầu Indexing các Class ---');
const allFiles = walk(SOURCE_DIR);

allFiles.forEach(filePath => {
    const parentDir = path.dirname(filePath);
    const className = path.basename(parentDir); 
    const relativePath = path.relative(SOURCE_DIR, filePath);
    classMap[className] = relativePath;
});
console.log(`Đã lập chỉ mục ${Object.keys(classMap).length} classes.`);

// ==========================================
// 4. BƯỚC 2: XỬ LÝ VÀ CHUYỂN ĐỔI
// ==========================================

function processFile(filePath) {
    const originalContent = fs.readFileSync(filePath, 'utf8');
    const lines = originalContent.split('\n');
    
    // Tên class hiện tại (để tránh tự import chính mình hoặc đệ quy vô hạn)
    const currentClassName = path.basename(path.dirname(filePath));

    let newLines = [];
    let neededImports = new Set();
    let existingImports = new Set();

    lines.forEach(line => {
        const trimmedLine = line.trim();

        // Giữ import cũ
        if (trimmedLine.startsWith('import')) {
            existingImports.add(line);
            newLines.push(line);
            return;
        }

        // Bỏ dòng trống/comment đầu
        if (trimmedLine === '' || trimmedLine.startsWith('//') || trimmedLine.startsWith('/*') || trimmedLine.startsWith('*')) {
            newLines.push(line);
            return;
        }

        // Xử lý logic constructor
        if (line.includes('this.')) {
            // 1. mRID
            let processedLine = line.replace(/this\.mrid/g, 'this.mRID');

            // 2. Các biến khác
            processedLine = processedLine.replace(/this\.([a-z0-9_]+)\s*=\s*(.*)/, (match, propName, valuePart) => {
                if (propName === 'mRID') return match;

                const camelProp = toCamelCase(propName);
                let newValue = 'null';
                let comment = '';

                // Tách comment cũ nếu có
                const commentIndex = valuePart.indexOf('//');
                if (commentIndex !== -1) {
                    comment = ' ' + valuePart.substring(commentIndex);
                    valuePart = valuePart.substring(0, commentIndex).trim();
                }

                // --- LOGIC SUY LUẬN KIỂU DỮ LIỆU ---

                // A. Nếu là khóa ngoại (ID) -> Giữ null hoặc String
                if (propName.endsWith('_id') || propName === 'id') {
                    newValue = 'null'; 
                }
                // B. Kiểm tra Mapping DB & Class Name
                else {
                    const guessedClass = guessClassFromProperty(propName, classMap);
                    
                    if (guessedClass && guessedClass !== currentClassName) {
                        newValue = `new ${guessedClass}()`;
                        neededImports.add(guessedClass);
                    } 
                    // C. Date/Time
                    else if (propName.includes('date') || propName.includes('time')) {
                        newValue = 'new Date()';
                    }
                    // D. Boolean (is_..., has_...)
                    else if (propName.startsWith('is_') || propName.startsWith('has_') || propName.startsWith('in_use')) {
                        newValue = 'new Boolean()';
                    }
                    // E. Giữ giá trị cũ nếu không phải null
                    else if (!valuePart.includes('null')) {
                        newValue = valuePart;
                    }
                }

                return `        this.${camelProp} = ${newValue};${comment}`;
            });

            newLines.push(processedLine);
        } else {
            newLines.push(line);
        }
    });

    // Tạo Header Import
    let importHeader = [];
    neededImports.forEach(cls => {
        // Kiểm tra xem đã import chưa
        let alreadyImported = false;
        existingImports.forEach(imp => {
            if (imp.includes(cls)) alreadyImported = true;
        });

        if (!alreadyImported) {
            // Tính đường dẫn tương đối
            const currentDirInDest = path.join(DEST_DIR, path.relative(SOURCE_DIR, path.dirname(filePath)));
            const targetFileInDest = path.join(DEST_DIR, path.dirname(classMap[cls]));

            let relativeImport = path.relative(currentDirInDest, targetFileInDest);
            relativeImport = relativeImport.split(path.sep).join('/'); // Fix window path
            
            if (!relativeImport.startsWith('.')) {
                relativeImport = './' + relativeImport;
            }

            importHeader.push(`import ${cls} from "${relativeImport}";`);
        }
    });

    // Chèn import vào đúng vị trí
    let lastImportIdx = -1;
    for (let i = 0; i < newLines.length; i++) {
        if (newLines[i].trim().startsWith('import')) lastImportIdx = i;
        else if (newLines[i].trim().startsWith('class')) break;
    }

    if (importHeader.length > 0) {
        if (lastImportIdx !== -1) {
            newLines.splice(lastImportIdx + 1, 0, ...importHeader);
        } else {
            newLines.unshift(...importHeader);
        }
    }

    return newLines.join('\n');
}

// ==========================================
// 5. MAIN RUN
// ==========================================
function run() {
    if (!fs.existsSync(SOURCE_DIR)) {
        console.error(`Không tìm thấy thư mục nguồn: ${SOURCE_DIR}`);
        return;
    }

    const files = allFiles;

    files.forEach(filePath => {
        const relativePath = path.relative(SOURCE_DIR, filePath);
        const destPath = path.join(DEST_DIR, relativePath);
        const destDir = path.dirname(destPath);

        if (!fs.existsSync(destDir)){
            fs.mkdirSync(destDir, { recursive: true });
        }

        console.log(`Converting: ${relativePath}`);
        const newContent = processFile(filePath);
        fs.writeFileSync(destPath, newContent, 'utf8');
    });

    console.log('==================================================');
    console.log('HOÀN TẤT CHUYỂN ĐỔI - ĐỒNG BỘ VỚI DB SCHEMA!');
    console.log('==================================================');
}

run();