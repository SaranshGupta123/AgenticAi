import React, { useEffect, useMemo, useRef, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";
import type { ForceGraphMethods } from "react-force-graph";

type MindmapNotebookLMProps = {
  data: {
    root_node_id: string;
    nodes: Array<{ id: string; label: string; level?: number }>;
    edges: Array<{ from: string; to: string }>;
  };
};

const shorten = (text: string, max = 22) =>
  text.length > max ? text.slice(0, max) + "…" : text;

export default function MindmapNotebookLM({ data }: MindmapNotebookLMProps) {
  const fgRef = useRef<ForceGraphMethods>();

  const rootId = data.root_node_id;
  const rawNodes = data.nodes;
  const rawEdges = data.edges;

  const childrenMap = useMemo(() => {
    const map = new Map<string, string[]>();
    rawEdges.forEach((e) => {
      if (!map.has(e.from)) map.set(e.from, []);
      map.get(e.from)!.push(e.to);
    });
    return map;
  }, [rawEdges]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set([rootId]));

  const graph = useMemo(() => {
    const nodes: any[] = [];
    const links: any[] = [];
    const seen = new Set<string>();

    const queue = [rootId];
    while (queue.length) {
      const id = queue.shift()!;
      if (seen.has(id)) continue;
      seen.add(id);

      const nodeData = rawNodes.find((n) => n.id === id);
      nodes.push({
        id,
        label: nodeData?.label ?? id,
        level: nodeData?.level ?? 0,
      });

      if (expanded.has(id)) {
        const kids = childrenMap.get(id) || [];
        for (const kid of kids) {
          links.push({ source: id, target: kid });
          if (!seen.has(kid)) queue.push(kid);
        }
      }
    }

    return { nodes, links };
  }, [rootId, rawNodes, childrenMap, expanded]);

  useEffect(() => {
    const t = setTimeout(() => fgRef.current?.zoomToFit(600, 80), 250);
    return () => clearTimeout(t);
  }, [graph]);

  const handleNodeClick = (node: any) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(node.id)) {
        const stack = [node.id];
        while (stack.length) {
          const cur = stack.pop()!;
          next.delete(cur);
          (childrenMap.get(cur) || []).forEach((c) => stack.push(c));
        }
        return next;
      }

      next.add(node.id);
      return next;
    });
  };

  return (
    <div className="w-full h-full">
      <ForceGraph2D
        ref={fgRef as any}
        graphData={graph}
        backgroundColor="#111418"
        enableNodeDrag={false}
        dagMode="lr"
        dagLevelDistance={140}
        cooldownTicks={1}
        onEngineStop={() => fgRef.current?.zoomToFit(600, 80)}
        linkColor={() => "rgba(255,255,255,0.28)"}
        linkWidth={1.2}
        onNodeClick={handleNodeClick}
        nodeLabel={(n: any) => n.label}
        nodeCanvasObject={(node: any, ctx, scale) => {
          const label = shorten(node.label, 26);
          const fontSize = Math.max(14 / scale, 10);
          ctx.font = `${fontSize}px Inter, sans-serif`;

          const textWidth = ctx.measureText(label).width;
          const paddingX = 14;
          const paddingY = 8;
          const boxWidth = textWidth + paddingX * 2;
          const boxHeight = fontSize + paddingY * 2;

          const x = node.x - boxWidth / 2;
          const y = node.y - boxHeight / 2;

          const fill =
            node.level === 0
              ? "#4F8CFF"
              : node.level === 1
              ? "#4ECDC4"
              : node.level === 2
              ? "#FFB020"
              : "#A5A5A5";

          const radius = 10;
          ctx.beginPath();
          ctx.fillStyle = fill;
          ctx.strokeStyle = "rgba(255,255,255,0.25)";
          ctx.lineWidth = 2;

          ctx.moveTo(x + radius, y);
          ctx.lineTo(x + boxWidth - radius, y);
          ctx.quadraticCurveTo(x + boxWidth, y, x + boxWidth, y + radius);
          ctx.lineTo(x + boxWidth, y + boxHeight - radius);
          ctx.quadraticCurveTo(
            x + boxWidth,
            y + boxHeight,
            x + boxWidth - radius,
            y + boxHeight
          );
          ctx.lineTo(x + radius, y + boxHeight);
          ctx.quadraticCurveTo(x, y + boxHeight, x, y + boxHeight - radius);
          ctx.lineTo(x, y + radius);
          ctx.quadraticCurveTo(x, y, x + radius, y);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = "#FFFFFF";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(label, node.x, node.y);
        }}
      />
    </div>
  );
}
