// import React, { useState, useEffect, useMemo, useRef } from "react";
// import { Eye, EyeOff, Loader, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

// import { fetchMindmapFromAPI } from "../api/api";

// type MindmapNode = {
//   id: string;
//   label: string;
//   level: number;
//   node_type: string;
//   color?: string;
//   description?: string;
//   keywords?: string[];
//   children?: MindmapNode[];
//   x?: number;
//   y?: number;
// };

// type MindmapCluster = {
//   cluster_id: string;
//   theme: string;
//   node_ids: string[];
//   color: string;
// };

// type MindmapData = {
//   root_node_id: string;
//   nodes: MindmapNode[];
//   edges: Array<{ from: string; to: string }>;
//   clusters: MindmapCluster[];
//   statistics: any;
//   metadata: any;
// };

// const buildTree = (data: MindmapData): MindmapNode | null => {
//   const map = new Map(data.nodes.map((n) => [n.id, { ...n, children: [] }]));

//   const clusterNodes: Record<string, MindmapNode> = {};
//   data.clusters.forEach((c) => {
//     const id = `cluster_theme_${c.cluster_id}`;
//     const parent = {
//       id,
//       label: c.theme,
//       node_type: "cluster",
//       level: 1,
//       color: c.color,
//       children: [],
//     };
//     clusterNodes[id] = parent;
//     map.set(id, parent);
//   });

//   const root = map.get(data.root_node_id) || null;
//   if (!root) return null;
//   data.clusters.forEach((cluster) => {
//     const clusterId = `cluster_theme_${cluster.cluster_id}`;
//     const clusterNode = map.get(clusterId)!;

//     cluster.node_ids.forEach((nid) => {
//       const n = map.get(nid);
//       if (n && n.level === 1) clusterNode.children!.push(n);
//     });

//     clusterNode.children!.sort((a, b) => a.label.localeCompare(b.label));
//     root.children!.push(clusterNode);
//   });
//   const childrenOf: Record<string, string[]> = {};
//   data.edges.forEach((e) => {
//     if (!childrenOf[e.from]) childrenOf[e.from] = [];
//     childrenOf[e.from].push(e.to);
//   });

//   const resolve = (id: string) => {
//     const parent = map.get(id);
//     if (!parent) return;
//     const childIds = childrenOf[id] || [];
//     parent.children = childIds
//       .map((cid) => map.get(cid))
//       .filter(Boolean)
//       .sort((a, b) => a!.label.localeCompare(b!.label)) as MindmapNode[];
//     parent.children.forEach((c) => resolve(c.id));
//   };
//   root.children!.forEach((cluster) =>
//     cluster.children!.forEach((child) => resolve(child.id))
//   );

//   return root;
// };
// const calcWidth = (label: string) =>
//   Math.min(400, Math.max(200, label.length * 9 + 40));

// const linkPath = (sx: number, sy: number, tx: number, ty: number) => {
//   const mid = (sx + tx) / 2;
//   return `M ${sx} ${sy} C ${mid} ${sy}, ${mid} ${ty}, ${tx} ${ty}`;
// };

// const StatCard = ({ label, value }) => (
//   <div className="bg-[#2B2F36] rounded-xl p-4 border border-blue-500/20 shadow-xl">
//     <p className="text-gray-400 text-sm">{label}</p>
//     <p className="text-blue-300 font-extrabold text-3xl">{value}</p>
//   </div>
// );

// const MetadataItem = ({ label, value }) => (
//   <p className="flex text-sm justify-between text-gray-300">
//     <span className="text-gray-500 font-medium">{label}:</span>
//     <span className="font-mono">{value || "N/A"}</span>
//   </p>
// );

// const StatisticsPanel = ({ statistics, clusters, metadata }) => (
//   <div className="bg-[#1E2228] border border-white/10 rounded-2xl p-6 mb-6">
//     <h3 className="text-xl font-extrabold text-blue-400 mb-4">
//       Mind Map Stats
//     </h3>
//     <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
//       <StatCard
//         label="Nodes"
//         value={statistics.total_nodes + clusters.length}
//       />
//       <StatCard label="Edges" value={statistics.total_edges} />
//       <StatCard label="Depth" value={statistics.max_depth + 1} />
//       <StatCard label="Clusters" value={statistics.cluster_count} />
//     </div>

