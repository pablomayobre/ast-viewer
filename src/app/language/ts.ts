import * as ts from "typescript";
import { CodeSelection } from "shared/models/code-selection";
import { Language } from "./language";

class TypeScript implements Language<ts.Node> {
  readonly language = "typescript";

  readonly startCode = `import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.css' ]
})
export class AppComponent implements OnInit {
  name = 'Angular 5';

  ngOnInit() {
    let a = 2;
    if (a < 10) {
      this.sendData(a);
      window.alert();
    }
  }
}
`;

  getExtendedChildren(node: ts.Node): ts.Node[] {
    return node.getChildren();
  }

  getChildren(node: ts.Node): ts.Node[] {
    const child: ts.Node[] = [];
    ts.forEachChild(node, (node) => child.push(node));
    return child;
  }

  parse(code: string): ts.Node {
    return ts.createSourceFile("_.ts", code, ts.ScriptTarget.Latest, true);
  }

  getFullText(node: ts.Node, code: string) {
    return node.getFullText();
  }

  getKind(node: ts.Node) {
    return ts.SyntaxKind[node.kind];
  }

  getClass(node: ts.Node) {
    if (ts.isStringLiteral(node)) {
      return "mtk5";
    } else if (node.kind >= 72 && node.kind <= 142) {
      return "mtk8";
    } else if (ts.isNumericLiteral(node)) {
      return "mtk6";
    } else {
      return "mtk1";
    }
  }

  onEditorInit(editor: typeof monaco) {
    // Disabled semantic and syntax validations in Monaco
    editor.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: true,
    });
  }

  getSelection(node: ts.Node): CodeSelection {
    const start = (window as any).monaco.editor.getModels()[0].getPositionAt(node.pos);
    const end = (window as any).monaco.editor.getModels()[0].getPositionAt(node.end);

    return {
      startPos: { line: start.lineNumber, column: start.column-1 },
      endPos: { line: end.lineNumber, column: end.column-1 },
    };
  }
}

const tsLanguage = new TypeScript();

export default tsLanguage;
