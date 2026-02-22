import { paginationMeta } from "@/modules/common/domain";
import { Schema } from "effect";

export const ProductId = Schema.UUID.pipe(Schema.brand("ProductId"));
export type ProductId = typeof ProductId.Type;

export class Product extends Schema.Class<Product>("Product")({
  id: ProductId,
  name: Schema.NonEmptyTrimmedString,
  description: Schema.NullOr(Schema.String),
  image: Schema.NullOr(Schema.String),
  price: Schema.Number.pipe(Schema.greaterThanOrEqualTo(0)),
}) {}

export class ProductsWithPagination extends Schema.Class<ProductsWithPagination>(
  "ProductsWithPagination",
)({
  meta: paginationMeta,
  items: Schema.Array(Product),
}) {}
