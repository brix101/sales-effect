import * as Schema from "effect/Schema";

export const paginationMeta = Schema.Struct({
  total: Schema.Number.pipe(Schema.greaterThanOrEqualTo(0)),
  page: Schema.Number.pipe(Schema.greaterThanOrEqualTo(1)),
  pageSize: Schema.Number.pipe(Schema.greaterThanOrEqualTo(1)),
  totalPages: Schema.Number.pipe(Schema.greaterThanOrEqualTo(1)),
  nextPage: Schema.NullOr(Schema.Number.pipe(Schema.greaterThanOrEqualTo(1))),
});

export const searchParams = Schema.Struct({
  page: Schema.UndefinedOr(Schema.NumberFromString).pipe(
    Schema.annotations({
      title: "Page",
      description: "The page number defaults to 1",
    }),
    Schema.brand("Page"),
  ),
  pageSize: Schema.UndefinedOr(Schema.NumberFromString).pipe(
    Schema.annotations({
      title: "Page Size",
      description: "The number of items per page defaults to 20",
    }),
    Schema.brand("PageSize"),
  ),
});

export const Email = Schema.String.pipe(
  Schema.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
  Schema.annotations({
    title: "Email",
    description: "An email address",
  }),
  Schema.brand("Email"),
);

export type Email = typeof Email.Type;

export const Password = Schema.String.pipe(
  Schema.minLength(8),
  // Schema.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/), // At least 8 characters, at least one letter and one number
  Schema.annotations({
    title: "Password",
    description:
      "A password with at least 8 characters, including at least one letter and one number",
  }),
  Schema.brand("Password"),
);

export type Password = typeof Password.Type;
