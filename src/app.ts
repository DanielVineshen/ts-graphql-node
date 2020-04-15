import "reflect-metadata";
require("dotenv").config();
import express from "express";
import path from "path";
import { ApolloServer } from "apollo-server-express";
import rateLimit from "express-rate-limit";
import cors from "cors";
import session from "express-session";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import bodyParser from "body-parser";
import { separateOperations } from "graphql";
import {
  getComplexity,
  fieldExtensionsEstimator,
  simpleEstimator,
} from "graphql-query-complexity";
import { TypeormStore } from "typeorm-store";
import { getConnection } from "typeorm";

import createTypeormConnection from "./utils/createTypeormConnection";
import buildGraphqlSchema from "./utils/buildGraphqlSchema";
import { Session } from "./entity/Session";
import router from "./routes/router";
import { env, port, sessionSecret, serverURL } from "./config/config";

(async () => {
  try {
    const dbConnection = await createTypeormConnection();
    await dbConnection.runMigrations();

    const repository = getConnection().getRepository(Session) as any;

    const app = express();

    app.use(
      rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 1000, // limit each IP to 2000 requests per windowMs
      })
    );

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(helmet());
    app.use(cookieParser());

    let corsOrigin: any = {};
    if (env === "production") {
      corsOrigin = {
        whitelist: [""],
        default: "",
      };
    } else {
      corsOrigin = {
        whitelist: ["http://localhost:3000"],
        default: "http://localhost:3000",
      };
    }

    app.use((req, res, next) => {
      if (
        corsOrigin.whitelist.indexOf(req.headers.origin as any) !== -1 ||
        !req.headers.origin
      ) {
        res.header("Access-Control-Allow-Origin", req.headers.origin);
      }
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST");
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
      );
      next();
    });

    app.set("views", path.join(__dirname, "views"));
    app.set("view engine", "pug");

    app.enable("trust proxy");
    Object.defineProperty(app.request, "protocol", { value: "https" });

    app.use(
      session({
        name: "qid",
        secret: sessionSecret as string,
        store: new TypeormStore({ repository }),
        resave: false,
        saveUninitialized: false,
        cookie: {
          httpOnly: true,
          sameSite: "none",
          maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
          signed: true,
          // sameSite: "strict",
          secure: env === "production",
        },
      })
    );

    app.use(router);

    app.use(
      cors({
        credentials: true,
        origin: (origin: any, callback) => {
          if (corsOrigin.whitelist.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
          } else {
            callback(new Error("Not allowed by CORS"));
          }
        },
        preflightContinue: false,
      })
    );

    const schema = await buildGraphqlSchema();
    const server = new ApolloServer({
      // make sure to also add the 'client_max_body_size' field in the /etc/nginx/nginx.conf file
      // e.g. client_max_body_size 5M; - indicates 5 Megabytes
      uploads: {
        maxFieldSize: 5000000, // 5MB
        maxFileSize: 5000000, // 5MB
        maxFiles: 5,
      },
      schema,
      context: ({ req, res }: any) => ({ req, res }),
      tracing: false,
      formatError: (err) => {
        // Don't give the specific errors to the client.
        if (err.message.startsWith("Database Error: ")) {
          console.log(err.message);
          return new Error("Internal server error");
        }

        // Otherwise return the original error.  The error can also
        // be manipulated in other ways, so long as it's returned.
        return err;
      },
      // Create a plugin that will allow for query complexity calculation for every request
      plugins: [
        {
          requestDidStart: () => ({
            didResolveOperation({ request, document }) {
              /**
               * This provides GraphQL query analysis to be able to react on complex queries to your GraphQL server.
               * This can be used to protect your GraphQL servers against resource exhaustion and DoS attacks.
               * More documentation can be found at https://github.com/ivome/graphql-query-complexity.
               */
              const complexity = getComplexity({
                // Our built schema
                schema,
                // To calculate query complexity properly,
                // we have to check if the document contains multiple operations
                // and eventually extract it operation from the whole query document.
                query: request.operationName
                  ? separateOperations(document)[request.operationName]
                  : document,
                // The variables for our GraphQL query
                variables: request.variables,
                // Add any number of estimators. The estimators are invoked in order, the first
                // numeric value that is being returned by an estimator is used as the field complexity.
                // If no estimator returns a value, an exception is raised.
                estimators: [
                  // Using fieldConfigEstimator is mandatory to make it work with type-graphql.
                  fieldExtensionsEstimator(),
                  // Add more estimators here...
                  // This will assign each field a complexity of 1
                  // if no other estimator returned a value.
                  simpleEstimator({ defaultComplexity: 1 }),
                ],
              });
              // Here we can react to the calculated complexity,
              // like compare it with max and throw error when the threshold is reached.
              if (complexity > 100) {
                throw new Error(
                  `Sorry, too complicated query! ${complexity} is over 100 that is the max allowed complexity.`
                );
              }
              // And here we can e.g. subtract the complexity point from hourly API calls limit.
              env === "development" &&
                console.log("Used query complexity points:", complexity);
            },
          }),
        },
      ],
    });

    server.applyMiddleware({
      app,
      cors: false,
    });

    app.listen(port || 3000, () => {
      console.log(`Server is running at ${serverURL}${server.graphqlPath}`);
    });
  } catch (error) {
    console.error(error);
  }
})();
