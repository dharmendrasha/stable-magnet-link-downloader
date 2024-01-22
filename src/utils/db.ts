import { ObjectLiteral, EntityTarget } from "typeorm";
import appDatasource from "../typeorm.config.js";

export const getDataSource = () => {
  if (!appDatasource.isInitialized) {
    throw new Error(`appDatasource is not initialized`);
  }
  return appDatasource;
};

export const getRepository = <Entity extends ObjectLiteral>(
  entity: EntityTarget<Entity>,
) => {
  const dbSrc = getDataSource();
  const repo = dbSrc.getRepository(entity);
  return repo;
};
