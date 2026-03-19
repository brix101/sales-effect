import { paginationMeta } from "@/modules/common/domain";
import { Customer } from "@/modules/customers/customers.domain";
import { Product } from "@/modules/products/products.domain";
import * as Schema from "effect/Schema";

export const OrderId = Schema.UUID.pipe(Schema.brand("OrderId"));
export type OrderId = typeof OrderId.Type;

export const OrderItemId = Schema.UUID.pipe(Schema.brand("OrderItemId"));
export type OrderItemId = typeof OrderItemId.Type;

export class OrderItem extends Schema.Class<OrderItem>("OrderItem")({
  id: OrderItemId,
  orderId: OrderId,
  quantity: Schema.Number,
  price: Schema.Number,
  product: Product,
}) { }

export class Order extends Schema.Class<Order>("Order")({
  id: OrderId,
  createdAt: Schema.DateTimeUtc,
  updatedAt: Schema.DateTimeUtc,
  customer: Customer,
  items: Schema.Array(OrderItem),
}) { }

export class OrdersWithPagination extends Schema.Class<OrdersWithPagination>(
  "OrdersWithPagination",
)({
  meta: paginationMeta,
  items: Schema.Array(Order),
}) { }
