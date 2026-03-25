import type { GeneratedQuest } from '../types/quest';

const CARD_WIDTH = 800;
const CARD_HEIGHT = 1000;

const typeLabels: Record<string, string> = {
  main: '메인 퀘스트',
  side: '사이드 퀘스트',
  daily: '일일 퀘스트',
  hidden: '히든 퀘스트',
};

const difficultyLabels: Record<string, string> = {
  easy: '쉬움',
  normal: '보통',
  hard: '어려움',
  legendary: '전설',
};

const difficultyColors: Record<string, string> = {
  easy: '#10B981',
  normal: '#3B82F6',
  hard: '#F59E0B',
  legendary: '#EF4444',
};

const objectiveIcons: Record<string, string> = {
  kill: '\u2694\uFE0F', fetch: '\uD83D\uDCE6', talk: '\uD83D\uDCAC', explore: '\uD83D\uDDFA\uFE0F',
  escort: '\uD83D\uDEE1\uFE0F', craft: '\uD83D\uDD28', investigate: '\uD83D\uDD0D',
};

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let currentLine = '';

  for (const char of text) {
    const testLine = currentLine + char;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine.length > 0) {
      lines.push(currentLine);
      currentLine = char;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

export async function generateQuestImage(quest: GeneratedQuest, npcName?: string): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = CARD_WIDTH;
  canvas.height = CARD_HEIGHT;
  const ctx = canvas.getContext('2d')!;

  // Background
  const gradient = ctx.createLinearGradient(0, 0, 0, CARD_HEIGHT);
  gradient.addColorStop(0, '#12121a');
  gradient.addColorStop(1, '#0a0a0f');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  // Gold border
  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 3;
  ctx.strokeRect(15, 15, CARD_WIDTH - 30, CARD_HEIGHT - 30);

  // Inner decorative border
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.3)';
  ctx.lineWidth = 1;
  ctx.strokeRect(25, 25, CARD_WIDTH - 50, CARD_HEIGHT - 50);

  let y = 60;
  const leftMargin = 50;
  const contentWidth = CARD_WIDTH - 100;

  // Quest type badge + difficulty
  ctx.font = '16px "Noto Sans KR", sans-serif';
  ctx.fillStyle = '#9994a8';
  ctx.fillText(`\uD83D\uDCDC ${typeLabels[quest.type] || quest.type}`, leftMargin, y);

  const diffColor = difficultyColors[quest.difficulty] || '#3B82F6';
  ctx.fillStyle = diffColor;
  const diffText = difficultyLabels[quest.difficulty] || quest.difficulty;
  ctx.fillText(diffText, leftMargin + 200, y);

  ctx.fillStyle = '#6b6580';
  ctx.fillText(`\u23F1 ${quest.estimated_time}`, leftMargin + 320, y);

  y += 40;

  // Title
  ctx.font = 'bold 28px "Noto Sans KR", sans-serif';
  ctx.fillStyle = '#d4af37';
  const titleLines = wrapText(ctx, quest.title, contentWidth);
  for (const line of titleLines) {
    ctx.fillText(line, leftMargin, y);
    y += 36;
  }

  y += 10;

  // Description
  ctx.font = '15px "Noto Sans KR", sans-serif';
  ctx.fillStyle = '#9994a8';
  const descLines = wrapText(ctx, quest.description, contentWidth);
  for (const line of descLines.slice(0, 3)) {
    ctx.fillText(line, leftMargin, y);
    y += 22;
  }

  y += 20;

  // Divider
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.3)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(leftMargin, y);
  ctx.lineTo(CARD_WIDTH - leftMargin, y);
  ctx.stroke();

  y += 25;

  // NPC Dialogue
  if (npcName) {
    ctx.font = 'bold 16px "Noto Sans KR", sans-serif';
    ctx.fillStyle = '#d4af37';
    ctx.fillText(`\uD83D\uDCAC ${npcName}`, leftMargin, y);
    y += 25;

    ctx.font = 'italic 14px "Noto Sans KR", sans-serif';
    ctx.fillStyle = '#e8e6e3';
    const dialogueLines = wrapText(ctx, `"${quest.dialogue.on_offer}"`, contentWidth - 20);
    for (const line of dialogueLines.slice(0, 3)) {
      ctx.fillText(line, leftMargin + 15, y);
      y += 20;
    }
    y += 15;
  }

  // Objectives
  ctx.font = 'bold 16px "Noto Sans KR", sans-serif';
  ctx.fillStyle = '#d4af37';
  ctx.fillText('\uD83D\uDCCB 목표', leftMargin, y);
  y += 25;

  ctx.font = '14px "Noto Sans KR", sans-serif';
  ctx.fillStyle = '#e8e6e3';
  for (const obj of quest.objectives.slice(0, 4)) {
    const icon = objectiveIcons[obj.type] || '\u2753';
    const countStr = obj.count > 1 ? ` \u00D7${obj.count}` : '';
    const locStr = obj.location ? ` (${obj.location})` : '';
    ctx.fillText(`  \u2610 ${icon} ${obj.target}${countStr}${locStr}`, leftMargin, y);
    y += 22;
  }

  y += 15;

  // Branches
  if (quest.branches && quest.branches.length > 0) {
    ctx.font = 'bold 16px "Noto Sans KR", sans-serif';
    ctx.fillStyle = '#d4af37';
    ctx.fillText('\uD83D\uDD00 분기', leftMargin, y);
    y += 25;

    ctx.font = '14px "Noto Sans KR", sans-serif';
    for (const branch of quest.branches) {
      ctx.fillStyle = '#8b5cf6';
      ctx.fillText(`  \u2192 ${branch.label}`, leftMargin, y);
      y += 18;
      ctx.fillStyle = '#6b6580';
      ctx.font = '12px "Noto Sans KR", sans-serif';
      ctx.fillText(`     ${branch.consequence}`, leftMargin, y);
      y += 20;
      ctx.font = '14px "Noto Sans KR", sans-serif';
    }
    y += 10;
  }

  // Rewards
  ctx.font = 'bold 16px "Noto Sans KR", sans-serif';
  ctx.fillStyle = '#d4af37';
  ctx.fillText('\uD83C\uDFC6 보상', leftMargin, y);
  y += 25;

  ctx.font = '14px "Noto Sans KR", sans-serif';
  ctx.fillStyle = '#e8e6e3';
  const rewardParts = [
    `\uD83D\uDCB0 ${quest.rewards.gold} 골드`,
    `\u2728 ${quest.rewards.exp} EXP`,
    ...quest.rewards.items.map(i => `\uD83C\uDF81 ${i}`),
  ];
  if (quest.rewards.affinity_change !== 0) {
    rewardParts.push(`${quest.rewards.affinity_change > 0 ? '\u2764\uFE0F' : '\uD83D\uDC94'} 호감도 ${quest.rewards.affinity_change > 0 ? '+' : ''}${quest.rewards.affinity_change}`);
  }
  ctx.fillText(`  ${rewardParts.join('  \u00B7  ')}`, leftMargin, y);
  y += 30;

  // Footer
  y = CARD_HEIGHT - 50;
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.3)';
  ctx.beginPath();
  ctx.moveTo(leftMargin, y - 15);
  ctx.lineTo(CARD_WIDTH - leftMargin, y - 15);
  ctx.stroke();

  ctx.font = '12px "Noto Sans KR", sans-serif';
  ctx.fillStyle = '#6b6580';
  ctx.fillText('\uD83D\uDCDC Procedural Quest Writer \u2014 AI Quest Generation Demo', leftMargin, y + 5);

  // Convert to blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to create image'));
    }, 'image/png');
  });
}
