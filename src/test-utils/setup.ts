import { testConn } from "./testConn";

testConn().then(async conn => {
  await conn.synchronize(true);

  console.log("Test DB synchronized");
  process.exit(0);
});