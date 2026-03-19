import * as HttpApiGroup from "@effect/platform/HttpApiGroup";
import * as HttpApiEndpoint from "@effect/platform/HttpApiEndpoint";
import { CreateUserPayload, User } from "./users.domain.js";

export class UserApi extends HttpApiGroup.make("Users")
  .add(
    HttpApiEndpoint.post("create", "/")
      .setPayload(CreateUserPayload)
      .addSuccess(User),
  )
  .prefix("/users") { }
