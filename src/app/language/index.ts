import lua from "./lua";
import typescript from "./ts";
import { Language } from "./language";
export { Language } from "./language";

export type languageName = "lua" | "typescript";

const languages: Record<languageName, Language<any>> = {
  lua,
  typescript,
};

export default languages;
