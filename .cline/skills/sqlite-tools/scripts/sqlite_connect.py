#!/usr/bin/env python3
"""SQLite 数据库连接测试工具"""

import argparse
import json
import sys
import os
import sqlite3


def test_connection(database: str, readonly: bool = False) -> dict:
    """测试 SQLite 数据库连接"""
    try:
        # 检查文件是否存在
        if not os.path.exists(database):
            return {
                "success": False,
                "error": f"数据库文件不存在: {database}",
                "message": "数据库连接失败"
            }
        
        # 构建连接 URI
        db_path = os.path.abspath(database)
        if readonly:
            uri = f"file:{db_path}?mode=ro"
            connection = sqlite3.connect(uri, uri=True)
        else:
            connection = sqlite3.connect(db_path)
        
        cursor = connection.cursor()
        
        # 获取 SQLite 版本
        cursor.execute("SELECT sqlite_version()")
        sqlite_version = cursor.fetchone()[0]
        
        # 获取文件大小
        file_size = os.path.getsize(db_path)
        file_size_mb = round(file_size / (1024 * 1024), 2)
        
        # 获取表数量
        cursor.execute("SELECT COUNT(*) FROM sqlite_master WHERE type='table'")
        table_count = cursor.fetchone()[0]
        
        cursor.close()
        connection.close()
        
        return {
            "success": True,
            "data": {
                "sqlite_version": sqlite_version,
                "database_path": db_path,
                "file_size_bytes": file_size,
                "file_size_mb": file_size_mb,
                "table_count": table_count,
                "readonly": readonly
            },
            "message": "数据库连接成功"
        }
    except sqlite3.Error as e:
        return {
            "success": False,
            "error": str(e),
            "message": "数据库连接失败"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "message": "数据库连接失败"
        }


def main():
    # Force UTF-8 for stdout (useful for Windows)
    if sys.platform == "win32":
        sys.stdout.reconfigure(encoding='utf-8')

    parser = argparse.ArgumentParser(description="测试 SQLite 数据库连接")
    parser.add_argument("--database", required=True, help="数据库文件路径")
    parser.add_argument("--readonly", action="store_true", help="只读模式打开")
    
    args = parser.parse_args()
    
    result = test_connection(
        database=args.database,
        readonly=args.readonly
    )
    
    print(json.dumps(result, ensure_ascii=False, indent=2))
    sys.exit(0 if result["success"] else 1)


if __name__ == "__main__":
    main()
