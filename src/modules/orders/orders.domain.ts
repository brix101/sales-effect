import { paginationMeta } from "@/modules/common/domain";
import { Schema } from "effect";
import { CustomerId } from "../customers/customers.domain.js";

export const OrderId = Schema.UUID.pipe(Schema.brand("OrderId"));
export type OrderId = typeof OrderId.Type;

export class Order extends Schema.Class<Order>("Order")({
  id: OrderId,
  customerId: CustomerId,
  createdAt: Schema.DateTimeUtc,
  updatedAt: Schema.DateTimeUtc,
}) {}

export class OrdersWithPagination extends Schema.Class<OrdersWithPagination>(
  "OrdersWithPagination",
)({
  meta: paginationMeta,
  items: Schema.Array(Order),
}) {}
