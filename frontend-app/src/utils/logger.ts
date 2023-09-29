import { Logger, ILogObj } from "tslog";

export const log: Logger<ILogObj> = new Logger({ type: "pretty" });
