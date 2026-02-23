import {
  HttpApiBuilder,
  HttpApiSwagger,
  HttpMiddleware,
  HttpServer,
} from "@effect/platform";
import { NodeHttpServer } from "@effect/platform-node";
import { Layer } from "effect";
import { createServer } from "http";

import { Api } from "@/api";
import HttpCustomerLive from "@/modules/customers/customers.http";
import HttpOrderLive from "@/modules/orders/orders.http";
import HttpProductLive from "@/modules/products/products.http";
import HttpUserLive from "@/modules/users/users.http";

const ApiLive = Layer.provide(HttpApiBuilder.api(Api), [
  HttpProductLive,
  HttpCustomerLive,
  HttpOrderLive,
  HttpUserLive,
]);

export const HttpLive = HttpApiBuilder.serve(HttpMiddleware.logger).pipe(
  Layer.provide(HttpApiSwagger.layer()),
  Layer.provide(HttpApiBuilder.middlewareCors()),
  Layer.provide(ApiLive),
  HttpServer.withLogAddress,
  Layer.provide(NodeHttpServer.layer(createServer, { port: 3000 })),
);
