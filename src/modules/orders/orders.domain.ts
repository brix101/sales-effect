import { PaginationMeta } from "@/modules/common/domain";
import { Model } from "@effect/sql";
import { Schema } from "effect";
import { CustomerId } from "../customers/customers.domain.js";

export const OrderId = Schema.UUID.pipe(Schema.brand("OrderId"));
export type OrderId = typeof OrderId.Type;

export class Order extends Model.Class<Order>("Order")({
  id: OrderId,
  customerId: CustomerId,
  createdAt: Schema.DateTimeUtc,
  updatedAt: Schema.DateTimeUtc,
}) {}

export class OrdersWithPagination extends Model.Class<OrdersWithPagination>(
  "OrdersWithPagination",
)({
  meta: PaginationMeta,
  items: Schema.Array(Order),
}) {}
