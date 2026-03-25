import { useState } from 'react';
import type { FC } from 'react';
import { Share2, Clipboard, Download, Link, Image } from 'lucide-react';
import type { GeneratedQuest } from '../types/quest';
import { generateQuestImage } from '../utils/questImageExport';
import { useI18n } from '../i18n/I18nContext';
import { useToast } from './Toast';

interface ShareExportProps {
  quest: GeneratedQuest;
  npcName?: string;
}

export const ShareExport: FC<ShareExportProps> = ({ quest, npcName }) => {
  const { t } = useI18n();
  const { showToast } = useToast();
  const [exportingImage, setExportingImage] = useState(false);

  const handleCopyJson = () => {
    try {
      navigator.clipboard.writeText(JSON.stringify(quest, null, 2));
      showToast(t.copied);
    } catch {
      showToast('Failed to copy to clipboard', 'error');
    }
  };

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(quest, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quest_${quest.quest_id}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('JSON downloaded!');
  };

  const handleCopyLink = () => {
    try {
      const data = btoa(encodeURIComponent(JSON.stringify(quest)));
      const url = `${window.location.origin}?quest=${data}`;
      if (url.length > 2000) {
        showToast('Quest data is too large for a URL link. Use JSON copy instead.', 'info');
        return;
      }
      navigator.clipboard.writeText(url);
      showToast(t.copied);
    } catch {
      showToast('Failed to create share link', 'error');
    }
  };

  const handleExportImage = async () => {
    setExportingImage(true);
    try {
      const blob = await generateQuestImage(quest, npcName);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quest_${quest.quest_id}.png`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Image saved!');
    } catch (err) {
      console.error('Image export failed:', err);
      showToast('Image export failed', 'error');
    } finally {
      setExportingImage(false);
    }
  };

  return (
    <div className="share-export" role="group" aria-label={t.shareExport}>
      <h3 className="section-title"><Share2 size={18} className="inline-block" style={{ marginRight: 6, verticalAlign: 'middle' }} />{t.shareExport}</h3>
      <div className="share-buttons">
        <button className="share-btn" onClick={handleCopyJson} aria-label="Copy quest JSON to clipboard">
          <Clipboard size={16} className="inline-block" style={{ marginRight: 4, verticalAlign: 'middle' }} />{t.copyJson}
        </button>
        <button className="share-btn" onClick={handleDownload} aria-label="Download quest as JSON file">
          <Download size={16} className="inline-block" style={{ marginRight: 4, verticalAlign: 'middle' }} />{t.downloadJson}
        </button>
        <button className="share-btn" onClick={handleCopyLink} aria-label="Copy shareable link to clipboard">
          <Link size={16} className="inline-block" style={{ marginRight: 4, verticalAlign: 'middle' }} />{t.copyLink}
        </button>
        <button className="share-btn" onClick={handleExportImage} disabled={exportingImage} aria-label="Save quest as image">
          <Image size={16} className="inline-block" style={{ marginRight: 4, verticalAlign: 'middle' }} />{exportingImage ? t.generating : t.saveImage}
        </button>
      </div>
    </div>
  );
};
