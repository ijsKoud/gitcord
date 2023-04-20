import { config } from "dotenv";
config();

import parse from "./lib/env.js";
parse();

import GitCordClient from "./discord/lib/GitCordClient.js";
const client = new GitCordClient();
client.start();
