#!/usr/bin/env python3
"""SQLite SQL 查询执行工具"""

import argparse
import json
import sys
import os
import sqlite3
from datetime import datetime, date


class CustomJSONEncoder(json.JSONEncoder):
    """自定义 JSON 编码器"""
    def default(self, o):
        if isinstance(o, (datetime, date)):
            return o.isoformat()
        if isinstance(o, bytes):
            return o.decode('utf-8', errors='replace')
        return super().default(o)


def execute_query(database: str, query: str, readonly: bool = False) -> dict:
    """执行 SQL 查询"""
    try:
        if not os.path.exists(database):
            return {
                "success": False,
                "error": f"数据库文件不存在: {database}",
                "message": "SQL 执行失败"
            }
        
        db_path = os.path.abspath(database)
        if readonly:
            uri = f"file:{db_path}?mode=ro"
            connection = sqlite3.connect(uri, uri=True)
        else:
            connection = sqlite3.connect(db_path)
        
        # 设置行工厂以获取列名
        connection.row_factory = sqlite3.Row
        cursor = connection.cursor()
        
        # 判断是否为 SELECT 查询
        query_upper = query.strip().upper()
        is_select = (
            query_upper.startswith("SELECT") or 
            query_upper.startswith("PRAGMA") or
            query_upper.startswith("EXPLAIN")
        )
        
        cursor.execute(query)
        
        if is_select:
            rows_raw = cursor.fetchall()
            columns = [description[0] for description in cursor.description] if cursor.description else []
            rows = [dict(row) for row in rows_raw]
            result = {
                "success": True,
                "data": {
                    "rows": rows,
                    "row_count": len(rows),
                    "columns": columns
                },
                "message": f"查询成功，返回 {len(rows)} 行"
            }
        else:
            connection.commit()
            affected_rows = cursor.rowcount
            result = {
                "success": True,
                "data": {
                    "affected_rows": affected_rows
                },
                "message": f"执行成功，影响 {affected_rows} 行"
            }
        
        cursor.close()
        connection.close()
        
        return result
    except sqlite3.Error as e:
        return {
            "success": False,
            "error": str(e),
            "message": "SQL 执行失败"
        }


def main():
    # Force UTF-8 for stdout (useful for Windows)
    if sys.platform == "win32":
        sys.stdout.reconfigure(encoding='utf-8')

    parser = argparse.ArgumentParser(description="执行 SQLite SQL 查询")
    parser.add_argument("--database", required=True, help="数据库文件路径")
    parser.add_argument("--query", required=True, help="要执行的 SQL 语句")
    parser.add_argument("--readonly", action="store_true", help="只读模式打开")
    
    args = parser.parse_args()
    
    result = execute_query(
        database=args.database,
        query=args.query,
        readonly=args.readonly
    )
    
    print(json.dumps(result, ensure_ascii=False, indent=2, cls=CustomJSONEncoder))
    sys.exit(0 if result["success"] else 1)


if __name__ == "__main__":
    main()
