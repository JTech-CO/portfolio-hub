(function () {
  'use strict';

  function createState(message, isError) {
    var className = 'portfolio-state' + (isError ? ' portfolio-state--error' : '');
    return window.PortfolioUI.createElement('p', className, message);
  }

  function buildSection(category, modal) {
    var ui = window.PortfolioUI;
    var section = ui.createElement('section', 'portfolio-section');
    section.id = category.key;

    var header = ui.createElement('div', 'section-header');
    header.appendChild(ui.createElement('h2', 'section-title', '// ' + category.label));
    var count = ui.createElement('span', 'section-count');
    count.appendChild(ui.createElement('span', '', String(category.items.length)));
    count.appendChild(document.createTextNode(' items'));
    header.appendChild(count);
    section.appendChild(header);

    if (category.error) {
      section.appendChild(createState('데이터를 불러오지 못했습니다: ' + category.error, true));
      return section;
    }
    if (!category.items.length) {
      section.appendChild(createState('등록된 프로젝트가 없습니다.'));
      return section;
    }

    var grid = ui.createElement('div', 'portfolio-grid');
    category.items.forEach(function (config) {
      grid.appendChild(ui.createCardElement(config, function (item) { modal.open(item); }));
    });
    section.appendChild(grid);

    if (category.issues.length) {
      console.warn('[' + category.key + '] 데이터 경고\n' + category.issues.join('\n'));
    }
    return section;
  }

  function renderFatalError(root, error) {
    root.replaceChildren(createState('포트폴리오를 불러오지 못했습니다: ' + error.message, true));
  }

  function initPortfolio() {
    var root = document.getElementById('portfolio-root');
    var overlay = document.getElementById('modal-overlay');
    if (!root) return Promise.resolve();

    root.setAttribute('aria-busy', 'true');
    try {
      var modal = new window.Modal(overlay);
      return window.PortfolioCatalog.load().then(function (categories) {
        var fragment = document.createDocumentFragment();
        categories.forEach(function (category) { fragment.appendChild(buildSection(category, modal)); });
        root.replaceChildren(fragment);
        if (!categories.length) root.appendChild(createState('등록된 카테고리가 없습니다.'));
      }).catch(function (error) {
        renderFatalError(root, error);
        console.error(error);
      }).finally(function () {
        root.setAttribute('aria-busy', 'false');
      });
    } catch (error) {
      renderFatalError(root, error);
      root.setAttribute('aria-busy', 'false');
      console.error(error);
      return Promise.resolve();
    }
  }

  window.initPortfolio = initPortfolio;
})();
