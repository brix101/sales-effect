import { PaginationMeta } from "@/modules/common/domain";
import { Model } from "@effect/sql";
import { Schema } from "effect";

export const CustomerId = Schema.UUID.pipe(Schema.brand("CustomerId"));
export type CustomerId = typeof CustomerId.Type;

export class Customer extends Model.Class<Customer>("Customer")({
  id: CustomerId,
  name: Schema.NonEmptyTrimmedString,
  email: Schema.NonEmptyTrimmedString,
  phone: Schema.NullOr(Schema.String),
  address: Schema.NullOr(Schema.String),
}) {}

export class CustomersWithPagination extends Model.Class<CustomersWithPagination>(
  "CustomersWithPagination",
)({
  meta: PaginationMeta,
  items: Schema.Array(Customer),
}) {}
