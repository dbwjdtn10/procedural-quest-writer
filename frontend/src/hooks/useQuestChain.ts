import { useState, useCallback } from 'react';
import type { GeneratedQuest, QuestGenerateRequest } from '../types/quest';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface ChainNode {
  id: string;
  quest: GeneratedQuest;
  parentId: string | null;
  branchLabel?: string;
  children: string[]; // child node IDs
}

export function useQuestChain() {
  const [nodes, setNodes] = useState<Map<string, ChainNode>>(new Map());
  const [selectedQuestId, setSelectedQuestId] = useState<string | null>(null);
  const [isGeneratingChain, setIsGeneratingChain] = useState(false);

  const addQuest = useCallback((quest: GeneratedQuest, parentId: string | null = null, branchLabel?: string) => {
    setNodes(prev => {
      const newMap = new Map(prev);

      // Generate unique ID if this quest_id already exists
      let uniqueId = quest.quest_id;
      if (newMap.has(uniqueId)) {
        uniqueId = `${quest.quest_id}_${Date.now()}`;
        quest = { ...quest, quest_id: uniqueId };
      }

      const node: ChainNode = {
        id: uniqueId,
        quest,
        parentId,
        branchLabel,
        children: [],
      };
      newMap.set(uniqueId, node);

      if (parentId && newMap.has(parentId)) {
        const parent = newMap.get(parentId)!;
        if (!parent.children.includes(uniqueId)) {
          newMap.set(parentId, { ...parent, children: [...parent.children, uniqueId] });
        }
      }

      return newMap;
    });
    setSelectedQuestId(quest.quest_id);
  }, []);

  const continueFromBranch = useCallback(async (
    parentQuest: GeneratedQuest,
    branchChosen: string,
    branchLabel: string,
    context: QuestGenerateRequest
  ) => {
    setIsGeneratingChain(true);
    try {
      const apiKey = sessionStorage.getItem('pqw-api-key');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (apiKey) {
        headers['X-User-API-Key'] = apiKey;
      }
      const response = await fetch(`${API_BASE}/api/quest/continue`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          quest: parentQuest,
          branch_chosen: branchChosen,
          context,
        }),
      });
      if (!response.ok) throw new Error('Chain generation failed');
      const nextQuest: GeneratedQuest = await response.json();
      addQuest(nextQuest, parentQuest.quest_id, branchLabel);
      return nextQuest;
    } catch (err) {
      console.error('Failed to continue chain:', err);
      throw err;
    } finally {
      setIsGeneratingChain(false);
    }
  }, [addQuest]);

  const clearChain = useCallback(() => {
    setNodes(new Map());
    setSelectedQuestId(null);
  }, []);

  const getSelectedQuest = useCallback((): GeneratedQuest | null => {
    if (!selectedQuestId) return null;
    return nodes.get(selectedQuestId)?.quest || null;
  }, [nodes, selectedQuestId]);

  const getRootNodes = useCallback((): ChainNode[] => {
    return Array.from(nodes.values()).filter(n => n.parentId === null);
  }, [nodes]);

  const getChildren = useCallback((nodeId: string): ChainNode[] => {
    const node = nodes.get(nodeId);
    if (!node) return [];
    return node.children.map(id => nodes.get(id)!).filter(Boolean);
  }, [nodes]);

  return {
    nodes,
    selectedQuestId,
    isGeneratingChain,
    addQuest,
    continueFromBranch,
    clearChain,
    setSelectedQuestId,
    getSelectedQuest,
    getRootNodes,
    getChildren,
  };
}
