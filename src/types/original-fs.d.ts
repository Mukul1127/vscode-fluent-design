declare module "original-fs" {
  import * as fs from "node:fs";
  export = fs;
}

declare module "original-fs/promises" {
  import { promises } from "node:fs";
  export = promises;
}