//     <div className="bg-[#2B2F36] rounded-xl p-4 mb-4">
//       <MetadataItem label="Topic" value={metadata.topic} />
//       <MetadataItem label="Source Domain" value={metadata.source_domain} />
//       <MetadataItem label="Documents" value={metadata.num_documents_used} />
//       <MetadataItem
//         label="Time"
//         value={
//           metadata.generation_time_seconds
//             ? `${metadata.generation_time_seconds.toFixed(2)}s`
//             : "N/A"
//         }
//       />
//     </div>

//     <div>
//       <p className="font-bold mb-2">Clusters</p>
//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//         {clusters.map((c) => (
//           <div
//             key={c.cluster_id}
//             className="flex items-center gap-2 bg-[#2B2F36] p-3 rounded-xl"
//           >
//             <div
//               className="w-4 h-4 rounded-full"
//               style={{ background: c.color }}
//             />
//             <span className="text-gray-300 truncate flex-1">{c.theme}</span>
//             <span className="text-gray-500 text-[10px]">
//               {c.node_ids.length} nodes
//             </span>
//           </div>
//         ))}
//       </div>
//     </div>
//   </div>
// );

// export default function MindmapNotebookLM({ topic = "General" }) {
//   const svgRef = useRef(null);

//   const [data, setData] = useState<MindmapData | null>(null);
//   const [error, setError] = useState(null);
//   const [showStats, setShowStats] = useState(true);
//   const [zoom, setZoom] = useState(0.5);
//   const [transform, setTransform] = useState({ x: 40, y: 467 });
//   const [loading, setLoading] = useState(true);

//   const [expanded, setExpanded] = useState<Set<string>>(new Set());
//   const [drag, setDrag] = useState({ active: false, dx: 0, dy: 0 });

//   useEffect(() => {
//     fetchMindmapFromAPI(topic)
//       .then((d) => {
//         setData(d);
//         setLoading(false);

//         const all = new Set(d.nodes.map((n) => n.id));
//         d.clusters.forEach((c) => all.add(`cluster_theme_${c.cluster_id}`));
//         setExpanded(all);
//       })
//       .catch(() => {
//         setError("Failed to load mindmap.");
//         setLoading(false);
//       });
//   }, [topic]);

//   const root = useMemo(() => (data ? buildTree(data) : null), [data]);
//   useEffect(() => {
//     if (!root || !svgRef.current) return;

//     const svg = svgRef.current;
//     svg.innerHTML = "";

//     const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
//     g.setAttribute(
//       "transform",
//       `translate(${transform.x},${transform.y}) scale(${zoom})`
//     );

//     const levelGap = 450;
//     const nodeGap = 90;

//     const place = (node: MindmapNode, x: number, y: number): number => {
//       node.x = x;
//       node.y = y;

//       if (!expanded.has(node.id) || !node.children?.length) return nodeGap;

//       let cy = y;
//       let total = 0;

//       node.children.forEach((child) => {
//         const h = place(child, x + levelGap, cy);
//         cy += h;
//         total += h;
//       });

//       node.y = y + (total - nodeGap) / 2;
//       return total;
//     };

//     place(root, 0, 0);

//     const drawLinks = (node: MindmapNode) => {
//       if (!expanded.has(node.id)) return;

//       node.children?.forEach((c) => {
//         const width = calcWidth(node.label);
//         const d = linkPath(
//           (node.x || 0) + width,
//           node.y!,
//           (c.x || 0) - 18,
//           c.y!
//         );
//         const path = document.createElementNS(
//           "http://www.w3.org/2000/svg",
//           "path"
//         );
//         path.setAttribute("d", d);
//         path.setAttribute("fill", "none");
//         path.setAttribute("stroke", "#4E5166");
//         path.setAttribute("stroke-width", "2");
//         g.appendChild(path);
//         drawLinks(c);
//       });
//     };

//     const drawNode = (node: MindmapNode) => {
//       const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
//       group.setAttribute("transform", `translate(${node.x},${node.y})`);

