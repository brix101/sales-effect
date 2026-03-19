import { Email, paginationMeta } from "@/modules/common/domain";
import * as Schema from "effect/Schema";

export const CustomerId = Schema.UUID.pipe(Schema.brand("CustomerId"));
export type CustomerId = typeof CustomerId.Type;

export class Customer extends Schema.Class<Customer>("Customer")({
  id: CustomerId,
  name: Schema.NonEmptyTrimmedString,
  email: Email,
  phone: Schema.NullOr(Schema.String),
  address: Schema.NullOr(Schema.String),
}) { }

export class CustomersWithPagination extends Schema.Class<CustomersWithPagination>(
  "CustomersWithPagination",
)({
  meta: paginationMeta,
  items: Schema.Array(Customer),
}) { }
