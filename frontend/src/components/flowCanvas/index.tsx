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
import * as CommonTypes from "@/types/common";
import styles from "./index.module.css";

type FlowNodeData = {
  shape: CommonTypes.Step;
  stepStatuses: Record<string, CommonTypes.StepStatus>;
};

type FlowNode = Node<FlowNodeData>;
export type FlowCanvasInstance = Pick<
  ReactFlowInstance<FlowNode, Edge>,
  "setCenter" | "fitView" | "zoomIn" | "zoomOut"
>;

type Props = {
  shapes: CommonTypes.Shapes;
  curves: CommonTypes.ConnectionCurves;
  stepStatuses: Record<string, CommonTypes.StepStatus>;
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
  const { shape, stepStatuses } = data;
  const handles = [
    { position: Position.Top, direction: "t" },
    { position: Position.Right, direction: "r" },
    { position: Position.Bottom, direction: "b" },
    { position: Position.Left, direction: "l" },
  ];

  const status = stepStatuses[shape.id] || "Todo";
  const tone =
    status === "Done"
      ? "done"
      : status === "In Progress"
        ? "inProgress"
        : "todo";

  const assignee = shape.epNumber === 3 ? "Charlie" : "Alice";

  return (
    <div
      className={`${styles.card} ${styles[tone]} ${selected ? styles.selected : ""}`}
    >
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
        <div className={styles.headerTitle}>
          <span className={`${styles.statusIndicator} ${styles[tone]}`} aria-hidden="true">
            <span className={styles.statusIndicatorDot} />
          </span>
          <span className={styles.stepId}>
            ID-{String(shape.epNumber).padStart(3, "0")}
          </span>
        </div>
      </div>

      <div className={styles.titleRow}>
        <span className={styles.title}>{shape.title || "Untitled message"}</span>
      </div>

      <div className={styles.cardFooter}>
        <div className={styles.assigneeBadge}>
          <span className={styles.avatar}>{assignee.charAt(0)}</span>
          <span className={styles.assigneeName}>{assignee}</span>
        </div>
        <span className={`${styles.statusPill} ${styles[`${tone}Pill`]}`}>
          {status}
        </span>
      </div>
    </div>
  );
}

const nodeTypes = { flowCard: FlowCard };

const toFlowNode = (
  shape: CommonTypes.Step,
  selectedShapeId: string | null,
  stepStatuses: Record<string, CommonTypes.StepStatus>
): FlowNode => ({
  id: shape.id,
  type: "flowCard",
  position: {
    x: shape.p.x - cardWidth / 2,
    y: shape.p.y - cardHeight / 2,
  },
  data: { shape, stepStatuses },
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
  stepStatuses,
}: Props & { stepStatuses?: Record<string, CommonTypes.StepStatus> }) {
  const initialNodes = useMemo(
    () => shapes.map((shape) => toFlowNode(shape, selectedShapeId, stepStatuses || {})),
    [shapes, selectedShapeId, stepStatuses]
  );
  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNode>(initialNodes);

  useEffect(() => {
    setNodes(
      shapes.map((shape) => toFlowNode(shape, selectedShapeId, stepStatuses || {}))
    );
  }, [shapes, selectedShapeId, stepStatuses, setNodes]);

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
        connectionLineStyle={{ stroke: "#7b9ac4", strokeWidth: 2 }}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodesDraggable={!isConnectMode}
        nodesConnectable
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
