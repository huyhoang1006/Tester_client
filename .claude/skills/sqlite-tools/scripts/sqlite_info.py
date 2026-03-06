#!/usr/bin/env python3
"""SQLite 数据库信息查询工具"""

import argparse
import json
import sys
import os
import sqlite3


def get_database_info(database: str, readonly: bool = False) -> dict:
    """获取数据库详细信息"""
    try:
        if not os.path.exists(database):
            return {
                "success": False,
                "error": f"数据库文件不存在: {database}",
                "message": "数据库信息查询失败"
            }
        
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
        
        # 获取页面大小和数量
        cursor.execute("PRAGMA page_size")
        page_size = cursor.fetchone()[0]
        
        cursor.execute("PRAGMA page_count")
        page_count = cursor.fetchone()[0]
        
        # 获取编码
        cursor.execute("PRAGMA encoding")
        encoding = cursor.fetchone()[0]
        
        # 获取表数量
        cursor.execute("SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
        table_count = cursor.fetchone()[0]
        
        # 获取视图数量
        cursor.execute("SELECT COUNT(*) FROM sqlite_master WHERE type='view'")
        view_count = cursor.fetchone()[0]
        
        # 获取索引数量
        cursor.execute("SELECT COUNT(*) FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_%'")
        index_count = cursor.fetchone()[0]
        
        # 获取触发器数量
        cursor.execute("SELECT COUNT(*) FROM sqlite_master WHERE type='trigger'")
        trigger_count = cursor.fetchone()[0]
        
        # 获取自动真空模式
        cursor.execute("PRAGMA auto_vacuum")
        auto_vacuum = cursor.fetchone()[0]
        auto_vacuum_mode = {0: "NONE", 1: "FULL", 2: "INCREMENTAL"}.get(auto_vacuum, "UNKNOWN")
        
        # 获取日志模式
        cursor.execute("PRAGMA journal_mode")
        journal_mode = cursor.fetchone()[0]
        
        cursor.close()
        connection.close()
        
        return {
            "success": True,
            "data": {
                "file": {
                    "path": db_path,
                    "size_bytes": file_size,
                    "size_mb": file_size_mb,
                    "extension": os.path.splitext(db_path)[1]
                },
                "database": {
                    "sqlite_version": sqlite_version,
                    "encoding": encoding,
                    "page_size": page_size,
                    "page_count": page_count,
                    "journal_mode": journal_mode,
                    "auto_vacuum": auto_vacuum_mode
                },
                "objects": {
                    "table_count": table_count,
                    "view_count": view_count,
                    "index_count": index_count,
                    "trigger_count": trigger_count
                }
            },
            "message": "数据库信息查询成功"
        }
    except sqlite3.Error as e:
        return {
            "success": False,
            "error": str(e),
            "message": "数据库信息查询失败"
        }


def main():
    # Force UTF-8 for stdout (useful for Windows)
    if sys.platform == "win32":
        sys.stdout.reconfigure(encoding='utf-8')

    parser = argparse.ArgumentParser(description="查看 SQLite 数据库信息")
    parser.add_argument("--database", required=True, help="数据库文件路径")
    parser.add_argument("--readonly", action="store_true", help="只读模式打开")
    
    args = parser.parse_args()
    
    result = get_database_info(
        database=args.database,
        readonly=args.readonly
    )
    
    print(json.dumps(result, ensure_ascii=False, indent=2))
    sys.exit(0 if result["success"] else 1)


if __name__ == "__main__":
    main()
