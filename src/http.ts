import * as HttpApiBuilder from "@effect/platform/HttpApiBuilder";
import * as HttpApiSwagger from "@effect/platform/HttpApiSwagger";
import * as HttpMiddleware from "@effect/platform/HttpMiddleware";
import * as HttpServer from "@effect/platform/HttpServer";
import * as NodeHttpServer from "@effect/platform-node/NodeHttpServer";
import * as Layer from "effect/Layer";
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
