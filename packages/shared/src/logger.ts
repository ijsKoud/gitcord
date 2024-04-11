import "reflect-metadata";

import { Logger as IcicleLogger } from "@snowcrystals/icicle";
import { container, singleton } from "tsyringe";

@singleton()
export class Logger extends IcicleLogger {}

export const logger = container.resolve(Logger);
