import * as lua from "luaparse";
import { CodeSelection } from "shared/models/code-selection";
import { Language } from "./language";

interface Error extends lua.Base<"Error"> {
  value: string;
}

export type Node = lua.Node | Error

class Lua implements Language<Node> {
  readonly language = "lua";

  readonly kindKey = "type";

  readonly startCode = `local tab = {
  variable = "string",
  method = function (self) print(self.variable) end
}

tab:method()
`;

  getExtendedChildren(node: Node): Node[] {
    switch (node.type) {
      case "LabelStatement":
      case "GotoStatement":
        return [node.label];
      case "ReturnStatement":
        return node.arguments;
      case "IfStatement":
        return node.clauses;
      case "IfClause":
      case "ElseifClause":
      case "WhileStatement":
      case "RepeatStatement":
        return [node.condition, ...node.body];
      case "ElseClause":
      case "DoStatement":
      case "Chunk":
        return node.body;
      case "LocalStatement":
      case "AssignmentStatement":
        return [...node.variables, ...node.init];
      case "CallExpression":
        return [node.base, ...node.arguments];
      case "TableCallExpression":
        return [node.base, node.arguments];
      case "StringCallExpression":
        return [node.base, node.argument];
      case "IndexExpression":
        return [node.base, node.index];
      case "MemberExpression":
        return [node.base, node.identifier];
      case "BinaryExpression":
      case "LogicalExpression":
        return [node.left, node.right];
      case "UnaryExpression":
        return [node.argument];
      case "TableConstructorExpression":
        return node.fields;
      case "TableValue":
        return [node.value];
      case "TableKeyString":
      case "TableKey":
        return [node.key, node.value];
      case "CallStatement":
        return [node.expression];
      case "FunctionDeclaration":
        return [node.identifier, ...node.parameters, ...node.body];
      case "ForGenericStatement":
        return [...node.variables, ...node.iterators, ...node.body];
      case "ForNumericStatement":
        return [node.variable, node.start, node.end, node.step, ...node.body];
      default:
        return [];
    }
  }

  getChildren(node: Node): Node[] {
    switch (node.type) {
      case "IfClause":
      case "ElseifClause":
      case "WhileStatement":
      case "RepeatStatement":
      case "ElseClause":
      case "DoStatement":
      case "Chunk":
      case "FunctionDeclaration":
      case "ForNumericStatement":
      case "ForGenericStatement":
        return node.body;
      case "TableConstructorExpression":
        return node.fields;
      case "IfStatement":
        return node.clauses;
      default:
        return [];
    }
  }

  parse(code: string): Node {
    let a: Node;
    try {
      a = lua.parse(code, {
        wait: false,
        comments: true,
        scope: true,
        locations: true,
        luaVersion: "LuaJIT",
        ranges: true,
      });
    } catch (e) {
      a = {
        type: "Error",
        value: e.message,
        loc: {
          start: { column: e.column, line: e.line },
          end: { column: e.column + 1, line: e.line },
        },
      };
    }
    return a;
  }

  onEditorInit(editor: typeof monaco) {
    return;
  }

  getFullText(node: Node, code: string) {
    return code.substring(...(node as any).range as [number, number])
  }

  getKind(node: Node) {
    return node.type;
  }

  getClass(node: Node) {
    switch (node.type) {
      case "StringLiteral":
        return "mtk5";
      case "BooleanLiteral":
      case "NilLiteral":
        return "mtk8";
      case "NumericLiteral":
        return "mtk6";
      default:
        return "mtk1";
    }
  }

  getSelection(node: Node): CodeSelection {
    return {
      startPos: node.loc.start,
      endPos: node.loc.end,
    };
  }
}

const luaLanguage = new Lua();

export default luaLanguage;
