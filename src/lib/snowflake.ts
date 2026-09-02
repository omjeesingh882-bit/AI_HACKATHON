import snowflake, { Connection, SnowflakeError } from 'snowflake-sdk';

let cachedConnection: Connection | null = null;
let isConnecting = false;
let connectionPromise: Promise<Connection> | null = null;

export async function getConnection(): Promise<Connection> {
  if (cachedConnection && cachedConnection.isUp()) {
    return cachedConnection;
  }

  // If no Snowflake credentials configured at all, return demo mock connection
  if (!process.env.SNOWFLAKE_ACCOUNT) {
    cachedConnection = {
      isUp: () => true,
      execute: (options: any) => {
        if (options.complete) options.complete(undefined, {} as any, []);
        return {} as any;
      }
    } as unknown as Connection;
    return cachedConnection;
  }

  if (isConnecting && connectionPromise) {
    return connectionPromise;
  }

  isConnecting = true;
  
  connectionPromise = new Promise<Connection>((resolve, reject) => {
    const connection = snowflake.createConnection({
      account: process.env.SNOWFLAKE_ACCOUNT || '',
      username: process.env.SNOWFLAKE_USER || '',
      password: process.env.SNOWFLAKE_PASSWORD || '',
      database: process.env.SNOWFLAKE_DATABASE || 'TMSL_AI',
      schema: process.env.SNOWFLAKE_SCHEMA || 'PUBLIC',
      warehouse: process.env.SNOWFLAKE_WAREHOUSE || 'COMPUTE_WH',
      role: process.env.SNOWFLAKE_ROLE || 'ACCOUNTADMIN',
      application: 'TMSL_AI_APP'
    });

    connection.connect((err: SnowflakeError | undefined, conn: Connection) => {
      isConnecting = false;
      if (err) {
        console.error('Snowflake connection error:', err.message);
        if (process.env.DEMO_MODE === 'true') {
          console.warn('Returning mock connection due to connection error.');
          cachedConnection = {
            isUp: () => true,
            execute: (options: any) => {
              if (options.complete) options.complete(undefined, {} as any, []);
              return {} as any;
            }
          } as unknown as Connection;
          resolve(cachedConnection);
        } else {
          reject(new Error(`Snowflake connection failed: ${err.message}`));
        }
      } else {
        cachedConnection = conn;
        resolve(conn);
      }
    });
  });

  return connectionPromise;
}

export async function executeQuery<T>(sql: string, binds: any[] = []): Promise<T[]> {
  try {
    const conn = await getConnection();
    
    return new Promise<T[]>((resolve, reject) => {
      conn.execute({
        sqlText: sql,
        binds,
        complete: (err: SnowflakeError | undefined, stmt: any, rows: any[] | undefined) => {
          if (err) {
            console.error(`Query Execution Error: ${err.message}\nSQL: ${sql}`);
            reject(new Error(`Failed to execute query: ${err.message}`));
          } else {
            resolve((rows || []) as T[]);
          }
        }
      });
    });
  } catch (error) {
    console.error('Execute query failed:', error);
    throw error;
  }
}

export function isConnected(): boolean {
  return cachedConnection !== null && cachedConnection.isUp();
}
