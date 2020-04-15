import { createConnection, getConnectionOptions } from "typeorm";
import { env } from "../config/config";

export default async () => {
  const config = await getConnectionOptions(env);

  return createConnection({
    ...config,
    name: "default"
  });
};
