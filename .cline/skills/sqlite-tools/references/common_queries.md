# SQLite 常用查询参考

## 表操作

### 查看所有表
```sql
SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;
```

### 查看表结构
```sql
PRAGMA table_info(table_name);
```

### 获取表的 CREATE 语句
```sql
SELECT sql FROM sqlite_master WHERE type='table' AND name='table_name';
```

## 数据查询

### 分页查询
```sql
SELECT * FROM table_name LIMIT 10 OFFSET 20;
```

### 计数
```sql
SELECT COUNT(*) FROM table_name;
```

### 模糊查询
```sql
SELECT * FROM table_name WHERE column LIKE '%keyword%';
```

## 索引

### 查看表的索引
```sql
PRAGMA index_list(table_name);
```

### 查看索引详情
```sql
PRAGMA index_info(index_name);
```

## 数据库信息

### SQLite 版本
```sql
SELECT sqlite_version();
```

### 数据库编码
```sql
PRAGMA encoding;
```

### 页面大小
```sql
PRAGMA page_size;
```

### 日志模式
```sql
PRAGMA journal_mode;
```

## 常用 VS Code 数据库查询

### state.vscdb 常见表
```sql
-- 查看所有键值对
SELECT * FROM ItemTable;

-- 查找特定键
SELECT * FROM ItemTable WHERE key LIKE '%account%';

-- 查看键的数量
SELECT COUNT(*) FROM ItemTable;
```
