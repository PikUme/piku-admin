import { setupServer } from "msw/node";

import { adminAuthHandlers } from "./handlers";

export const server = setupServer(...adminAuthHandlers);
