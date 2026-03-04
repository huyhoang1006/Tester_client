#!/usr/bin/env python3
"""SQLite 数据库表列表查询工具"""

import argparse
import json
import sys
import os
import sqlite3


def list_tables(database: str, readonly: bool = False) -> dict:
    """列出数据库中的所有表"""
    try:
        if not os.path.exists(database):
            return {
                "success": False,
                "error": f"数据库文件不存在: {database}",
                "message": "查询表列表失败"
            }
        
        db_path = os.path.abspath(database)
        if readonly:
            uri = f"file:{db_path}?mode=ro"
            connection = sqlite3.connect(uri, uri=True)
        else:
            connection = sqlite3.connect(db_path)
        
        cursor = connection.cursor()
        
        # 查询所有表和视图
        cursor.execute("""
            SELECT 
                name,
                type,
                (SELECT COUNT(*) FROM pragma_table_info(m.name)) as column_count
            FROM sqlite_master m
            WHERE type IN ('table', 'view') AND name NOT LIKE 'sqlite_%'
            ORDER BY type, name
        """)
        
        tables = []
        for row in cursor.fetchall():
            table_name = row[0]
            table_type = row[1].upper()
            column_count = row[2]
            
            # 获取行数（仅对表，视图可能较慢）
            row_count = None
            if table_type == 'TABLE':
                try:
                    cursor.execute(f'SELECT COUNT(*) FROM "{table_name}"')
                    row_count = cursor.fetchone()[0]
                except Exception:
                    row_count = None
            
            tables.append({
                "table_name": table_name,
                "table_type": table_type,
                "column_count": column_count,
                "row_count": row_count
            })
        
        cursor.close()
        connection.close()
        
        return {
            "success": True,
            "data": {
                "database": db_path,
                "table_count": len(tables),
                "tables": tables
            },
            "message": f"找到 {len(tables)} 个表"
        }
    except sqlite3.Error as e:
        return {
            "success": False,
            "error": str(e),
            "message": "查询表列表失败"
        }


def main():
    # Force UTF-8 for stdout (useful for Windows)
    if sys.platform == "win32":
        sys.stdout.reconfigure(encoding='utf-8')

    parser = argparse.ArgumentParser(description="列出 SQLite 数据库中的所有表")
    parser.add_argument("--database", required=True, help="数据库文件路径")
    parser.add_argument("--readonly", action="store_true", help="只读模式打开")
    
    args = parser.parse_args()
    
    result = list_tables(
        database=args.database,
        readonly=args.readonly
    )
    
    print(json.dumps(result, ensure_ascii=False, indent=2))
    sys.exit(0 if result["success"] else 1)


if __name__ == "__main__":
    main()
