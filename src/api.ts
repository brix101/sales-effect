import { ProductApi } from "@/modules/products/products.api";
import { HttpApi, HttpApiEndpoint, HttpApiGroup } from "@effect/platform";
import { Schema } from "effect";
import { CustomerApi } from "./modules/customers/customers.api.js";
import { OrderApi } from "./modules/orders/orders.api.js";

export class Api extends HttpApi.make("api")
  .prefix("/api")
  .add(
    HttpApiGroup.make("Greetings").add(
      HttpApiEndpoint.get("hello-world", "/").addSuccess(Schema.String),
    ),
  )
  .add(ProductApi)
  .add(CustomerApi)
  .add(OrderApi) {}
