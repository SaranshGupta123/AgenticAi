import React, { useState, useMemo, useCallback } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";

type MindmapData = {
  root_node_id: string;
  nodes: Array<{ id: string; label: string; level?: number }>;
  edges: Array<{ from: string; to: string }>;
};

type TreeNode = {
  id: string;
  label: string;
  children: TreeNode[];
};
function buildTree(data: MindmapData): TreeNode {
  const nodeMap = new Map(
    data.nodes.map((n) => [n.id, { ...n, children: [] }])
  );

  data.edges.forEach(({ from, to }) => {
    const parent = nodeMap.get(from);
    const child = nodeMap.get(to);
    if (parent && child) parent.children.push(child as any);
  });

  const root = nodeMap.get(data.root_node_id);
  return root as any;
}
function HorizontalTreeNode({
  node,
  expanded,
  toggle,
}: {
  node: TreeNode;
  expanded: Record<string, boolean>;
  toggle: (id: string) => void;
}) {
  const isExpanded = expanded[node.id] ?? true;
  const hasChildren = node.children.length > 0;

  return (
    <div className="flex items-start w-full relative">
      <div
        className={`px-4 py-2 rounded-lg cursor-pointer transition 
        ${
          node.id === "node_0"
            ? "bg-blue-600 text-white font-bold"
            : "bg-[#2B2F36] border border-white/10 text-gray-200"
        }`}
        onClick={() => hasChildren && toggle(node.id)}
        style={{ minWidth: "260px" }}
      >
        <div className="flex items-center justify-between">
          <span className="truncate">{node.label}</span>
          {hasChildren && (
            <span className="ml-2">
              {isExpanded ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </span>
          )}
        </div>
      </div>

      {isExpanded && hasChildren && (
        <div className="flex flex-col ml-10 relative space-y-4 py-2">
          <div className="absolute left-0 top-0 h-full w-[1px] bg-white/20 translate-x-[-12px]" />
          {node.children.map((child) => (
            <div key={child.id} className="relative">
              <div className="absolute left-[-12px] top-1/2 w-10 h-[1px] bg-white/20" />
              <HorizontalTreeNode
                node={child}
                expanded={expanded}
                toggle={toggle}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
export default function MindmapNotebookLM({ data }: { data: MindmapData }) {
  const tree = useMemo(() => buildTree(data), [data]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    [data.root_node_id]: true,
  });

  const toggle = useCallback((id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  return (
    <div className="w-full h-full overflow-auto p-6 bg-[#1A1D22] rounded-lg">
      <HorizontalTreeNode node={tree} expanded={expanded} toggle={toggle} />
    </div>
  );
}
