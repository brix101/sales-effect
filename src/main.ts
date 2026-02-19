import { program } from "@/program";
import { config } from "dotenv";
import * as Effect from "effect/Effect";

config({ path: [".env.local", ".env"] });

Effect.runPromise(program);
