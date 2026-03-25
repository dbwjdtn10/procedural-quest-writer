import { describe, it, expect } from 'vitest';
import type { GeneratedQuest, QuestObjective, QuestReward } from '../types/quest';

describe('Quest Types', () => {
  it('should accept valid quest objective types', () => {
    const validTypes = ['kill', 'fetch', 'talk', 'explore', 'escort', 'craft', 'investigate'];
    validTypes.forEach(type => {
      const obj: QuestObjective = { type: type as any, target: 'test', count: 1 };
      expect(obj.type).toBe(type);
    });
  });

  it('should have correct quest reward structure', () => {
    const reward: QuestReward = {
      gold: 100,
      exp: 50,
      items: ['sword', 'shield'],
      affinity_change: 5,
    };
    expect(reward.gold).toBe(100);
    expect(reward.items).toHaveLength(2);
  });

  it('should construct valid GeneratedQuest', () => {
    const quest: GeneratedQuest = {
      quest_id: 'test_001',
      title: 'Test Quest',
      description: 'A test quest',
      type: 'main',
      difficulty: 'normal',
      estimated_time: '30min',
      prerequisites: [],
      objectives: [{ type: 'kill', target: 'enemy', count: 3 }],
      rewards: { gold: 100, exp: 50, items: [], affinity_change: 0 },
      dialogue: {
        on_offer: 'Hello',
        on_accept: 'Thanks',
        on_progress: 'Keep going',
        on_complete: 'Done!',
      },
      lore_connection: 'Connected to lore',
      design_notes: 'Test notes',
    };
    expect(quest.quest_id).toBe('test_001');
    expect(quest.type).toBe('main');
    expect(quest.objectives).toHaveLength(1);
  });
});
