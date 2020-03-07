import { Component, Input, ViewEncapsulation, OnInit, Inject, forwardRef, AfterViewInit, ViewChildren, QueryList, EventEmitter, Output } from '@angular/core';

export interface ITreeNode {
    htmlText: string;
    nodes: ITreeNode[];
    expanded: boolean;
    selected: boolean;
}


@Component({
    selector: 'tree-view',
    templateUrl: './tree-view.component.html',
    styleUrls: ['./tree-view.component.scss']//,
    //encapsulation: ViewEncapsulation.None
})
export class TreeViewComponent  {
    @Input() parent: TreeViewComponent;
    @Input() nodes: ITreeNode[] = [];
    @Input() level: number = 0;
    @Input() expandedclass = "fa fa-minus-square-o";
    @Input() closedclass = "fa fa-plus-square-o";
    @Input() emptynodeclass = "fa fa-square-o";
    @Output() selected = new EventEmitter<ITreeNode>();
    instance: TreeViewComponent;

    constructor() {
        this.instance = this;
    }
    onNodeClick(node: ITreeNode) {
        if (node.selected === false) {
            let root = this.findRoot();
            //console.log(`root node is at level ${root.level}`);
            this.setNodeSelected(node);
            root.selected.emit(node);
        }
    }
    selectNode(node: ITreeNode) {
        this.setNodeSelected(node);
    }
    onNodeIconClick(node: ITreeNode) {
        node.expanded = !node.expanded;
    }
    showChildren(node: ITreeNode): boolean {
        //return this.level == 0 || node.expanded === true;
        return node.expanded === true;
    }
    hasNodes(): boolean {
        return this.nodes && this.nodes.length > 0;
    }
    hasChildren(node: ITreeNode): boolean {
        return node.nodes && node.nodes.length > 0;
    }
    getIconClass(node: ITreeNode): string {
        if (this.hasChildren(node)) {
            return node.expanded ? this.expandedclass : this.closedclass;// "fa-minus-square-o" : "fa-plus-square-o";
        }
        else {
            return this.emptynodeclass;
        }
    }
    private setNodeSelected(n: ITreeNode) {
        let root = this.findRoot();
        this.deselectNodes(root.nodes);
        n.selected = true;
    }
    private deselectNodes(nodes: ITreeNode[]) {
        for (let n of nodes) {
            //console.log(`deselecting node ${n.text}`);
            n.selected = false;
            this.deselectNodes(n.nodes);
        }
    }
    private findRoot(): TreeViewComponent {
        let p = this.instance;
        while (p.parent) {
            p = p.parent;
        }
        return p;
    }

}
