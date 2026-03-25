import { useCallback, useRef, useEffect, useState, useMemo } from 'react';
import { SettingsPanel } from './components/SettingsPanel';
import { QuestViewer } from './components/QuestViewer';
import { QuestChainFlow } from './components/QuestChainFlow';
import { QuestHistory } from './components/QuestHistory';
import { OnboardingTour } from './components/OnboardingTour';
import { LanguageToggle } from './components/LanguageToggle';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SoundToggle } from './components/SoundToggle';
import { PerformanceStats } from './components/PerformanceStats';
import { QuestCompare } from './components/QuestCompare';
import { ApiKeyInput } from './components/ApiKeyInput';
import { ThemeToggle } from './components/ThemeToggle';
import { ChainExport } from './components/ChainExport';
import { ToastProvider, useToast } from './components/Toast';
import { useQuestGeneration } from './hooks/useQuestGeneration';
import { useQuestChain } from './hooks/useQuestChain';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { I18nProvider, useI18n } from './i18n/I18nContext';
import { soundManager } from './utils/soundManager';
import type { QuestGenerateRequest, GeneratedQuest } from './types/quest';
import './styles/rpg-theme.css';

function AppContent() {
  const { t } = useI18n();
  const { showToast } = useToast();
  const { quest, isGenerating, streamingText, error, generationTimeMs, generateQuest, setQuest } = useQuestGeneration();
  const {
    nodes: chainNodes,
    selectedQuestId,
    isGeneratingChain,
    addQuest,
    continueFromBranch,
    clearChain,
    setSelectedQuestId,
    getSelectedQuest,
  } = useQuestChain();

  const lastRequestRef = useRef<QuestGenerateRequest | null>(null);
  const questContentRef = useRef<HTMLElement>(null);
  const [exploringBranch, setExploringBranch] = useState<string | null>(null);
  const [previousQuest, setPreviousQuest] = useState<GeneratedQuest | null>(null);
  const [showCompare, setShowCompare] = useState(false);
  // ApiKeyInput manages sessionStorage directly; no state needed here
  const handleApiKeyChange = useCallback((_key: string | null) => { /* stored in sessionStorage */ }, []);

  // Track all quests generated in this session
  const allQuests = useMemo(() => {
    return Array.from(chainNodes.values()).map(n => n.quest);
  }, [chainNodes]);

  // Get the currently selected quest from chain, or fall back to latest generated
  const displayedQuest = useMemo(() => {
    const selected = getSelectedQuest();
    return selected || quest;
  }, [getSelectedQuest, quest]);

  // Get explored branch labels for the currently displayed quest
  const exploredBranches = useMemo(() => {
    if (!displayedQuest) return new Set<string>();
    const node = chainNodes.get(displayedQuest.quest_id);
    if (!node) return new Set<string>();
    const labels = new Set<string>();
    for (const childId of node.children) {
      const child = chainNodes.get(childId);
      if (child?.branchLabel) {
        labels.add(child.branchLabel);
      }
    }
    return labels;
  }, [displayedQuest, chainNodes]);

  // Play sound when generation starts
  const prevIsGeneratingRef = useRef(false);
  useEffect(() => {
    if (isGenerating && !prevIsGeneratingRef.current) {
      soundManager.playGenerateStart();
    }
    prevIsGeneratingRef.current = isGenerating;
  }, [isGenerating]);

  // Play sound and show toast when quest generation completes
  const prevQuestRef = useRef<GeneratedQuest | null>(null);
  useEffect(() => {
    if (quest && quest !== prevQuestRef.current) {
      soundManager.playGenerateComplete();
      showToast(t.questGeneratedToast);
    }
    prevQuestRef.current = quest;
  }, [quest, showToast]);

  // Play error sound and show toast
  const prevErrorRef = useRef<string | null>(null);
  useEffect(() => {
    if (error && error !== prevErrorRef.current) {
      soundManager.playError();
      showToast(error, 'error');
    }
    prevErrorRef.current = error;
  }, [error, showToast]);

  const handleGenerate = useCallback((request: QuestGenerateRequest) => {
    lastRequestRef.current = request;
    // Save the current quest as previous before generating a new one
    if (quest) {
      setPreviousQuest(quest);
    }
    clearChain();
    generateQuest(request);
    // Scroll to quest content area so user can see the result
    setTimeout(() => {
      questContentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }, [generateQuest, clearChain, quest]);

  // Add quest to chain when generation completes
  const lastAddedQuestRef = useRef<string | null>(null);
  useEffect(() => {
    if (quest && quest.quest_id !== lastAddedQuestRef.current) {
      addQuest(quest);
      lastAddedQuestRef.current = quest.quest_id;
    }
  }, [quest, addQuest]);

  const handleRegenerate = useCallback(() => {
    if (lastRequestRef.current) {
      // Save the current quest as previous
      if (quest) {
        setPreviousQuest(quest);
      }
      clearChain();
      setQuest(null);
      generateQuest(lastRequestRef.current);
    }
  }, [generateQuest, clearChain, setQuest, quest]);

  const handleBranchSelect = useCallback(async (branch: { condition: string; next_quest_seed: string; label: string }) => {
    if (!displayedQuest || !lastRequestRef.current) return;
    soundManager.playBranchSelect();
    setExploringBranch(branch.condition);
    try {
      await continueFromBranch(
        displayedQuest,
        branch.condition,
        branch.label,
        lastRequestRef.current,
      );
    } catch {
      // Error already logged in hook
    } finally {
      setExploringBranch(null);
    }
  }, [displayedQuest, continueFromBranch]);

  const handleChainNodeClick = useCallback((questId: string) => {
    setSelectedQuestId(questId);
  }, [setSelectedQuestId]);

  const handleExploreUnexplored = useCallback(async (
    parentQuest: GeneratedQuest,
    branchCondition: string,
    branchLabel: string,
  ) => {
    if (!lastRequestRef.current) return;
    setExploringBranch(branchCondition);
    setSelectedQuestId(parentQuest.quest_id);
    try {
      await continueFromBranch(
        parentQuest,
        branchCondition,
        branchLabel,
        lastRequestRef.current,
      );
    } catch {
      // Error already logged in hook
    } finally {
      setExploringBranch(null);
    }
  }, [continueFromBranch, setSelectedQuestId]);

  const handleHistorySelect = useCallback((selectedQuest: GeneratedQuest) => {
    setSelectedQuestId(selectedQuest.quest_id);
  }, [setSelectedQuestId]);

  const handleCompare = useCallback(() => {
    setShowCompare(true);
  }, []);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onRegenerate: handleRegenerate,
  });

  return (
    <div className="app">
      <OnboardingTour />
      <header className="app-header">
        <h1>{t.appTitle}</h1>
        <p className="app-subtitle">{t.appSubtitle}</p>
        <div className="header-actions">
          <ThemeToggle />
          <SoundToggle />
          <LanguageToggle />
        </div>
      </header>

      <main className="app-main">
        <aside className="app-sidebar">
          <div style={{ padding: '1.25rem 1.25rem 0' }}>
            <ApiKeyInput onKeyChange={handleApiKeyChange} />
          </div>
          <SettingsPanel onGenerate={handleGenerate} isGenerating={isGenerating} />
          <QuestHistory
            quests={allQuests}
            selectedId={selectedQuestId}
            onSelect={handleHistorySelect}
          />
        </aside>

        <section className="app-content" ref={questContentRef}>
          {error && (
            <div className="error-banner" role="alert">
              <span>{t.warningLabel}: {error}</span>
            </div>
          )}
          <QuestViewer
            quest={displayedQuest}
            streamingText={streamingText}
            isGenerating={isGenerating}
            npcName={lastRequestRef.current?.npc.name || 'NPC'}
            onRegenerate={handleRegenerate}
            onBranchSelect={handleBranchSelect}
            isGeneratingChain={isGeneratingChain}
            exploringBranch={exploringBranch}
            exploredBranches={exploredBranches}
            previousQuest={previousQuest}
            onCompare={handleCompare}
          />
          <QuestChainFlow
            nodes={chainNodes}
            selectedQuestId={selectedQuestId}
            onNodeClick={handleChainNodeClick}
            onExploreUnexplored={handleExploreUnexplored}
          />
          <ChainExport nodes={chainNodes} />
        </section>
      </main>

      <PerformanceStats generationTimeMs={generationTimeMs} />

      <footer className="app-footer">
        <p>{t.footerText}</p>
      </footer>

      {showCompare && previousQuest && displayedQuest && (
        <QuestCompare
          questA={previousQuest}
          questB={displayedQuest}
          onClose={() => setShowCompare(false)}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <I18nProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </I18nProvider>
    </ErrorBoundary>
  );
}

export default App;
