import * as NodeRuntime from "@effect/platform-node/NodeRuntime";
import { config } from "dotenv";
import * as Layer from "effect/Layer";
import { HttpLive } from "./http.js";

config({ path: [".env.local", ".env"] });

HttpLive.pipe(Layer.launch, NodeRuntime.runMain);
