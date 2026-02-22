import { PaginationMeta } from "@/modules/common/domain";
import { Model } from "@effect/sql";
import { Schema } from "effect";

export const ProductId = Schema.UUID.pipe(Schema.brand("ProductId"));
export type ProductId = typeof ProductId.Type;

export class Product extends Model.Class<Product>("Product")({
  id: ProductId,
  name: Schema.NonEmptyTrimmedString,
  description: Schema.NullOr(Schema.String),
  image: Schema.NullOr(Schema.String),
  price: Schema.Number.pipe(Schema.greaterThanOrEqualTo(0)),
}) {}

export class ProductsWithPagination extends Model.Class<ProductsWithPagination>(
  "ProductsWithPagination",
)({
  meta: PaginationMeta,
  items: Schema.Array(Product),
}) {}
