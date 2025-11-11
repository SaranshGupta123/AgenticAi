import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  ChevronRight,
  ChevronDown,
  Network,
  Info,
  Loader,
  Eye,
  EyeOff,
} from "lucide-react";
import { generateMindmap } from "../api/api";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

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

function TreeNodeView({
  node,
  expanded,
  toggle,
  clusters,
}: {
  node: MindmapNode;
  expanded: Record<string, boolean>;
  toggle: (id: string) => void;
  clusters: MindmapCluster[];
}) {
  const isExpanded = expanded[node.id] ?? true;
  const hasChildren = node.children && node.children.length > 0;

  const nodeCluster = clusters.find((c) => c.node_ids?.includes(node.id));

  const getNodeStyle = () => {
    const baseStyle =
      "px-4 py-3 rounded-2xl text-sm transition-all duration-200 flex items-center gap-2 min-w-[250px] max-w-[450px] border-b-2 hover:opacity-90 transform hover:scale-[1.01] cursor-pointer";

    if (node.isClusterTheme) {
      return (
        baseStyle +
        "bg-blue-800 text-white font-extrabold shadow-2xl shadow-blue-900/60 border-blue-400/80 transform hover:scale-[1.02]"
      );
    }

    switch (node.node_type) {
      case "root":
        return (
          baseStyle +
          "bg-gradient-to-r from-red-600 to-red-800 text-white font-black shadow-xl border-red-400/80 transform hover:scale-[1.03]"
        );
      case "concept":
        return (
          baseStyle +
          "bg-[#33383F] text-gray-200 font-semibold border border-white/20 shadow-lg hover:border-teal-400/80"
        );
      case "example":
        return (
          baseStyle +
          "bg-[#252A33] text-gray-300 font-medium border border-white/10 shadow-md hover:border-purple-400/80"
        );
      case "insight":
        return (
          baseStyle +
          "bg-[#33383F] text-gray-200 font-medium border border-white/20 shadow-lg hover:border-orange-400/80"
        );
      case "detail":
        return (
          baseStyle +
          "bg-[#1A1D22] text-gray-400 font-normal border border-white/5 shadow-sm hover:border-gray-500/80"
        );
      default:
        return (
          baseStyle +
          "bg-[#2B2F36] text-gray-200 border border-white/20 hover:border-blue-400/80 shadow-md"
        );
    }
  };

  const clusterColor = nodeCluster?.color || "#FFFFFF";

  return (
    <div className="flex items-start gap-3 my-2">
      <div className="flex-shrink-0 relative">
        <button
          onClick={() => hasChildren && toggle(node.id)}
          className={getNodeStyle()}
        >
          {hasChildren && (
            <span className="flex-shrink-0 transform transition-transform duration-200 text-white">
              {isExpanded ? (
                <ChevronDown size={18} />
              ) : (
                <ChevronRight size={18} />
              )}
            </span>
          )}
          <span className="flex-1 text-left line-clamp-2">{node.label}</span>

          {node.importance && (
            <span className="px-2 py-0.5 bg-black/30 rounded-full text-xs font-extrabold text-yellow-300 border border-yellow-300/30">
              {node.importance}
            </span>
          )}
        </button>

        <div className="mt-2 flex flex-col gap-1 pl-2">
          <div className="flex flex-wrap gap-1.5">
            {node.node_type && (
              <span className="px-2 py-0.5 bg-white/10 rounded-full text-[10px] text-gray-300 font-medium">
                {node.node_type.toUpperCase()}
              </span>
            )}
            {!node.isClusterTheme && nodeCluster && (
              <div
                className="px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1 border border-white/20"
                style={{
                  backgroundColor: clusterColor + "22",
                  color: clusterColor,
                }}
              >
                <Network size={10} strokeWidth={3} />
                {nodeCluster.theme}
              </div>
            )}
          </div>

          {node.keywords && node.keywords.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {node.keywords.slice(0, 3).map((kw, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded-full text-[9px] font-mono"
                >
                  #{kw}
                </span>
              ))}
            </div>
          )}

          {node.description && (
            <p className="mt-1 text-[11px] text-gray-400 italic max-w-[450px] leading-snug p-2 bg-[#1A1D22] rounded-lg border border-white/10">
              {node.description}
            </p>
          )}
        </div>
      </div>

      {isExpanded && hasChildren && (
        // Enhanced connection line for better visual flow
        <div className="flex-1 border-l-4 border-blue-600/50 ml-6 pl-6">
          {node.children.map((child) => (
            <TreeNodeView
              key={child.id}
              node={child}
              expanded={expanded}
              toggle={toggle}
              clusters={clusters}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function MindmapNotebookLM() {
  const [data, setData] = useState<MindmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [showStats, setShowStats] = useState(true);

  useEffect(() => {
    generateMindmap("Food Systems: Carbon Footprint, Resilience, and Policy.")
      .then((fetchedData: any) => {
        setData(fetchedData as MindmapData);
        setLoading(false);
        setError(null);
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
    if (data?.nodes) {
      const allExpanded: Record<string, boolean> = {};
      data.nodes.forEach((n) => (allExpanded[n.id] = true));
      data.clusters.forEach(
        (c) => (allExpanded[`cluster_theme_${c.cluster_id}`] = true)
      );
      setExpanded(allExpanded);
    }
  }, [data]);

  const toggle = useCallback((id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const expandAll = () => {
    if (!data?.nodes) return;
    const allExpanded: Record<string, boolean> = {};
    data.nodes.forEach((n) => (allExpanded[n.id] = true));
    data.clusters.forEach(
      (c) => (allExpanded[`cluster_theme_${c.cluster_id}`] = true)
    );
    setExpanded(allExpanded);
  };

  const collapseAll = () => {
    if (!data?.root_node_id) return;
    setExpanded({ [data.root_node_id]: true });
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

        {/* Tree Visualization */}
        <div className="bg-[#1E2228] border border-white/10 rounded-2xl p-6 shadow-2xl h-[80vh] relative overflow-hidden">
          <h3 className="text-xl font-bold text-gray-200 mb-4 border-b border-white/10 pb-2">
            Interactive Graph View
          </h3>

          <TransformWrapper
            initialScale={1}
            minScale={0.3}
            maxScale={3}
            centerOnInit={true}
            wheel={{ step: 0.1 }}
            pinch={{ step: 0.1 }}
            doubleClick={{ disabled: true }}
            panning={{
              disabled: false,
              velocityDisabled: true,
            }}
            limitToBounds={false}
            wrapperClass="cursor-grab active:cursor-grabbing"
            contentClass="cursor-grab active:cursor-grabbing"
          >
            <TransformComponent>
              <div className="p-4 min-w-max select-none">
                <TreeNodeView
                  node={root}
                  expanded={expanded}
                  toggle={toggle}
                  clusters={data.clusters || []}
                />
              </div>
            </TransformComponent>
          </TransformWrapper>
        </div>
      </div>
    </div>
  );
}
