export type Locale = 'ko' | 'en';

export interface Translations {
  // Header
  appTitle: string;
  appSubtitle: string;

  // Settings Panel
  questSettings: string;
  quickStart: string;
  npcSettings: string;
  npcName: string;
  npcNamePlaceholder: string;
  personality: string;
  selectPlaceholder: string;
  customInput: string;
  occupation: string;
  worldSettings: string;
  genre: string;
  seasonSituation: string;
  seasonPlaceholder: string;
  specialNotes: string;
  specialNotesPlaceholder: string;
  gameState: string;
  playerLevel: string;
  npcAffinity: string;
  affinityLow: string;
  affinityNormal: string;
  affinityHigh: string;
  affinityMax: string;
  questType: string;
  questTypeMain: string;
  questTypeSide: string;
  questTypeDaily: string;
  questTypeHidden: string;
  generateQuest: string;
  generating: string;

  // Personalities
  cheerful: string;
  taciturn: string;
  mysterious: string;
  rough: string;
  gentle: string;
  cunning: string;
  brave: string;

  // Occupations
  merchant: string;
  blacksmith: string;
  wizard: string;
  adventurer: string;
  priest: string;
  farmer: string;
  thief: string;
  knight: string;
  scholar: string;

  // Genres
  highFantasy: string;
  darkFantasy: string;
  sciFi: string;
  postApocalypse: string;
  martialArts: string;
  cozyFantasy: string;
  steampunk: string;

  // Quest Viewer
  questTypeLabel: Record<string, string>;
  difficultyLabel: Record<string, string>;
  objectives: string;
  branches: string;
  rewards: string;
  gold: string;
  exp: string;
  affinityChange: string;
  loreConnection: string;
  designNotes: string;
  viewJson: string;
  viewQuest: string;
  regenerate: string;

  // Dialogue tabs
  dialogueOffer: string;
  dialogueAccept: string;
  dialogueProgress: string;
  dialogueComplete: string;

  // Quest Chain
  questChain: string;
  clickToExplore: string;

  // Share
  shareExport: string;
  copyJson: string;
  downloadJson: string;
  copyLink: string;
  saveImage: string;
  copied: string;

  // Loading
  generatingQuest: string;

  // History
  generationHistory: string;

  // JSON Viewer
  jsonData: string;
  schemaStructure: string;
  engineIntegration: string;
  copy: string;
  download: string;

  // Empty state
  emptyStateTitle: string;
  emptyStateSubtitle: string;

  // Onboarding
  onboardingStep1Title: string;
  onboardingStep1Desc: string;
  onboardingStep2Title: string;
  onboardingStep2Desc: string;
  onboardingStep3Title: string;
  onboardingStep3Desc: string;
  onboardingNext: string;
  onboardingPrev: string;
  onboardingStart: string;
  onboardingSkip: string;

  // Error
  errorOccurred: string;
  retry: string;

  // Footer
  footerText: string;

  // Branch exploring
  exploring: string;

  // API Key
  apiKeyInput: string;
  apiKeySet: string;
  apiKeyDesc: string;
  apiKeyApply: string;
  apiKeyClear: string;

  // Radar Chart labels
  radarDifficulty: string;
  radarObjectives: string;
  radarGold: string;
  radarExp: string;
  radarBranches: string;
  radarItems: string;

  // Quest Compare
  compareTitle: string;
  compareType: string;
  compareDifficulty: string;
  compareEstTime: string;
  compareObjectives: string;
  compareBranches: string;
  compareGold: string;
  compareExp: string;
  compareItems: string;
  compareAffinity: string;
  compareDialogueOffer: string;

  // Chain Export
  chainCopy: string;
  chainDownload: string;
  chainCopied: string;
  chainDownloaded: string;
  chainExportLabel: string;
  chainCopyAriaLabel: string;
  chainDownloadAriaLabel: string;
  clipboardFailed: string;

  // Performance Stats
  statGenerationTime: string;
  statQuests: string;
  statChains: string;
  statUptime: string;

  // Quest History
  historyAll: string;
  historySearchPlaceholder: string;

  // Error Boundary
  errorBoundaryTitle: string;
  errorBoundaryUnknown: string;

  // Additional UI strings
  estimatedTime: string;
  compareButton: string;
  questGeneratedToast: string;
  warningLabel: string;

  // Preset names
  presetNames: Record<string, string>;
  presetNpcNames: Record<string, string>;
}

