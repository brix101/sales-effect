import { Schema } from "effect";

export const paginationMeta = Schema.Struct({
  total: Schema.Number.pipe(Schema.greaterThanOrEqualTo(0)),
  page: Schema.Number.pipe(Schema.greaterThanOrEqualTo(1)),
  pageSize: Schema.Number.pipe(Schema.greaterThanOrEqualTo(1)),
  totalPages: Schema.Number.pipe(Schema.greaterThanOrEqualTo(1)),
  nextPage: Schema.NullOr(Schema.Number.pipe(Schema.greaterThanOrEqualTo(1))),
});

export const searchParams = Schema.Struct({
  page: Schema.UndefinedOr(Schema.NumberFromString),
  pageSize: Schema.UndefinedOr(Schema.NumberFromString),
});
