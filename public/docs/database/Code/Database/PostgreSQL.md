## 基础概念对比

### 1. 术语差异

| MySQL           | PostgreSQL         | 说明                      |
| --------------- | ------------------ | ----------------------- |
| 数据库             | 数据库                | 概念相同                    |
| 表               | 表                  | 概念相同                    |
| 索引              | 索引                 | 概念相同，但实现不同              |
| AUTO_INCREMENT  | SERIAL 或 IDENTITY  | 自增列的实现方式不同              |
| 存储引擎            | 无                  | PostgreSQL没有多存储引擎概念     |
| 用户和权限           | 角色系统               | PostgreSQL使用角色(role)系统  |
| Database Server | Database Cluster   | PostgreSQL服务器实例称为集群     |
### 3. 常用命令对比
| MySQL                      | PostgreSQL                               | 作用      |
| -------------------------- | ---------------------------------------- | ------- |
|  SHOW DATABASES;           |  \l 或 SELECT datname FROM pg_database;   | 列出所有数据库 |
|  USE database;             |  \c database                             | 切换数据库   |
|  SHOW TABLES;              |  \dt 或 SELECT tablename FROM pg_tables;  | 列出所有表   |
|  DESCRIBE table;           |  \d table                                |  显示表结构  |
|  SHOW CREATE TABLE table;  |  \d+ table                               | 显示详细表定义 |
|  exit 或 quit               |  \q                                      | 退出      |
