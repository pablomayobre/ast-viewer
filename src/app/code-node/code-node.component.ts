import { AppService } from "./../app.service";
import {
  Component,
  OnInit,
  Input,
  ViewEncapsulation,
  HostBinding,
  HostListener,
} from "@angular/core";
import { ASTNode } from "../app.component";
import { getFullText, getClass } from "app/lua";

@Component({
  selector: "code-node",
  templateUrl: "./code-node.component.html",
  styleUrls: ["./code-node.component.scss"],
  encapsulation: ViewEncapsulation.None,
  host: { class: "code-node" },
})
export class CodeNodeComponent implements OnInit {
  @Input()
  node: ASTNode;

  children = [];

  newLines = [];

  @HostBinding("class.code-node--leaf")
  _isLeaf = false;

  constructor(private appService: AppService) {}

  ngOnInit() {
    if (this.node.children) {
      this.node.children.forEach((_node) => {
        this.children.push(_node);
      });
    }
    this._isLeaf = this.isLeaf();
  }

  isLeaf() {
    return this.children.length === 0;
  }

  @HostListener("mouseover")
  onNodeHover() {
    if (this._isLeaf) {
      this.appService.selectNode(this.node.id);
    }
  }

  getNodeText() {
    return getFullText(this.node.realNode).replace(/\n/g, "");
  }

  getNumNewLines() {
    return getFullText(this.node.realNode).match(/\n/g) || [];
  }

  getClass() {
    return getClass(this.node.realNode)
  }
}
