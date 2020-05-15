module.exports = [
  {
    name: "development",
    type: "mysql",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_DEVELOPMENT_NAME,
    synchronize: false,
    logging: false,
    dropSchema: false,
    entities:
      process.env.DB_NODE_ENV === "live_development"
        ? [__dirname + "/dist/entity/**/*.js"]
        : [__dirname + "/src/entity/**/*.ts"],
    migrations:
      process.env.DB_NODE_ENV === "live_development"
        ? [__dirname + "/dist/migration/**/*.js"]
        : [__dirname + "/src/migration/**/*.ts"],
    subscribers:
      process.env.DB_NODE_ENV === "live_development"
        ? [__dirname + "/dist/subscriber/**/*.js"]
        : [__dirname + "/src/subscriber/**/*.ts"],
    cli: {
      entitiesDir:
        process.env.DB_NODE_ENV === "live_development"
          ? "/dist/entity"
          : "/src/entity",
      migrationsDir:
        process.env.DB_NODE_ENV === "live_development"
          ? "/dist/migration"
          : "/src/migration",
      subscribersDir:
        process.env.DB_NODE_ENV === "live_development"
          ? "/dist/subscriber"
          : "/src/subscriber",
    },
  },
  {
    name: "production",
    type: "mysql",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    synchronize: false,
    logging: false,
    dropSchema: false,
    entities: [__dirname + "/dist/entity/**/*.js"],
    migrations: [__dirname + "/dist/migration/**/*.js"],
    subscribers: [__dirname + "/dist/subscriber/**/*.js"],
    cli: {
      entitiesDir: "/dist/entity",
      migrationsDir: "/dist/migration",
      subscribersDir: "/dist/subscriber",
    },
  },
  {
    name: "test",
    type: "mysql",
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_TEST_NAME,
    logging: false,
    synchronize: false,
    entities: ["src/entity/**/*.ts"],
    migrations: ["src/migration/**/*.ts"],
    subscribers: ["src/subscriber/**/*.ts"],
    cli: {
      entitiesDir: "src/entity",
      migrationsDir: "src/migration",
      subscribersDir: "src/subscriber",
    },
  },
];
