#!/usr/bin/env python3
"""SQLite 数据库表结构查询工具"""

import argparse
import json
import sys
import os
import sqlite3


def get_table_schema(database: str, table: str, readonly: bool = False) -> dict:
    """获取指定表的结构信息"""
    try:
        if not os.path.exists(database):
            return {
                "success": False,
                "error": f"数据库文件不存在: {database}",
                "message": f"查询表 {table} 结构失败"
            }
        
        db_path = os.path.abspath(database)
        if readonly:
            uri = f"file:{db_path}?mode=ro"
            connection = sqlite3.connect(uri, uri=True)
        else:
            connection = sqlite3.connect(db_path)
        
        cursor = connection.cursor()
        
        # 检查表是否存在
        cursor.execute(
            "SELECT name FROM sqlite_master WHERE type IN ('table', 'view') AND name = ?",
            (table,)
        )
        if not cursor.fetchone():
            return {
                "success": False,
                "error": f"表 {table} 不存在",
                "message": f"查询表 {table} 结构失败"
            }
        
        # 获取表结构
        cursor.execute(f'PRAGMA table_info("{table}")')
        columns = []
        for row in cursor.fetchall():
            columns.append({
                "cid": row[0],
                "column_name": row[1],
                "data_type": row[2],
                "not_null": bool(row[3]),
                "default_value": row[4],
                "is_primary_key": bool(row[5])
            })
        
        # 获取索引信息
        cursor.execute(f'PRAGMA index_list("{table}")')
        indexes = []
        for idx_row in cursor.fetchall():
            idx_name = idx_row[1]
            is_unique = bool(idx_row[2])
            
            # 获取索引列
            cursor.execute(f'PRAGMA index_info("{idx_name}")')
            idx_columns = [col[2] for col in cursor.fetchall()]
            
            indexes.append({
                "name": idx_name,
                "unique": is_unique,
                "columns": idx_columns
            })
        
        # 获取外键信息
        cursor.execute(f'PRAGMA foreign_key_list("{table}")')
        foreign_keys = []
        for fk_row in cursor.fetchall():
            foreign_keys.append({
                "id": fk_row[0],
                "table": fk_row[2],
                "from_column": fk_row[3],
                "to_column": fk_row[4]
            })
        
        # 获取行数
        try:
            cursor.execute(f'SELECT COUNT(*) FROM "{table}"')
            row_count = cursor.fetchone()[0]
        except Exception:
            row_count = None
        
        cursor.close()
        connection.close()
        
        return {
            "success": True,
            "data": {
                "table": table,
                "columns": columns,
                "indexes": indexes,
                "foreign_keys": foreign_keys,
                "row_count": row_count
            },
            "message": f"表 {table} 结构查询成功"
        }
    except sqlite3.Error as e:
        return {
            "success": False,
            "error": str(e),
            "message": f"查询表 {table} 结构失败"
        }


def main():
    # Force UTF-8 for stdout (useful for Windows)
    if sys.platform == "win32":
        sys.stdout.reconfigure(encoding='utf-8')

    parser = argparse.ArgumentParser(description="查看 SQLite 表结构")
    parser.add_argument("--database", required=True, help="数据库文件路径")
    parser.add_argument("--table", required=True, help="表名")
    parser.add_argument("--readonly", action="store_true", help="只读模式打开")
    
    args = parser.parse_args()
    
    result = get_table_schema(
        database=args.database,
        table=args.table,
        readonly=args.readonly
    )
    
    print(json.dumps(result, ensure_ascii=False, indent=2))
    sys.exit(0 if result["success"] else 1)


if __name__ == "__main__":
    main()
