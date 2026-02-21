import {
  HttpApi,
  HttpApiBuilder,
  HttpApiEndpoint,
  HttpApiGroup,
  HttpApiSwagger,
  HttpMiddleware,
  HttpServer,
} from "@effect/platform";
import { NodeHttpServer } from "@effect/platform-node";
import { Effect, Layer, Schema } from "effect";
import { createServer } from "http";

const Api = HttpApi.make("api").add(
  HttpApiGroup.make("Greetings").add(
    HttpApiEndpoint.get("hello-world")`/`.addSuccess(Schema.String),
  ),
);

const GreetingsLive = HttpApiBuilder.group(Api, "Greetings", (handlers) =>
  handlers.handle("hello-world", () => Effect.succeed("Hello, World!")),
);

const ApiLive = HttpApiBuilder.api(Api).pipe(Layer.provide(GreetingsLive));

export const HttpLive = HttpApiBuilder.serve(HttpMiddleware.logger).pipe(
  Layer.provide(HttpApiSwagger.layer()),
  Layer.provide(HttpApiBuilder.middlewareCors()),
  Layer.provide(ApiLive),
  HttpServer.withLogAddress,
  Layer.provide(NodeHttpServer.layer(createServer, { port: 3000 })),
);
