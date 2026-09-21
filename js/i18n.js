(function () {
  'use strict';

  var STORAGE_KEY = 'jtech-portfolio-language';
  var DEFAULT_LANGUAGE = 'ko';
  var strings = {
    ko: {
      metaDescription: 'JTech Co.의 AI·개발도구, 공학 시뮬레이션, 데이터 시스템, 하드웨어 프로토타입과 프로젝트를 한곳에서 탐색하세요.',
      ogDescription: 'Build, simulate, verify. JTech Co.의 프로젝트 카탈로그.',
      homeAria: 'JTech Portfolio Hub 홈',
      navAria: '사이트 탐색',
      languageAria: '언어 선택',
      navRecent: '최근 작업',
      heroLabel: 'JTech Co. · Portfolio Snapshot',
      heroBuild: 'Build.',
      heroSimulate: 'Simulate. Verify.',
      heroSubtitle: '기술을 설명하는 데 그치지 않고, 직접 실행하고 조작하며 검증할 수 있는 형태로 만듭니다.',
      heroMetaAria: '포트폴리오 기준 정보',
      metaProjects: 'GitHub Projects',
      metaSnapshot: 'Snapshot 2026.09.22',
      metaLanguage: 'KR / EN',
      projectsAria: '프로젝트 목록',
      loading: '포트폴리오를 불러오는 중입니다.',
      sourceLink: 'portfolio-hub 소스',
      recentKicker: 'Latest repository activity',
      recentTitle: '// Recent Work',
      recentDescription: '최근 작업 8개를 최신순으로 표시합니다. 카드를 누르면 아래의 해당 프로젝트 카드로 이동합니다.',
      recentCount: '최근 작업',
      collapse: '접기',
      expand: '펼치기',
      collapseAria: 'Recent Work 접기',
      expandAria: 'Recent Work 펼치기',
      categoryKicker: 'JTech project category',
      projectsCount: '프로젝트',
      empty: '등록된 프로젝트가 없습니다.',
      loadError: '데이터를 불러오지 못했습니다:',
      portfolioLoadError: '포트폴리오를 불러오지 못했습니다:',
      featured: '대표작',
      statusActive: '활성',
      statusBeta: '베타',
      statusComingSoon: '준비 중',
      updated: '업데이트',
      github: 'GitHub',
      openProject: '열기',
      recentJumpAria: '프로젝트 카드로 이동:'
    },
    en: {
      metaDescription: 'Explore JTech Co. projects across AI and developer tools, engineering simulation, data systems, hardware prototyping, and utilities.',
      ogDescription: 'Build, simulate, verify. The JTech Co. project catalog.',
      homeAria: 'JTech Portfolio Hub home',
      navAria: 'Site navigation',
      languageAria: 'Language selector',
      navRecent: 'Recent',
      heroLabel: 'JTech Co. · Portfolio Snapshot',
      heroBuild: 'Build.',
      heroSimulate: 'Simulate. Verify.',
      heroSubtitle: 'I turn technical ideas into things that can be run, manipulated, and verified instead of stopping at explanation.',
      heroMetaAria: 'Portfolio snapshot information',
      metaProjects: 'GitHub Projects',
      metaSnapshot: 'Snapshot 2026.09.22',
      metaLanguage: 'KR / EN',
      projectsAria: 'Project list',
      loading: 'Loading portfolio…',
      sourceLink: 'portfolio-hub source',
      recentKicker: 'Latest repository activity',
      recentTitle: '// Recent Work',
      recentDescription: 'The eight most recently updated projects. Select a tile to jump to the matching project card below.',
      recentCount: 'recent',
      collapse: 'Collapse',
      expand: 'Expand',
      collapseAria: 'Collapse Recent Work',
      expandAria: 'Expand Recent Work',
      categoryKicker: 'JTech project category',
      projectsCount: 'projects',
      empty: 'No projects are registered in this category.',
      loadError: 'Could not load data:',
      portfolioLoadError: 'Could not load the portfolio:',
      featured: 'Featured',
      statusActive: 'Active',
      statusBeta: 'Beta',
      statusComingSoon: 'In progress',
      updated: 'Updated',
      github: 'GitHub',
      openProject: 'Open',
      recentJumpAria: 'Jump to project card:'
    }
  };

  var language = DEFAULT_LANGUAGE;

  function readStoredLanguage() {
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      return stored === 'en' || stored === 'ko' ? stored : DEFAULT_LANGUAGE;
    } catch (error) {
      return DEFAULT_LANGUAGE;
    }
  }

  function storeLanguage(value) {
    try { localStorage.setItem(STORAGE_KEY, value); } catch (error) { /* storage is optional */ }
  }

  function t(key) {
    return (strings[language] && strings[language][key]) || strings.ko[key] || key;
  }

  function applyStaticText() {
    document.documentElement.lang = language;

    document.querySelectorAll('[data-i18n]').forEach(function (element) {
      element.textContent = t(element.getAttribute('data-i18n'));
    });
    document.querySelectorAll('[data-i18n-aria-label]').forEach(function (element) {
      element.setAttribute('aria-label', t(element.getAttribute('data-i18n-aria-label')));
    });
    document.querySelectorAll('[data-i18n-content]').forEach(function (element) {
      element.setAttribute('content', t(element.getAttribute('data-i18n-content')));
    });
    document.querySelectorAll('[data-language]').forEach(function (button) {
      var isActive = button.getAttribute('data-language') === language;
      button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      button.classList.toggle('is-active', isActive);
    });
  }

  function setLanguage(nextLanguage, emit) {
    if (nextLanguage !== 'ko' && nextLanguage !== 'en') return;
    var changed = nextLanguage !== language;
    language = nextLanguage;
    storeLanguage(language);
    applyStaticText();
    if (changed && emit !== false) {
      document.dispatchEvent(new CustomEvent('portfolio:languagechange', { detail: { language: language } }));
    }
  }

  function init() {
    language = readStoredLanguage();
    document.querySelectorAll('[data-language]').forEach(function (button) {
      button.addEventListener('click', function () {
        setLanguage(button.getAttribute('data-language'));
      });
    });
    applyStaticText();
  }

  window.PortfolioI18n = {
    init: init,
    t: t,
    getLanguage: function () { return language; },
    setLanguage: setLanguage
  };
})();
