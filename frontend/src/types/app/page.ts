import Core from "@/shapes/core";

type Child = Core

type Children = Child[]

type Group = { head: Core, children: Core[] }

type Groups = Group[]

export type { Child, Children, Group, Groups };