//       const label =
//         node.label.length > 40
//           ? node.label.substring(0, 37) + "..."
//           : node.label;
//       const width = calcWidth(label);

//       const rect = document.createElementNS(
//         "http://www.w3.org/2000/svg",
//         "rect"
//       );
//       rect.setAttribute("x", "-18");
//       rect.setAttribute("width", width.toString());
//       rect.setAttribute("height", "55");
//       rect.setAttribute("y", "-27.5");
//       rect.setAttribute("rx", "8");
//       rect.setAttribute("fill", node.color || "#4E5166");
//       group.appendChild(rect);

//       const text = document.createElementNS(
//         "http://www.w3.org/2000/svg",
//         "text"
//       );
//       text.setAttribute("fill", "white");
//       text.setAttribute("font-size", "18");
//       text.setAttribute("dominant-baseline", "middle");
//       text.textContent = label;
//       group.appendChild(text);

//       if (node.children?.length) {
//         const toggle = document.createElementNS(
//           "http://www.w3.org/2000/svg",
//           "text"
//         );
//         toggle.textContent = expanded.has(node.id) ? "<" : ">";
//         toggle.setAttribute("x", width.toString());
//         toggle.setAttribute("font-size", "20");
//         toggle.onclick = (e) => {
//           e.stopPropagation();
//           setExpanded((prev) => {
//             const copy = new Set(prev);
//             copy.has(node.id) ? copy.delete(node.id) : copy.add(node.id);
//             return copy;
//           });
//         };
//         group.appendChild(toggle);
//       }

//       g.appendChild(group);
//       node.children?.forEach(drawNode);
//     };

//     drawLinks(root);
//     drawNode(root);

//     svg.appendChild(g);
//   }, [root, expanded, zoom, transform]);

//   const down = (e) =>
//     setDrag({
//       active: true,
//       dx: e.clientX - transform.x,
//       dy: e.clientY - transform.y,
//     });

//   const move = (e) =>
//     drag.active &&
//     setTransform({ x: e.clientX - drag.dx, y: e.clientY - drag.dy });

//   const up = () => drag.active && setDrag({ ...drag, active: false });
//   if (loading)
//     return (
//       <div className="flex items-center justify-center h-96">
//         <Loader className="animate-spin text-blue-500" size={32} />
//       </div>
//     );

//   if (error)
//     return (
//       <div className="h-96 flex items-center justify-center text-red-400">
//         {error}
//       </div>
//     );

//   return (
//     <div className="w-full bg-[#13171D] text-white rounded-2xl p-6 shadow-2xl">
//       <div className="flex justify-between items-center pb-4 border-b border-gray-700/50">
//         <div>
//           <h2 className="text-3xl font-extrabold text-blue-400">
//             Knowledge Map Explorer
//           </h2>
//           <p className="text-gray-400 mt-1">{data.metadata.topic}</p>
//         </div>

//         <div className="flex gap-3">
//           <button
//             onClick={() => setShowStats((s) => !s)}
//             className="px-4 py-2 bg-[#2B2F36] rounded-xl border border-white/10"
//           >
//             {showStats ? <EyeOff size={16} /> : <Eye size={16} />}
//           </button>

//           <button
//             onClick={() => setExpanded(new Set())}
//             className="px-4 py-2 bg-[#2B2F36] rounded-xl"
//           >
//             Collapse All
//           </button>
//           <button
//             onClick={() => {
//               const all = new Set(data.nodes.map((n) => n.id));
//               data.clusters.forEach((c) =>
//                 all.add(`cluster_theme_${c.cluster_id}`)
//               );
//               setExpanded(all);
//             }}
//             className="px-4 py-2 bg-blue-600 rounded-xl"
//           >
//             Expand All
//           </button>
//         </div>
//       </div>

//       {showStats && (
//         <StatisticsPanel
//           statistics={data.statistics}
//           clusters={data.clusters}
//           metadata={data.metadata}
//         />
//       )}

