import { Schema } from "effect";

export const PaginationMeta = Schema.Struct({
  total: Schema.Number.pipe(Schema.greaterThanOrEqualTo(0)),
  page: Schema.Number.pipe(Schema.greaterThanOrEqualTo(1)),
  pageSize: Schema.Number.pipe(Schema.greaterThanOrEqualTo(1)),
  totalPages: Schema.Number.pipe(Schema.greaterThanOrEqualTo(1)),
  nextPage: Schema.NullOr(Schema.Number.pipe(Schema.greaterThanOrEqualTo(1))),
});
