import { NodeRuntime } from "@effect/platform-node";
import { config } from "dotenv";
import { Layer } from "effect";
import { HttpLive } from "./http.js";

config({ path: [".env.local", ".env"] });

HttpLive.pipe(Layer.launch, NodeRuntime.runMain);
