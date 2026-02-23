import { HttpApiEndpoint, HttpApiGroup } from "@effect/platform";
import { CreateUserPayload, User } from "./users.domain.js";

export class UserApi extends HttpApiGroup.make("Users")
  .add(
    HttpApiEndpoint.post("create", "/")
      .setPayload(CreateUserPayload)
      .addSuccess(User),
  )
  .prefix("/users") {}