//       <div
//         className="relative bg-[#1E2228] border border-white/10 rounded-2xl h-[80vh] p-4"
//         onWheel={(e) => {
//           e.preventDefault();
//           setZoom((z) =>
//             Math.min(3, Math.max(0.1, z + (e.deltaY > 0 ? -0.05 : 0.05)))
//           );
//         }}
//       >
//         <div className="absolute top-20 right-8 flex flex-col gap-2 z-20">
//           <button
//             onClick={() => setZoom((z) => Math.min(3, z + 0.1))}
//             className="p-2 bg-[#2B2F36]"
//           >
//             <ZoomIn size={20} />
//           </button>
//           <button
//             onClick={() => setZoom((z) => Math.max(0.1, z - 0.1))}
//             className="p-2 bg-[#2B2F36]"
//           >
//             <ZoomOut size={20} />
//           </button>
//           <button
//             onClick={() => setTransform({ x: 40, y: 467 })}
//             className="p-2 bg-[#2B2F36]"
//           >
//             <Maximize2 size={20} />
//           </button>
//         </div>

//         <svg
//           ref={svgRef}
//           className="w-full h-full"
//           onMouseDown={down}
//           onMouseMove={move}
//           onMouseUp={up}
//           onMouseLeave={up}
//           style={{ cursor: drag.active ? "grabbing" : "grab" }}
//         />
//       </div>
//     </div>
//   );
// }

