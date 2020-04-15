import { createConnection, getConnectionOptions } from "typeorm";

export const testConn = async () => {
  const config = await getConnectionOptions("test");

  return createConnection({
    ...config,
    name: "default"
  });
};
