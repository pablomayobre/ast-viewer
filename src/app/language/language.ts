import { CodeSelection } from "shared/models/code-selection";

export interface Language<T> {
  language: string;

  startCode: string;

  getExtendedChildren(node: T): T[];

  getChildren(node: T): T[];

  parse(code: string): T;

  getFullText(node: T): string;

  getKind(node: T): string;

  getClass(node: T): "mtk5" | "mtk8" | "mtk6" | "mtk1";

  onEditorInit(editor: typeof monaco): void;

  getSelection(node: T): CodeSelection;
}
