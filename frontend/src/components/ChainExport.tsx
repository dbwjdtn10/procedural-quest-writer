import type { FC } from 'react';
import { Clipboard, Download } from 'lucide-react';
import type { ChainNode } from '../hooks/useQuestChain';
import { useToast } from './Toast';
import { useI18n } from '../i18n/I18nContext';

interface ChainExportProps {
  nodes: Map<string, ChainNode>;
}

export const ChainExport: FC<ChainExportProps> = ({ nodes }) => {
  const { showToast } = useToast();
  const { t } = useI18n();

  if (nodes.size === 0) return null;

  const exportData = {
    chain: Array.from(nodes.values()).map(n => ({
      ...n.quest,
      _chain_meta: {
        parentId: n.parentId,
        branchLabel: n.branchLabel,
      },
    })),
    exported_at: new Date().toISOString(),
    total_quests: nodes.size,
  };

  const handleCopy = () => {
    try {
      navigator.clipboard.writeText(JSON.stringify(exportData, null, 2));
      showToast(t.chainCopied);
    } catch {
      showToast(t.clipboardFailed, 'error');
    }
  };

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quest_chain_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(t.chainDownloaded);
  };

  return (
    <div className="chain-export" role="group" aria-label={t.chainExportLabel}>
      <button className="chain-export-btn" onClick={handleCopy} aria-label={t.chainCopyAriaLabel}>
        <Clipboard size={16} className="inline-block" style={{ marginRight: 4, verticalAlign: 'middle' }} /> {t.chainCopy}
      </button>
      <button className="chain-export-btn" onClick={handleDownload} aria-label={`${t.chainDownloadAriaLabel} ${nodes.size}`}>
        <Download size={16} className="inline-block" style={{ marginRight: 4, verticalAlign: 'middle' }} /> {t.chainDownload} ({nodes.size})
      </button>
    </div>
  );
};
