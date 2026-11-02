"use client";

import React, { useCallback, useEffect, useMemo } from "react";
import {
  Background,
  BackgroundVariant,
  ConnectionMode,
  ConnectionLineType,
  Handle,
  MiniMap,
  Position,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type Node,
  type NodeProps,
  type OnNodeDrag,
  type OnDelete,
  type ReactFlowInstance,
} from "@xyflow/react";
import { Square } from "lucide-react";
import * as CommonTypes from "@/types/common";
import styles from "./index.module.css";

type FlowNodeData = {
  shape: CommonTypes.Shape;
  stepNumber: number;
};

type FlowNode = Node<FlowNodeData>;
export type FlowCanvasInstance = Pick<
  ReactFlowInstance<FlowNode, Edge>,
  "setCenter" | "fitView" | "zoomIn" | "zoomOut"
>;

type Props = {
  shapes: CommonTypes.Shapes;
  curves: CommonTypes.ConnectionCurves;
  selectedShapeId: string | null;
  onSelectShape: (shapeId: string) => void;
  onOpenShape: () => void;
  onMoveShape: (shapeId: string, position: CommonTypes.Vec) => void;
  onMoveStart: () => void;
  onMoveEnd: () => void;
  onConnect: (connection: Connection) => void;
  onDelete: (nodeIds: string[], edgeIds: string[]) => void;
  onInit: (instance: FlowCanvasInstance) => void;
  isConnectMode: boolean;
};

const cardWidth = 200;
const cardHeight = 96;

function FlowCard({ data, selected }: NodeProps<FlowNode>) {
  const { shape, stepNumber } = data;
  const handles = [
    { position: Position.Top, direction: "t" },
    { position: Position.Right, direction: "r" },
    { position: Position.Bottom, direction: "b" },
    { position: Position.Left, direction: "l" },
  ];

  return (
    <div className={`${styles.card} ${selected ? styles.selected : ""}`}>
      {handles.map(({ position, direction }) => (
        <Handle
          key={position}
          type="source"
          position={position}
          id={direction}
          className={styles.handle}
        />
      ))}
      <div className={styles.cardHeader}>
        <span className={styles.shapeIcon}>
          <Square size={14} />
        </span>
        <span className={styles.stepId}>
          STEP {String(stepNumber).padStart(3, "0")}
        </span>
      </div>
      <div className={styles.title}>{shape.title || "Untitled step"}</div>
      <div className={styles.cardFooter}>
        <span className={styles.statusDot} />
        <span>Step</span>
      </div>
    </div>
  );
}

const nodeTypes = { flowCard: FlowCard };

const toFlowNode = (
  shape: CommonTypes.Shape,
  stepNumber: number,
  selectedShapeId: string | null
): FlowNode => ({
  id: shape.id,
  type: "flowCard",
  position: {
    x: shape.p.x - cardWidth / 2,
    y: shape.p.y - cardHeight / 2,
  },
  data: { shape, stepNumber },
  selected: shape.id === selectedShapeId,
  style: { width: cardWidth, height: cardHeight },
});

export default function FlowCanvas({
  shapes,
  curves,
  selectedShapeId,
  onSelectShape,
  onOpenShape,
  onMoveShape,
  onMoveStart,
  onMoveEnd,
  onConnect,
  onDelete,
  onInit,
  isConnectMode,
}: Props) {
  const initialNodes = useMemo(
    () => shapes.map((shape, index) => toFlowNode(shape, index + 1, selectedShapeId)),
    []
  );
  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNode>(initialNodes);

  useEffect(() => {
    setNodes(
      shapes.map((shape, index) => toFlowNode(shape, index + 1, selectedShapeId))
    );
  }, [shapes, selectedShapeId, setNodes]);

  const flowEdges = useMemo<Edge[]>(
    () =>
      curves.flatMap((curve) => {
        const source = shapes.find((shape) => shape.id === curve.from.shape.id);
        const target = shapes.find((shape) => shape.id === curve.to.shape.id);
        if (!source || !target) return [];
        return [
          {
            id: curve.shape.id,
            source: source.id,
            sourceHandle: curve.from.d,
            target: target.id,
            targetHandle: curve.to.d,
            type: "smoothstep",
            animated: false,
            style: { stroke: "#9db4d3", strokeWidth: 2 },
            markerEnd: { type: "arrowclosed", color: "#9db4d3", width: 16, height: 16 },
          },
        ];
      }),
    [curves, shapes]
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(flowEdges);

  useEffect(() => {
    setEdges(flowEdges);
  }, [flowEdges, setEdges]);

  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: FlowNode) => onSelectShape(node.id),
    [onSelectShape]
  );

  const handleNodeDoubleClick = useCallback(
    () => onOpenShape(),
    [onOpenShape]
  );

  const handleNodeDragStop: OnNodeDrag<FlowNode> = useCallback(
    (_event: MouseEvent | TouchEvent, node: FlowNode) => {
      onMoveShape(node.id, {
        x: node.position.x + cardWidth / 2,
        y: node.position.y + cardHeight / 2,
      });
      onMoveEnd();
    },
    [onMoveEnd, onMoveShape]
  );

  const handleConnect = useCallback(
    (connection: Connection) => onConnect(connection),
    [onConnect]
  );

  const handleDelete: OnDelete<FlowNode, Edge> = useCallback(
    ({ nodes: deletedNodes, edges: deletedEdges }) => {
      onDelete(
        deletedNodes.map((node) => node.id),
        deletedEdges.map((edge) => edge.id)
      );
    },
    [onDelete]
  );

  return (
    <div className={styles.canvas}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        connectionMode={ConnectionMode.Loose}
        connectionLineType={ConnectionLineType.SmoothStep}
        connectionLineStyle={{ stroke: "#7b9ac4", strokeWidth: 3 }}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodesDraggable={!isConnectMode}
        nodesConnectable={isConnectMode}
        elementsSelectable={!isConnectMode}
        onNodeClick={handleNodeClick}
        onNodeDoubleClick={handleNodeDoubleClick}
        onNodeDragStart={onMoveStart}
        onNodeDragStop={handleNodeDragStop}
        onConnect={handleConnect}
        onDelete={handleDelete}
        deleteKeyCode={["Backspace", "Delete"]}
        onInit={onInit}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.2}
        maxZoom={1.5}
        className={`${styles.flow} ${
          isConnectMode ? styles.connectMode : ""
        }`}
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{ type: "smoothstep" }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#dce5f0"
        />
        <MiniMap
          className={styles.minimap}
          nodeColor="#94a3b8"
          maskColor="rgba(248, 250, 252, 0.7)"
        />
      </ReactFlow>
    </div>
  );
}
