import mysql from 'mysql2/promise';
declare const pool: mysql.Pool;
export declare function query<T>(sql: string, params?: unknown[]): Promise<T>;
export default pool;
//# sourceMappingURL=db.d.ts.map