import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from "react";
import {
  ChevronRight,
  ChevronDown,
  Network,
  Info,
  Loader,
  Eye,
  EyeOff,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from "lucide-react";
import { generateMindmap } from "../api/api";
const BASE_COLORS = [
  { r: 32, g: 54, b: 94 },
  { r: 34, g: 82, b: 60 },
  { r: 55, g: 55, b: 70 },
];

function getColorForNode(node: MindmapNode) {
  const BASE = [
    { r: 25, g: 45, b: 80 },
    { r: 20, g: 65, b: 50 },
    { r: 45, g: 40, b: 70 },
  ];

  const base = BASE[node.level % 3];

  const hash = Array.from(node.id).reduce((a, c) => a + c.charCodeAt(0), 0);

  const offset = (hash % 40) - 20;

  const depthDarken = node.level * 5;

  let r = base.r + offset - depthDarken;
  let g = base.g + offset - depthDarken;
  let b = base.b + offset - depthDarken;

  r = Math.max(10, Math.min(80, r));
  g = Math.max(10, Math.min(80, g));
  b = Math.max(10, Math.min(80, b));

  return `rgb(${r}, ${g}, ${b})`;
}

type MindmapNode = {
  id: string;
  label: string;
  level: number;
  node_type: string;
  importance?: number;
  color?: string;
  description?: string;
  keywords?: string[];
  children: MindmapNode[];
  isClusterTheme?: boolean;
  x?: number;
  y?: number;
};

type MindmapCluster = {
  cluster_id: string;
  theme: string;
  node_ids: string[];
  color: string;
};

type MindmapData = {
  root_node_id: string;
  nodes: MindmapNode[];
  edges: Array<{ from: string; to: string }>;
  clusters: MindmapCluster[];
  statistics: {
    total_nodes: number;
    total_edges: number;
    max_depth: number;
    avg_branching_factor: number;
    node_distribution: Record<string, number>;
    cluster_count: number;
    generation_time: number;
  };
  metadata: {
    topic: string;
    source_domain: string;
    num_documents_used: number;
    generation_time_seconds: number;
    [key: string]: any;
  };
  layout_suggestions: {
    recommended_layout: string;
    [key: string]: any;
  };
};

function buildTree(data: MindmapData): MindmapNode | null {
  const { nodes, edges, root_node_id, clusters } = data;
  const nodeMap = new Map<string, MindmapNode>();
  function assignRealDepth(node: MindmapNode, depth: number) {
    node.level = depth;

    node.children.forEach((child) => {
      assignRealDepth(child, depth + 1);
    });
  }

  nodes.forEach((n) => {
    nodeMap.set(n.id, {
      ...n,
      children: [],
      isClusterTheme: false,
    } as MindmapNode);
  });

  const clusterNodes: Record<string, MindmapNode> = {};
  clusters.forEach((cluster) => {
    const clusterId = `cluster_theme_${cluster.cluster_id}`;

    clusterNodes[clusterId] = {
      id: clusterId,
      label: cluster.theme,
      level: 1,
      node_type: "cluster",
      color: cluster.color,
      importance: 9,
      description: `Collection of nodes related to ${cluster.theme}`,
      keywords: [cluster.theme.toLowerCase().replace(/\s/g, "_")],
      children: [],
      isClusterTheme: true,
    } as MindmapNode;
    nodeMap.set(clusterId, clusterNodes[clusterId]);
  });

  const rootNode = nodeMap.get(root_node_id);
  if (!rootNode) return null;

  const attachedNodes = new Set<string>();

  clusters.forEach((cluster) => {
    const clusterId = `cluster_theme_${cluster.cluster_id}`;
    const clusterNode = clusterNodes[clusterId];

    if (clusterNode) {
      cluster.node_ids.forEach((nodeId) => {
        const originalNode = nodeMap.get(nodeId);
        if (
          originalNode &&
          originalNode.level === 1 &&
          !attachedNodes.has(nodeId)
        ) {
          clusterNode.children.push(originalNode);
          attachedNodes.add(nodeId);
        }
      });

      clusterNode.children.sort((a, b) => a.label.localeCompare(b.label));

      if (!rootNode.children.some((child) => child.id === clusterId)) {
        rootNode.children.push(clusterNode);
      }
    }
  });

  const nonRootEdges = edges.filter((e) => e.from !== root_node_id);
  const parentChildMap: Record<string, string[]> = {};
  nonRootEdges.forEach((edge) => {
    if (!parentChildMap[edge.from]) {
      parentChildMap[edge.from] = [];
    }
    parentChildMap[edge.from].push(edge.to);
  });

  function resolveChildren(parentId: string) {
    const parentObj = nodeMap.get(parentId);
    if (!parentObj) return;

    const childrenIds = parentChildMap[parentId] || [];

    parentObj.children = (
      childrenIds
        .map((childId) => nodeMap.get(childId))
        .filter((child) => child !== undefined) as MindmapNode[]
    ).sort((a, b) => a.label.localeCompare(b.label));

    parentObj.children.forEach((child) => {
      resolveChildren(child.id);
    });
  }
  rootNode.children.forEach((cluster) => {
    cluster.children.forEach((originalConcept) => {
      resolveChildren(originalConcept.id);
    });
  });

  rootNode.children.sort((a, b) => a.label.localeCompare(b.label));
  assignRealDepth(rootNode, 0);

  return rootNode;
}

const StatCard = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => (
  <div className="bg-[#2B2F36] rounded-xl p-4 border border-blue-500/20 shadow-xl shadow-black/30 hover:shadow-blue-900/40 transition-shadow">
    <p className="text-gray-400 font-medium text-sm">{label}</p>
    <p className="text-blue-300 font-extrabold text-3xl mt-1">{value}</p>
  </div>
);

const MetadataItem = ({
  label,
  value,
}: {
  label: string;
  value: string | number | undefined | null;
}) => (
  <p className="text-gray-300 text-sm flex justify-between items-start">
    <span className="text-gray-500 font-medium w-1/3 flex-shrink-0">
      {label}:
    </span>
    <span className="text-white font-mono max-w-[65%] text-right break-words">
      {value?.toString() || "N/A"}
    </span>
  </p>
);

function StatisticsPanel({
  statistics,
  clusters,
  metadata,
}: {
  statistics: MindmapData["statistics"];
  clusters: MindmapCluster[];
  metadata: MindmapData["metadata"];
}) {
  const totalNodes = statistics.total_nodes + clusters.length;

  return (
    <div className="bg-[#1E2228] border border-white/10 rounded-2xl p-6 mb-6 shadow-2xl">
      <h3 className="text-xl font-extrabold text-blue-400 mb-4 flex items-center gap-2">
        <Info size={24} className="text-blue-500" />
        Mind Map Statistics & Metadata
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs mb-6">
        <StatCard label="Total Nodes" value={totalNodes} />
        <StatCard label="Total Edges" value={statistics.total_edges} />
        <StatCard label="Max Depth" value={statistics.max_depth + 1} />
        <StatCard label="Clusters" value={statistics.cluster_count} />
      </div>

      {metadata && (
        <div className="bg-[#2B2F36] rounded-xl p-4 mb-6 text-sm space-y-3 border border-gray-700">
          <p className="text-gray-400 font-bold mb-2 text-base">
            Topic Information
          </p>
          <MetadataItem label="Topic" value={metadata.topic} />
          <MetadataItem label="Source Domain" value={metadata.source_domain} />
          <MetadataItem
            label="Documents Used"
            value={metadata.num_documents_used}
          />
          <MetadataItem
            label="Generation Time"
            value={
              metadata.generation_time_seconds
                ? `${metadata.generation_time_seconds.toFixed(2)}s`
                : "N/A"
            }
          />
        </div>
      )}
      {clusters.length > 0 && (
        <div className="pt-4 border-t border-white/10">
          <p className="text-gray-300 text-base mb-3 font-bold">
            Cluster Legend:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {clusters.map((cluster) => (
              <div
                key={cluster.cluster_id}
                className="flex items-center gap-2 text-xs bg-[#2B2F36] p-3 rounded-xl border border-gray-700 hover:shadow-lg transition duration-200"
              >
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0 shadow-lg"
                  style={{ backgroundColor: cluster.color }}
                />
                <span className="text-gray-300 font-semibold flex-1 truncate text-sm">
                  {cluster.theme}
                </span>
                <span className="text-gray-500 font-mono text-[10px] bg-black/20 px-2 py-0.5 rounded-full border border-white/10">
                  {cluster.node_ids.length} Concepts
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function MindmapNotebookLM() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [data, setData] = useState<MindmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showStats, setShowStats] = useState(true);
  const [zoom, setZoom] = useState(0.5);
  const [transform, setTransform] = useState({ x: 40, y: 467 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  useEffect(() => {
    generateMindmap("Food Systems: Carbon Footprint, Resilience, and Policy.")
      .then((fetchedData: any) => {
        setData(fetchedData as MindmapData);
        setLoading(false);
        setError(null);
        const allNodeIds = new Set(fetchedData.nodes.map((n: any) => n.id));
        fetchedData.clusters?.forEach((c: any) => {
          allNodeIds.add(`cluster_theme_${c.cluster_id}`);
        });
        setExpandedNodes(allNodeIds);
      })
      .catch((err) => {
        console.error("Mindmap Fetch Error:", err);
        setError("Failed to load mind map data.");
        setLoading(false);
      });
  }, []);

  const root = useMemo(() => {
    if (!data || !data.nodes || !data.edges) return null;
    return buildTree(data);
  }, [data]);

  useEffect(() => {
    if (!root || !svgRef.current) return;

    const svg = svgRef.current;
    svg.innerHTML = "";

    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute(
      "transform",
      `translate(${transform.x},${transform.y}) scale(${zoom})`
    );

    const levelGap = 450;
    const nodeGap = 90;

    function calculatePositions(
      node: MindmapNode,
      x: number,
      y: number
    ): number {
      node.x = x;
      node.y = y;

      if (
        !expandedNodes.has(node.id) ||
        !node.children ||
        node.children.length === 0
      ) {
        return nodeGap;
      }

      let currentY = y;
      let totalHeight = 0;

      node.children.forEach((child) => {
        const childHeight = calculatePositions(child, x + levelGap, currentY);
        currentY += childHeight;
        totalHeight += childHeight;
      });

      node.y = y + (totalHeight - nodeGap) / 2;

      return totalHeight;
    }

    calculatePositions(root, 0, 0);

    function drawLinks(node: MindmapNode) {
      if (!expandedNodes.has(node.id) || !node.children) return;

      node.children.forEach((child) => {
        const path = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "path"
        );

        const maxChars = 40;
        const displayLabel =
          node.label.length > maxChars
            ? node.label.substring(0, maxChars) + "..."
            : node.label;
        const nodeWidth = Math.min(
          400,
          Math.max(200, displayLabel.length * 9 + 40)
        );

        const sourceX = (node.x || 0) + nodeWidth;
        const sourceY = node.y || 0;
        const targetX = (child.x || 0) - 18;
        const targetY = child.y || 0;

        const midX = (sourceX + targetX) / 2;

        const d = `M ${sourceX} ${sourceY}
                   C ${midX} ${sourceY},
                     ${midX} ${targetY},
                     ${targetX} ${targetY}`;

        path.setAttribute("d", d);
        path.setAttribute("fill", "none");
        path.setAttribute("stroke", "#4E5166");
        path.setAttribute("stroke-width", "2");
        g.appendChild(path);

        drawLinks(child);
      });
    }

    drawLinks(root);

    function drawNodes(node: MindmapNode) {
      const nodeG = document.createElementNS("http://www.w3.org/2000/svg", "g");
      nodeG.classList.add("node");
      nodeG.setAttribute(
        "transform",
        `translate(${node.x || 0}, ${node.y || 0})`
      );

      const maxChars = 40;
      const displayLabel =
        node.label.length > maxChars
          ? node.label.substring(0, maxChars) + "..."
          : node.label;

      const textWidth = Math.min(
        400,
        Math.max(200, displayLabel.length * 9 + 40)
      );

      const rect = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect"
      );
      rect.setAttribute("x", "-18");
      rect.setAttribute("y", "-27.5");
      rect.setAttribute("width", textWidth.toString());
      rect.setAttribute("height", "55");
      rect.setAttribute("rx", "8");
      rect.setAttribute("ry", "8");
      rect.setAttribute("fill", getColorForNode(node));
      rect.style.cursor = "pointer";
      nodeG.appendChild(rect);

      const text = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      text.classList.add("node-name");
      text.textContent = displayLabel;
      text.setAttribute("font-size", "18");
      text.setAttribute("font-family", "Google Sans");
      text.setAttribute("fill", "white");
      text.setAttribute("dominant-baseline", "middle");
      text.style.pointerEvents = "none";
      nodeG.appendChild(text);

      if (node.children && node.children.length > 0) {
        const circle = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "circle"
        );
        circle.setAttribute("r", "12");
        circle.setAttribute("fill-opacity", "1");
        circle.setAttribute("transform", `translate(${textWidth}, 0)`);
        circle.setAttribute("fill", getColorForNode(node));
        circle.style.cursor = "pointer";

        const expandText = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text"
        );
        expandText.classList.add("expand-symbol");
        expandText.textContent = expandedNodes.has(node.id) ? "<" : ">";
        expandText.setAttribute("transform", `translate(${textWidth}, 0)`);
        expandText.setAttribute("font-size", "20");
        expandText.setAttribute("text-anchor", "middle");
        expandText.setAttribute("font-family", "Google Sans");
        expandText.setAttribute("fill", "white");
        expandText.setAttribute("dominant-baseline", "middle");
        expandText.style.pointerEvents = "none";

        circle.addEventListener("click", (e) => {
          e.stopPropagation();
          toggleNode(node.id);
        });

        nodeG.appendChild(circle);
        nodeG.appendChild(expandText);
      }

      g.appendChild(nodeG);

      if (expandedNodes.has(node.id) && node.children) {
        node.children.forEach((child) => drawNodes(child));
      }
    }

    drawNodes(root);
    svg.appendChild(g);
  }, [root, expandedNodes, zoom, transform]);

  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.1, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.1, 0.1));
  const handleReset = () => {
    setZoom(0.5);
    setTransform({ x: 40, y: 467 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setTransform({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    setZoom((prev) => Math.max(0.1, Math.min(3, prev + delta)));
  };

  const expandAll = () => {
    if (!data?.nodes) return;
    const allExpanded = new Set(data.nodes.map((n) => n.id));
    data.clusters.forEach((c) =>
      allExpanded.add(`cluster_theme_${c.cluster_id}`)
    );
    setExpandedNodes(allExpanded);
  };

  const collapseAll = () => {
    if (!data?.root_node_id) return;
    setExpandedNodes(new Set([data.root_node_id]));
  };

  if (loading) {
    return (
      <div className="w-full h-96 flex flex-col items-center justify-center text-gray-400 bg-gradient-to-br from-[#0B0E12] via-[#13171D] to-[#1B1F24] rounded-xl shadow-xl">
        <Loader className="animate-spin text-blue-500" size={32} />
        <p className="mt-4 text-lg">Loading Knowledge Graph...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-96 flex items-center justify-center text-red-400 bg-gradient-to-br from-[#0B0E12] via-[#13171D] to-[#1B1F24] rounded-xl p-8 shadow-xl">
        <p className="text-xl font-semibold">🚨 Error: {error}</p>
      </div>
    );
  }

  if (!root || !data) {
    return (
      <div className="w-full h-96 flex items-center justify-center text-gray-400 bg-gradient-to-br from-[#0B0E12] via-[#13171D] to-[#1B1F24] rounded-xl p-8 shadow-xl">
        <p className="text-lg">
          No mind map data available or root node could not be constructed.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#13171D] text-white flex flex-col font-sans rounded-2xl p-6 shadow-2xl border border-gray-700/50">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-4 border-b border-white/10">
        <div className="mb-4 md:mb-0">
          <h2 className="text-3xl font-extrabold text-blue-400">
            Knowledge Map Explorer
          </h2>
          {data.metadata?.topic && (
            <p className="text-base text-gray-400 mt-1 italic font-light">
              Topic: {data.metadata.topic}
            </p>
          )}
        </div>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => setShowStats(!showStats)}
            className="flex items-center gap-1 px-4 py-2 text-sm rounded-xl bg-[#2B2F36] border border-white/10 hover:bg-[#33383F] transition-all duration-200"
          >
            {showStats ? <EyeOff size={16} /> : <Eye size={16} />}
            {showStats ? "Hide Stats" : "Show Stats"}
          </button>
          <button
            onClick={expandAll}
            className="px-4 py-2 text-sm rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold shadow-md shadow-blue-900/40 transition-all duration-200"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="px-4 py-2 text-sm rounded-xl bg-[#2B2F36] border border-white/10 hover:border-gray-500 transition-all duration-200"
          >
            Collapse All
          </button>
        </div>
      </div>
      <div className="py-6">
        {showStats && data.statistics && (
          <StatisticsPanel
            statistics={data.statistics}
            clusters={data.clusters || []}
            metadata={data.metadata || null}
          />
        )}

        <div
          className="bg-[#1E2228] border border-white/10 rounded-2xl p-6 shadow-2xl h-[80vh] relative overflow-hidden"
          onWheel={(e) => {
            handleWheel(e);

            e.stopPropagation();
            e.preventDefault();
          }}
          onMouseEnter={() => {
            document.body.style.overflow = "hidden";
          }}
          onMouseLeave={() => {
            document.body.style.overflow = "auto";
          }}
        >
          <h3 className="text-xl font-bold text-gray-200 mb-4 border-b border-white/10 pb-2">
            Interactive Graph View
          </h3>

          <div className="absolute top-20 right-8 z-10 flex flex-col gap-2">
            <button
              onClick={handleZoomIn}
              className="p-2 bg-[#2B2F36] rounded-lg border border-white/10 hover:bg-[#33383F] transition-all"
              title="Zoom In"
            >
              <ZoomIn size={20} />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-2 bg-[#2B2F36] rounded-lg border border-white/10 hover:bg-[#33383F] transition-all"
              title="Zoom Out"
            >
              <ZoomOut size={20} />
            </button>
            <button
              onClick={handleReset}
              className="p-2 bg-[#2B2F36] rounded-lg border border-white/10 hover:bg-[#33383F] transition-all"
              title="Reset View"
            >
              <Maximize2 size={20} />
            </button>
          </div>

          <svg
            ref={svgRef}
            className="w-full h-full"
            style={{ cursor: isDragging ? "grabbing" : "grab" }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />

          <div className="absolute bottom-4 right-4 bg-[#2B2F36] px-3 py-1 rounded-lg border border-white/10 text-sm">
            Zoom: {(zoom * 100).toFixed(0)}%
          </div>
        </div>
      </div>
    </div>
  );
}
