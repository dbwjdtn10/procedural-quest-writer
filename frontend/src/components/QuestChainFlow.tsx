import { useMemo } from 'react';
import type { FC } from 'react';
import ReactFlow, { Background, Controls, Position } from 'reactflow';
import type { Node, Edge, NodeProps } from 'reactflow';
import 'reactflow/dist/style.css';
import { Link } from 'lucide-react';
import type { ChainNode } from '../hooks/useQuestChain';
import type { GeneratedQuest } from '../types/quest';
import { useI18n } from '../i18n/I18nContext';

interface QuestChainFlowProps {
  nodes: Map<string, ChainNode>;
  selectedQuestId: string | null;
  onNodeClick: (questId: string) => void;
  onExploreUnexplored?: (quest: GeneratedQuest, branchCondition: string, branchLabel: string) => void;
}

const typeColors: Record<string, string> = {
  main: '#d4af37',
  side: '#3b82f6',
  daily: '#10b981',
  hidden: '#8b5cf6',
};

interface QuestNodeData {
  label: string;
  questType: string;
  selected: boolean;
  branchLabel?: string;
}

interface UnexploredNodeData {
  label: string;
  questId: string;
  branchCondition: string;
  clickToExplore: string;
}

// Custom node component for quests
function QuestNodeComponent({ data }: NodeProps<QuestNodeData>) {
  return (
    <div style={{
      padding: '10px 16px',
      borderRadius: '8px',
      background: data.selected ? '#1a1a2e' : '#12121a',
      border: `2px solid ${data.selected ? '#d4af37' : (typeColors[data.questType] || '#2a2a40')}`,
      color: '#e8e6e3',
      minWidth: '150px',
      textAlign: 'center',
      boxShadow: data.selected ? '0 0 15px rgba(212, 175, 55, 0.3)' : '0 2px 8px rgba(0,0,0,0.3)',
      cursor: 'pointer',
    }}>
      {data.branchLabel && (
        <div style={{ fontSize: '0.7rem', color: '#8b5cf6', marginBottom: '4px' }}>{data.branchLabel}</div>
      )}
      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{data.label}</div>
      <div style={{ fontSize: '0.7rem', color: '#9994a8', marginTop: '2px' }}>{data.questType}</div>
    </div>
  );
}

// Unexplored branch node
function UnexploredNodeComponent({ data }: NodeProps<UnexploredNodeData>) {
  return (
    <div style={{
      padding: '10px 16px',
      borderRadius: '8px',
      background: 'transparent',
      border: '2px dashed #6b6580',
      color: '#6b6580',
      minWidth: '120px',
      textAlign: 'center',
      cursor: 'pointer',
      fontStyle: 'italic',
    }}>
      <div style={{ fontSize: '0.8rem' }}>{data.label}</div>
      <div style={{ fontSize: '0.7rem', marginTop: '2px' }}>{data.clickToExplore}</div>
    </div>
  );
}

const nodeTypes = {
  quest: QuestNodeComponent,
  unexplored: UnexploredNodeComponent,
};

export const QuestChainFlow: FC<QuestChainFlowProps> = ({
  nodes: chainNodes,
  selectedQuestId,
  onNodeClick,
  onExploreUnexplored,
}) => {
  const { t } = useI18n();

  const { flowNodes, flowEdges } = useMemo(() => {
    const fNodes: Node[] = [];
    const fEdges: Edge[] = [];

    if (chainNodes.size === 0) return { flowNodes: fNodes, flowEdges: fEdges };

    // Layout: simple tree layout
    const levelMap = new Map<string, number>();
    const posMap = new Map<string, { x: number; y: number }>();

    // BFS to assign levels
    const roots = Array.from(chainNodes.values()).filter(n => n.parentId === null);
    const queue: { id: string; level: number }[] = roots.map(r => ({ id: r.id, level: 0 }));
    const levelCounts = new Map<number, number>();

    while (queue.length > 0) {
      const { id, level } = queue.shift()!;
      if (levelMap.has(id)) continue;
      levelMap.set(id, level);

      const count = levelCounts.get(level) || 0;
      levelCounts.set(level, count + 1);
      posMap.set(id, { x: count * 250, y: level * 150 });

      const node = chainNodes.get(id);
      if (node) {
        for (const childId of node.children) {
          queue.push({ id: childId, level: level + 1 });
        }
      }
    }

    // Create flow nodes
    for (const [id, chainNode] of chainNodes) {
      const pos = posMap.get(id) || { x: 0, y: 0 };
      fNodes.push({
        id,
        type: 'quest',
        position: pos,
        data: {
          label: chainNode.quest.title,
          questType: chainNode.quest.type,
          selected: id === selectedQuestId,
          branchLabel: chainNode.branchLabel,
        } satisfies QuestNodeData,
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
      });

      // Edges from parent
      if (chainNode.parentId) {
        fEdges.push({
          id: `${chainNode.parentId}-${id}`,
          source: chainNode.parentId,
          target: id,
          style: { stroke: '#d4af37', strokeWidth: 2 },
          animated: true,
          label: chainNode.branchLabel || '',
          labelStyle: { fill: '#8b5cf6', fontSize: 11 },
        });
      }

      // Add unexplored branch nodes
      if (chainNode.quest.branches) {
        for (const branch of chainNode.quest.branches) {
          const isExplored = chainNode.children.some(cid => {
            const child = chainNodes.get(cid);
            return child?.branchLabel === branch.label;
          });

          if (!isExplored) {
            const unexploredId = `unexplored_${id}_${branch.condition}`;
            const level = (levelMap.get(id) || 0) + 1;
            const count = levelCounts.get(level) || 0;
            levelCounts.set(level, count + 1);

            fNodes.push({
              id: unexploredId,
              type: 'unexplored',
              position: { x: count * 250, y: level * 150 },
              data: {
                label: branch.label,
                questId: id,
                branchCondition: branch.condition,
                clickToExplore: t.clickToExplore,
              } satisfies UnexploredNodeData,
              sourcePosition: Position.Bottom,
              targetPosition: Position.Top,
            });

            fEdges.push({
              id: `${id}-${unexploredId}`,
              source: id,
              target: unexploredId,
              style: { stroke: '#6b6580', strokeWidth: 1, strokeDasharray: '5,5' },
              label: branch.label,
              labelStyle: { fill: '#6b6580', fontSize: 10 },
            });
          }
        }
      }
    }

    return { flowNodes: fNodes, flowEdges: fEdges };
  }, [chainNodes, selectedQuestId, t.clickToExplore]);

  if (chainNodes.size === 0) return null;

  return (
    <div className="quest-chain-flow" style={{ height: '350px' }} aria-label="Quest chain visualization">
      <h3 className="section-title" style={{ padding: '0.75rem 1rem 0' }}><Link size={18} className="inline-block" style={{ marginRight: 6, verticalAlign: 'middle' }} />{t.questChain}</h3>
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        nodeTypes={nodeTypes}
        onNodeClick={(_, node) => {
          if (node.type === 'unexplored' && onExploreUnexplored) {
            const data = node.data as UnexploredNodeData;
            const parentNode = chainNodes.get(data.questId);
            if (parentNode) {
              onExploreUnexplored(parentNode.quest, data.branchCondition, data.label);
            }
          } else {
            onNodeClick(node.id);
          }
        }}
        fitView
        proOptions={{ hideAttribution: true }}
        style={{ background: '#0a0a0f' }}
      >
        <Background color="#2a2a40" gap={20} />
        <Controls
          style={{ background: '#12121a', border: '1px solid #2a2a40', borderRadius: '8px' }}
        />
      </ReactFlow>
    </div>
  );
};