export const translations: Record<Locale, Translations> = {
  ko: {
    appTitle: 'Procedural Quest Writer',
    appSubtitle: 'AI \uD018\uC2A4\uD2B8 \uCCB4\uC778 \uB77C\uC774\uBE0C \uC0DD\uC131 \uB370\uBAA8',
    questSettings: '\uD018\uC2A4\uD2B8 \uC124\uC815',
    quickStart: '\uBE60\uB978 \uC2DC\uC791',
    npcSettings: 'NPC \uC124\uC815',
    npcName: '\uC774\uB984',
    npcNamePlaceholder: '\uC608: \uB9AC\uB77C',
    personality: '\uC131\uACA9',
    selectPlaceholder: '\uC120\uD0DD...',
    customInput: '\uC9C1\uC811 \uC785\uB825',
    occupation: '\uC9C1\uC5C5',
    worldSettings: '\uC138\uACC4\uAD00',
    genre: '\uC7A5\uB974',
    seasonSituation: '\uD604\uC7AC \uACC4\uC808/\uC0C1\uD669',
    seasonPlaceholder: '\uC608: \uACA8\uC6B8, \uC758\uBB38\uC758 \uAC70\uB798',
    specialNotes: '\uD2B9\uC774\uC0AC\uD56D (\uC120\uD0DD)',
    specialNotesPlaceholder: '\uC608: \uC2DC\uC7A5\uC5D0 \uC218\uC0C1\uD55C \uC678\uBD80\uC778\uB4E4',
    gameState: '\uAC8C\uC784 \uC0C1\uD0DC',
    playerLevel: '\uD50C\uB808\uC774\uC5B4 \uB808\uBCA8',
    npcAffinity: 'NPC \uD638\uAC10\uB3C4',
    affinityLow: '\uB0AE\uC74C',
    affinityNormal: '\uBCF4\uD1B5',
    affinityHigh: '\uB192\uC74C',
    affinityMax: '\uCD5C\uB300',
    questType: '\uD018\uC2A4\uD2B8 \uD0C0\uC785',
    questTypeMain: '\uBA54\uC778',
    questTypeSide: '\uC0AC\uC774\uB4DC',
    questTypeDaily: '\uC77C\uC77C',
    questTypeHidden: '\uD788\uB4E0',
    generateQuest: '\uD018\uC2A4\uD2B8 \uC0DD\uC131',
    generating: '\uC0DD\uC131 \uC911...',
    cheerful: '\uCF8C\uD65C\uD55C',
    taciturn: '\uACFC\uBB35\uD55C',
    mysterious: '\uC2E0\uBE44\uB85C\uC6B4',
    rough: '\uAC70\uCE5C',
    gentle: '\uB2E4\uC815\uD55C',
    cunning: '\uAD50\uD65C\uD55C',
    brave: '\uC6A9\uB9F9\uD55C',
    merchant: '\uC0C1\uC778',
    blacksmith: '\uB300\uC7A5\uC7A5\uC774',
    wizard: '\uB9C8\uBC95\uC0AC',
    adventurer: '\uBAA8\uD5D8\uAC00',
    priest: '\uC0AC\uC81C',
    farmer: '\uB18D\uBD80',
    thief: '\uB3C4\uC801',
    knight: '\uAE30\uC0AC',
    scholar: '\uD559\uC790',
    highFantasy: '\uD558\uC774 \uD310\uD0C0\uC9C0',
    darkFantasy: '\uB2E4\uD06C \uD310\uD0C0\uC9C0',
    sciFi: 'SF',
    postApocalypse: '\uD3EC\uC2A4\uD2B8\uC544\uD3EC\uCE7C\uB9BD\uC2A4',
    martialArts: '\uBB34\uD611',
    cozyFantasy: '\uCF54\uC9C0 \uD310\uD0C0\uC9C0',
    steampunk: '\uC2A4\uD300\uD380\uD06C',
    questTypeLabel: {
      main: '\uBA54\uC778 \uD018\uC2A4\uD2B8',
      side: '\uC0AC\uC774\uB4DC \uD018\uC2A4\uD2B8',
      daily: '\uC77C\uC77C \uD018\uC2A4\uD2B8',
      hidden: '\uD788\uB4E0 \uD018\uC2A4\uD2B8',
    },
    difficultyLabel: {
      easy: '\uC26C\uC6C0',
      normal: '\uBCF4\uD1B5',
      hard: '\uC5B4\uB824\uC6C0',
      legendary: '\uC804\uC124',
    },
    objectives: '\uBAA9\uD45C',
    branches: '\uBD84\uAE30',
    rewards: '\uBCF4\uC0C1',
    gold: '\uACE8\uB4DC',
    exp: 'EXP',
    affinityChange: '\uD638\uAC10\uB3C4',
    loreConnection: '\uC138\uACC4\uAD00 \uC5F0\uACB0',
    designNotes: '\uC124\uACC4 \uB178\uD2B8',
    viewJson: 'JSON \uBCF4\uAE30',
    viewQuest: '\uD018\uC2A4\uD2B8 \uBCF4\uAE30',
    regenerate: '\uC7AC\uC0DD\uC131',
    dialogueOffer: '\uC81C\uC548',
    dialogueAccept: '\uC218\uB77D',
    dialogueProgress: '\uC9C4\uD589',
    dialogueComplete: '\uC644\uB8CC',
    questChain: '\uD018\uC2A4\uD2B8 \uCCB4\uC778',
    clickToExplore: '\uD074\uB9AD\uD558\uC5EC \uD0D0\uD5D8',
    shareExport: '\uACF5\uC720 & \uB0B4\uBCF4\uB0B4\uAE30',
    copyJson: 'JSON \uBCF5\uC0AC',
    downloadJson: 'JSON \uB2E4\uC6B4\uB85C\uB4DC',
    copyLink: '\uB9C1\uD06C \uBCF5\uC0AC',
    saveImage: '\uC774\uBBF8\uC9C0 \uC800\uC7A5',
    copied: '\uBCF5\uC0AC\uB428!',
    generatingQuest: '\uD018\uC2A4\uD2B8 \uC0DD\uC131 \uC911...',
    generationHistory: '\uC0DD\uC131 \uD788\uC2A4\uD1A0\uB9AC',
    jsonData: 'JSON \uB370\uC774\uD130',
    schemaStructure: '\uC2A4\uD0A4\uB9C8 \uAD6C\uC870',
    engineIntegration: '\uC5D4\uC9C4 \uC5F0\uB3D9',
    copy: '\uBCF5\uC0AC',
    download: '\uB2E4\uC6B4\uB85C\uB4DC',
    emptyStateTitle: '\uC124\uC815\uC744 \uC785\uB825\uD558\uACE0 \uD018\uC2A4\uD2B8\uB97C \uC0DD\uC131\uD574\uBCF4\uC138\uC694!',
    emptyStateSubtitle: '\uB610\uB294 \uC704\uC758 \uD504\uB9AC\uC14B\uC744 \uD074\uB9AD\uD574 \uBE60\uB974\uAC8C \uC2DC\uC791\uD558\uC138\uC694',
    onboardingStep1Title: '1. NPC\uC640 \uC138\uACC4\uAD00\uC744 \uC124\uC815\uD558\uC138\uC694',
    onboardingStep1Desc: '\uC88C\uCE21 \uD328\uB110\uC5D0\uC11C NPC \uC774\uB984, \uC131\uACA9, \uC9C1\uC5C5\uACFC \uC138\uACC4\uAD00\uC744 \uC124\uC815\uD558\uAC70\uB098, \uD504\uB9AC\uC14B\uC744 \uD074\uB9AD\uD558\uC5EC \uBE60\uB974\uAC8C \uC2DC\uC791\uD558\uC138\uC694.',
    onboardingStep2Title: '2. AI\uAC00 \uD018\uC2A4\uD2B8\uB97C \uC0DD\uC131\uD569\uB2C8\uB2E4',
    onboardingStep2Desc: '\uBC84\uD2BC\uC744 \uB204\uB974\uBA74 AI\uAC00 \uC2E4\uC2DC\uAC04\uC73C\uB85C \uD018\uC2A4\uD2B8\uB97C \uC0DD\uC131\uD569\uB2C8\uB2E4. \uBAA9\uD45C, \uBD84\uAE30, \uBCF4\uC0C1, NPC \uB300\uC0AC\uAE4C\uC9C0 \uC790\uB3D9 \uC124\uACC4\uB429\uB2C8\uB2E4.',
    onboardingStep3Title: '3. \uBD84\uAE30\uB97C \uC120\uD0DD\uD574 \uC2A4\uD1A0\uB9AC\uB97C \uD655\uC7A5\uD558\uC138\uC694',
    onboardingStep3Desc: '\uBD84\uAE30 \uBC84\uD2BC\uC744 \uD074\uB9AD\uD558\uBA74 \uD6C4\uC18D \uD018\uC2A4\uD2B8\uAC00 \uC0DD\uC131\uB418\uACE0, \uD558\uB2E8 \uD50C\uB85C\uC6B0 \uCC28\uD2B8\uC5D0\uC11C \uD018\uC2A4\uD2B8 \uCCB4\uC778\uC744 \uC2DC\uAC01\uD654\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.',
    onboardingNext: '\uB2E4\uC74C',
    onboardingPrev: '\uC774\uC804',
    onboardingStart: '\uC2DC\uC791\uD558\uAE30',
    onboardingSkip: '\uAC74\uB108\uB6F0\uAE30',
    errorOccurred: '\uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4',
    retry: '\uC7AC\uC2DC\uB3C4',
    footerText: 'Procedural Quest Writer \u00B7 React + FastAPI + LLM',
    exploring: '\uD0D0\uD5D8 \uC911...',
    apiKeyInput: 'API \uD0A4 \uC785\uB825 (\uC120\uD0DD)',
    apiKeySet: 'API \uD0A4 \uC124\uC815\uB428',
    apiKeyDesc: 'OpenAI API \uD0A4\uB97C \uC785\uB825\uD558\uBA74 \uC2E4\uC81C AI\uAC00 \uD018\uC2A4\uD2B8\uB97C \uC0DD\uC131\uD569\uB2C8\uB2E4. \uD0A4\uB294 \uBE0C\uB77C\uC6B0\uC800 \uC138\uC158\uC5D0\uB9CC \uC800\uC7A5\uB418\uBA70 \uC11C\uBC84\uC5D0 \uBCF4\uAD00\uB418\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.',
    apiKeyApply: '\uC801\uC6A9',
    apiKeyClear: '\uCD08\uAE30\uD654',
    radarDifficulty: '\uB09C\uC774\uB3C4',
    radarObjectives: '\uBAA9\uD45C \uC218',
    radarGold: '\uBCF4\uC0C1(\uACE8\uB4DC)',
    radarExp: '\uBCF4\uC0C1(EXP)',
    radarBranches: '\uBD84\uAE30',
    radarItems: '\uC544\uC774\uD15C',
    compareTitle: '\uD018\uC2A4\uD2B8 \uBE44\uAD50',
    compareType: '\uD0C0\uC785',
    compareDifficulty: '\uB09C\uC774\uB3C4',
    compareEstTime: '\uC608\uC0C1 \uC2DC\uAC04',
    compareObjectives: '\uBAA9\uD45C',
    compareBranches: '\uBD84\uAE30',
    compareGold: '\uACE8\uB4DC',
    compareExp: 'EXP',
    compareItems: '\uC544\uC774\uD15C',
    compareAffinity: '\uD638\uAC10\uB3C4',
    compareDialogueOffer: 'NPC \uB300\uC0AC (\uC81C\uC548)',
    chainCopy: '\uCCB4\uC778 \uBCF5\uC0AC',
    chainDownload: '\uCCB4\uC778 \uB2E4\uC6B4\uB85C\uB4DC',
    chainCopied: '\uCCB4\uC778 JSON\uC774 \uBCF5\uC0AC\uB418\uC5C8\uC2B5\uB2C8\uB2E4!',
    chainDownloaded: '\uCCB4\uC778 JSON\uC774 \uB2E4\uC6B4\uB85C\uB4DC\uB418\uC5C8\uC2B5\uB2C8\uB2E4!',
    chainExportLabel: '\uCCB4\uC778 \uB0B4\uBCF4\uB0B4\uAE30',
    chainCopyAriaLabel: '\uCCB4\uC778 JSON \uD074\uB9BD\uBCF4\uB4DC\uC5D0 \uBCF5\uC0AC',
    chainDownloadAriaLabel: '\uCCB4\uC778 JSON \uB2E4\uC6B4\uB85C\uB4DC, \uD018\uC2A4\uD2B8 \uC218:',
    clipboardFailed: '\uD074\uB9BD\uBCF4\uB4DC \uBCF5\uC0AC\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4',
    statGenerationTime: '\uC0DD\uC131 \uC2DC\uAC04',
    statQuests: '\uD018\uC2A4\uD2B8',
    statChains: '\uCCB4\uC778',
    statUptime: '\uAC00\uB3D9 \uC2DC\uAC04',
    historyAll: '\uC804\uCCB4',
    historySearchPlaceholder: '\uAC80\uC0C9...',
    errorBoundaryTitle: '\uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4',
    errorBoundaryUnknown: '\uC54C \uC218 \uC5C6\uB294 \uC624\uB958',
    estimatedTime: '\uC608\uC0C1 \uC2DC\uAC04',
    compareButton: '\uBE44\uAD50',
    questGeneratedToast: '\uD018\uC2A4\uD2B8\uAC00 \uC0DD\uC131\uB418\uC5C8\uC2B5\uB2C8\uB2E4!',
    warningLabel: '\uACBD\uACE0',
    presetNames: {
      winter_market: '\uACA8\uC6B8 \uC2DC\uC7A5\uC758 \uBE44\uBC00',
      dragon_nest: '\uC6A9\uC758 \uB465\uC9C0',
      ruin_signal: '\uD3D0\uD5C8\uC758 \uC2E0\uD638',
      martial_grudge: '\uAC15\uD638\uC758 \uC6D0\uD55C',
      harvest_festival: '\uC218\uD655\uC81C \uC18C\uB3D9',
    },
    presetNpcNames: {
      winter_market: '\uB9AC\uB77C',
      dragon_nest: '\uCE74\uC774\uB978',
      ruin_signal: '\uC5D8\uB77C',
      martial_grudge: '\uBC31\uBB34\uBA85',
      harvest_festival: '\uBBF8\uB098',
    },
  },
  en: {
    appTitle: 'Procedural Quest Writer',
    appSubtitle: 'AI Quest Chain Live Generation Demo',
    questSettings: 'Quest Settings',
    quickStart: 'Quick Start',
    npcSettings: 'NPC Settings',
    npcName: 'Name',
    npcNamePlaceholder: 'e.g. Lira',
    personality: 'Personality',
    selectPlaceholder: 'Select...',
    customInput: 'Custom',
    occupation: 'Occupation',
    worldSettings: 'World Settings',
    genre: 'Genre',
    seasonSituation: 'Current Season/Situation',
    seasonPlaceholder: 'e.g. Winter, suspicious trade',
    specialNotes: 'Special Notes (optional)',
    specialNotesPlaceholder: 'e.g. Suspicious outsiders in the market',
    gameState: 'Game State',
    playerLevel: 'Player Level',
    npcAffinity: 'NPC Affinity',
    affinityLow: 'Low',
    affinityNormal: 'Normal',
    affinityHigh: 'High',
    affinityMax: 'Max',
    questType: 'Quest Type',
    questTypeMain: 'Main',
    questTypeSide: 'Side',
    questTypeDaily: 'Daily',
    questTypeHidden: 'Hidden',
    generateQuest: 'Generate Quest',
    generating: 'Generating...',
    cheerful: 'Cheerful',
    taciturn: 'Taciturn',
    mysterious: 'Mysterious',
    rough: 'Rough',
    gentle: 'Gentle',
    cunning: 'Cunning',
    brave: 'Brave',
    merchant: 'Merchant',
    blacksmith: 'Blacksmith',
    wizard: 'Wizard',
    adventurer: 'Adventurer',
    priest: 'Priest',
    farmer: 'Farmer',
    thief: 'Thief',
    knight: 'Knight',
    scholar: 'Scholar',
    highFantasy: 'High Fantasy',
    darkFantasy: 'Dark Fantasy',
    sciFi: 'Sci-Fi',
    postApocalypse: 'Post-Apocalypse',
    martialArts: 'Wuxia / Martial Arts',
    cozyFantasy: 'Cozy Fantasy',
    steampunk: 'Steampunk',
    questTypeLabel: {
      main: 'Main Quest',
      side: 'Side Quest',
      daily: 'Daily Quest',
      hidden: 'Hidden Quest',
    },
    difficultyLabel: {
      easy: 'Easy',
      normal: 'Normal',
      hard: 'Hard',
      legendary: 'Legendary',
    },
    objectives: 'Objectives',
    branches: 'Branches',
    rewards: 'Rewards',
    gold: 'Gold',
    exp: 'EXP',
    affinityChange: 'Affinity',
    loreConnection: 'Lore Connection',
    designNotes: 'Design Notes',
    viewJson: 'View JSON',
    viewQuest: 'View Quest',
    regenerate: 'Regenerate',
    dialogueOffer: 'Offer',
    dialogueAccept: 'Accept',
    dialogueProgress: 'Progress',
    dialogueComplete: 'Complete',
    questChain: 'Quest Chain',
    clickToExplore: 'Click to explore',
    shareExport: 'Share & Export',
    copyJson: 'Copy JSON',
    downloadJson: 'Download JSON',
    copyLink: 'Copy Link',
    saveImage: 'Save Image',
    copied: 'Copied!',
    generatingQuest: 'Generating quest...',
    generationHistory: 'Generation History',
    jsonData: 'JSON Data',
    schemaStructure: 'Schema',
    engineIntegration: 'Engine Guide',
    copy: 'Copy',
    download: 'Download',
    emptyStateTitle: 'Enter settings and generate a quest!',
    emptyStateSubtitle: 'Or click a preset above for a quick start',
    onboardingStep1Title: '1. Set up NPC & World',
    onboardingStep1Desc: 'Configure the NPC name, personality, occupation and world settings in the left panel, or click a preset to quick start.',
    onboardingStep2Title: '2. AI Generates a Quest',
    onboardingStep2Desc: 'Press the button and AI generates a quest in real-time. Objectives, branches, rewards, and NPC dialogue are all auto-designed.',
    onboardingStep3Title: '3. Expand the Story',
    onboardingStep3Desc: 'Click branch buttons to generate follow-up quests. View the growing quest chain in the flow chart below.',
    onboardingNext: 'Next',
    onboardingPrev: 'Back',
    onboardingStart: 'Get Started',
    onboardingSkip: 'Skip',
    errorOccurred: 'An error occurred',
    retry: 'Retry',
    footerText: 'Procedural Quest Writer \u00B7 React + FastAPI + LLM',
    exploring: 'Exploring...',
    apiKeyInput: 'API Key (optional)',
    apiKeySet: 'API Key Set',
    apiKeyDesc: 'Enter your OpenAI API key to use real AI for quest generation. The key is stored only in your browser session and is never saved on the server.',
    apiKeyApply: 'Apply',
    apiKeyClear: 'Clear',
    radarDifficulty: 'Difficulty',
    radarObjectives: 'Objectives',
    radarGold: 'Gold',
    radarExp: 'EXP',
    radarBranches: 'Branches',
    radarItems: 'Items',
    compareTitle: 'Quest Compare',
    compareType: 'Type',
    compareDifficulty: 'Difficulty',
    compareEstTime: 'Est. Time',
    compareObjectives: 'Objectives',
    compareBranches: 'Branches',
    compareGold: 'Gold',
    compareExp: 'EXP',
    compareItems: 'Items',
    compareAffinity: 'Affinity',
    compareDialogueOffer: 'NPC Dialogue (Offer)',
    chainCopy: 'Copy Chain',
    chainDownload: 'Download Chain',
    chainCopied: 'Chain JSON copied!',
    chainDownloaded: 'Chain JSON downloaded!',
    chainExportLabel: 'Chain export actions',
    chainCopyAriaLabel: 'Copy chain JSON to clipboard',
    chainDownloadAriaLabel: 'Download chain JSON, quest count:',
    clipboardFailed: 'Failed to copy to clipboard',
    statGenerationTime: 'Generation Time',
    statQuests: 'Quests',
    statChains: 'Chains',
    statUptime: 'Uptime',
    historyAll: 'All',
    historySearchPlaceholder: 'Search...',
    errorBoundaryTitle: 'An error occurred',
    errorBoundaryUnknown: 'Unknown error',
    estimatedTime: 'Est. Time',
    compareButton: 'Compare',
    questGeneratedToast: 'Quest generated!',
    warningLabel: 'WARNING',
    presetNames: {
      winter_market: 'Secret of the Winter Market',
      dragon_nest: "The Dragon's Nest",
      ruin_signal: 'Signal from the Ruins',
      martial_grudge: 'Grudge of the River',
      harvest_festival: 'Harvest Festival Commotion',
    },
    presetNpcNames: {
      winter_market: 'Lira',
      dragon_nest: 'Kairn',
      ruin_signal: 'Ella',
      martial_grudge: 'Baek Mumyeong',
      harvest_festival: 'Mina',
    },
  },
};
