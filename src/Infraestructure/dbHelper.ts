import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';

const logger = new Logger('DbHelper');

export async function callProcedure<T = any>(
  dataSource: DataSource,
  procedureName: string,
  params: any[] = []
): Promise<T[]> {
  const placeholders = params.map(() => '?').join(',');
  const query = `CALL ${procedureName}(${placeholders})`;

  logger.debug(`Ejecutando SP : ${query} | Params: ${JSON.stringify(params)}`);

  try {
    const result = await dataSource.query(query, params);
    logger.debug(`Resultados para ${procedureName}: obtenidos de la db`);
    return result[0] as T[];
  } catch (error: unknown) {
    const err = error as { message?: string; code?: string; sqlMessage?: string; stack?: string };

    logger.error(
      `Error llamando procedure "${procedureName}" | ` +
      `Code: ${err.code ?? 'N/A'} | ` +
      `Message: ${err.sqlMessage ?? err.message ?? 'Unknown error'}`,
      err.stack
    );

    throw error;
  }
}