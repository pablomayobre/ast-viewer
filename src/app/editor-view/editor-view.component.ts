import { Subject } from "rxjs/Subject";
import { Component, OnInit, EventEmitter, Output, Input } from "@angular/core";
import { CodeSelection } from "shared/models/code-selection";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";
import { AppService } from "app/app.service";
import languages, { languageName } from "app/language";

@Component({
  selector: "app-editor-view",
  templateUrl: "./editor-view.component.html",
  styleUrls: ["./editor-view.component.scss"],
})
export class EditorViewComponent<T> implements OnInit {
  /**
   * Whether or not the monaco editor is active
   */
  isEditorEnabled = true;

  /**
   * Options for the Monaco editor
   */
  editorOptions;

  /**
   * Reference to the Monaco editor instance
   */
  editor;

  /**
   * A list of code decorations applied to Monaco. Mainly used to
   * highlight code.
   */
  decorations = [];

  /**
   * Source code rendered inside Monaco
   */
  code: string;

  /**
   * Event emitted when there's a code update inside the Monaco editor
   */
  @Output()
  codeUpdate: EventEmitter<string> = new EventEmitter();

  /**
   * Event emitted when there's a change from Inspector to Editor view
   */
  @Output()
  viewChange: EventEmitter<boolean> = new EventEmitter();

  /**
   * A cache used to store the number of characters per line of code.
   * It has the following form:
   * A = [1, 4, 6, 24, 1, 16], where A[i] represents the number of characters
   * in line i.
   */
  cachedLinesLength = [];

  /**
   * The root node of the tree used to render the fake code editor
   */
  @Input()
  rootNode;

  _lang: languageName;

  @Input()
  set language(lang: languageName) {
    this._lang = lang;
    this.code = languages[this._lang].startCode

    if (!this.isEditorEnabled) this.switchView();
  };

  get language () {
    return this._lang;
  }

  selection;

  /**
   * Stream of code updation events
   */
  private codeUpdate$: Subject<string> = new Subject();

  /**
   * Represents a code snippet selection given its startPos and endPos
   */
  @Input()
  set codeSelection(selection: CodeSelection) {
    if (selection) {
      this.selection = selection;
      this.selectText();
    }
  }

  constructor (private appService: AppService) {}

  ngOnInit() {
    this.code = languages[this._lang].startCode;
    this.codeUpdate$
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((code) => {
        this.codeUpdate.next(code);
      });
    
    this.editorOptions = {
      theme: "vs-dark",
      language: languages[this._lang].language,
      minimap: { enabled: false },
    }
  }

  /**
   * Callback fired when Monaco is initialized
   * @param editor - editor instance
   */
  onEditorInit(editor: any) {
    this.editor = editor;

    if (this.selection) {
      this.selectText();
    }
    
    languages[this._lang].onEditorInit((window as any).monaco)
  }

  /**
   * Selects a text in the editor. The method should receive an initial and a final point.
   * Each point is defined by a tuple (row,col)
   * @param initRow - Start point row
   * @param initCol - Start point column
   * @param endRow - End point row
   * @param endCol - End point column
   */
  selectText() {
    if (!this.editor || !this.selection) return;

    const init = this.selection.startPos,
      end = this.selection.endPos;
    this.decorations = this.editor.deltaDecorations(this.decorations, [
      {
        range: new ((window as any).monaco as typeof monaco).Range(
          init.line,
          init.column + 1,
          end.line,
          end.column + 1
        ),
        options: {
          inlineClassName: "monaco-highlight",
        },
      },
    ]);
  }

  /**
   * Method called from Monaco when there's a code update
   * @param code - new code
   */
  onCodeUpdate(code: string) {
    this.codeUpdate$.next(code);
  }

  /**
   * Returns the (row, col) tuple "coordinate" of a given absolute code
   * position. The absolute position is often obtained from the particular
   * AST node that should be visualized in the code.
   * @param pos - the absolute position within the code snippet
   */
  getLineCol(pos: number): [number, number] {
    for (let i = 0; i < this.cachedLinesLength.length; i++) {
      if (this.cachedLinesLength[i] > pos) {
        return [i + 1, pos + 1];
      }
      pos -= this.cachedLinesLength[i];
    }
    return [0, 0];
  }

  /**
   * Switch between editor and inspector view
   */
  switchView() {
    this.isEditorEnabled = !this.isEditorEnabled;
    this.viewChange.next(this.isEditorEnabled);
  }
}
