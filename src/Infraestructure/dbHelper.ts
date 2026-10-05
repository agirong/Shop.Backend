import { DataSource } from 'typeorm';

export async function callProcedure<T = any>(
  dataSource: DataSource,
  procedureName: string,
  params: any[] = []
): Promise<T[]> {
  const placeholders = params.map(() => '?').join(',');
  const query = `CALL ${procedureName}(${placeholders})`;
  const result = await dataSource.query(query, params);
  return result[0] as T[];
}