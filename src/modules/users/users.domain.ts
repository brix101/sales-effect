import { Email, Password } from "@/modules/common/domain";
import * as Schema from "effect/Schema";

export const UserId = Schema.UUID.pipe(Schema.brand("UserId"));
export type UserId = typeof UserId.Type;

export class User extends Schema.Class<User>("User")({
  id: UserId,
  name: Schema.NonEmptyTrimmedString,
  email: Email,
  password: Schema.Redacted(Password),
}) { }

export class CreateUserPayload extends Schema.Class<CreateUserPayload>(
  "CreateUserPayload",
)({
  name: User.fields.name,
  email: User.fields.email,
  password: User.fields.password,
}) {
  static normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }
}

export type CreateUserPayloadInput = Schema.Schema.Type<
  typeof CreateUserPayload
>;
