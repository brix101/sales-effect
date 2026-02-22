import { Api } from "@/api";
import HttpCustomerLive from "@/modules/customers/customers.http";
import HttpOrderLive from "@/modules/orders/orders.http";
import HttpProductLive from "@/modules/products/products.http";
import {
  HttpApiBuilder,
  HttpApiSwagger,
  HttpMiddleware,
  HttpServer,
} from "@effect/platform";
import { NodeHttpServer } from "@effect/platform-node";
import { Effect, Layer } from "effect";
import { createServer } from "http";

const GreetingsLive = HttpApiBuilder.group(Api, "Greetings", (handlers) =>
  handlers.handle("hello-world", () => Effect.succeed("Hello, World!")),
);

const ApiLive = Layer.provide(HttpApiBuilder.api(Api), [
  GreetingsLive,
  HttpProductLive,
  HttpCustomerLive,
  HttpOrderLive,
]);

export const HttpLive = HttpApiBuilder.serve(HttpMiddleware.logger).pipe(
  Layer.provide(HttpApiSwagger.layer()),
  Layer.provide(HttpApiBuilder.middlewareCors()),
  Layer.provide(ApiLive),
  HttpServer.withLogAddress,
  Layer.provide(NodeHttpServer.layer(createServer, { port: 3000 })),
);
