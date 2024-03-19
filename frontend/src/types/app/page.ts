import Core from "@/shapes/core";

type Node = { open: boolean; shape: Core };

type Child = Node;

type Children = Child[];

type Group = { head: Node; children: Children };

type Groups = Group[];

export type { Child, Children, Group, Groups };
