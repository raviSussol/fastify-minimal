import { Pool } from "pg";

export const getPool = () => {
    const conn = new Pool({ connectionString: 'postgres://postgres:postgres@localhost/test' });
    return conn;
};
