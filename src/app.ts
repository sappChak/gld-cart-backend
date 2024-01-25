import "reflect-metadata";
import {InversifyExpressServer} from "inversify-express-utils";
import {Logger} from "./utils/logger";
import mongoose from "mongoose";
import {serverConfig} from "./config/server.config";
import {mongooseOptions} from "./config/mongo.config";

export class App {
    private readonly port: string | number;
    private readonly logger: Logger;
    private readonly server: InversifyExpressServer;

    constructor(
        port: string | number,
        server: InversifyExpressServer,
        logger: Logger,
    ) {
        if (!process.env.PORT || !process.env.DB_URL) {
            throw new Error("Environment variable PORT or DB_URL is not set");
        }
        this.port = process.env.PORT || port;
        this.server = server;
        this.logger = logger;
    }

    public async start() {
        const dbConnected = await this.connectToDatabase();
        if (dbConnected) {
            this.setupServer();
        }
    }

    private async connectToDatabase(): Promise<boolean> {
        try {
            await mongoose.connect(process.env.DB_URL, mongooseOptions);
            await this.logger.logInfo("⚡️[database]: MongoDB is running");
            return true;
        } catch (error) {
            await this.logger.logError(
                `Error fuck you connecting to the database: ${error.message}`,
                error,
            );
            return false;
        }
    }

    private setupServer() {
        this.server.setConfig(serverConfig);
        const app = this.server.build();
        app.listen(this.port, () =>
            this.logger.logInfo(
                `⚡️[server]: Server is running at http://localhost:${this.port}`,
            ),
        );
    }
}