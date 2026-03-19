import * as HttpApi from "@effect/platform/HttpApi";

import { CustomerApi } from "@/modules/customers/customers.api";
import { OrderApi } from "@/modules/orders/orders.api";
import { ProductApi } from "@/modules/products/products.api";
import { UserApi } from "@/modules/users/users.api";

export class Api extends HttpApi.make("api")
  .prefix("/api")
  .add(ProductApi)
  .add(CustomerApi)
  .add(OrderApi)
  .add(UserApi) { }

//test
