(function () {
  'use strict';

  var cachedCategories = null;
  var recentCollapsed = false;

  function state(message, isError) {
    return window.PortfolioUI.el('p', 'portfolio-state' + (isError ? ' portfolio-state--error' : ''), message);
  }

  function recent(categories) {
    var all = [];
    categories.forEach(function (category) {
      category.items.forEach(function (item) {
        if (item.updatedAt) all.push(item);
      });
    });
    all.sort(function (a, b) {
      return b.updatedAt.localeCompare(a.updatedAt) || a.name.localeCompare(b.name);
    });
    return all.slice(0, 8);
  }

  function allItems() {
    var items = [];
    if (!cachedCategories) return items;
    cachedCategories.forEach(function (category) {
      category.items.forEach(function (item) { items.push(item); });
    });
    return items;
  }

  function flashProject(itemId) {
    var target = document.getElementById('project-' + itemId);
    if (!target) return;

    var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' });

    window.setTimeout(function () {
      target.classList.remove('item-card--flash');
      void target.offsetWidth;
      target.classList.add('item-card--flash');
      window.setTimeout(function () { target.classList.remove('item-card--flash'); }, 1250);
    }, reducedMotion ? 0 : 420);
  }

  function recentSection(items) {
    var ui = window.PortfolioUI;
    var section = ui.el('section', 'recent-section');
    section.id = 'recent-work';

    var header = ui.el('div', 'section-header recent-section__header');
    var titleWrap = ui.el('div', 'section-title-wrap');
    titleWrap.appendChild(ui.el('span', 'section-kicker', 'Latest repository activity'));
    titleWrap.appendChild(ui.el('h2', 'section-title', '// Recent Work'));
    titleWrap.appendChild(ui.el('p', 'section-description', '최근 작업 8개를 최신순으로 표시합니다. 카드를 누르면 아래의 해당 프로젝트 카드로 이동합니다.'));
    header.appendChild(titleWrap);

    var controls = ui.el('div', 'recent-controls');
    var count = ui.el('span', 'section-count');
    count.appendChild(ui.el('span', '', String(items.length)));
    count.appendChild(document.createTextNode(' 최근 작업'));
    controls.appendChild(count);

    var toggle = ui.el('button', 'recent-toggle');
    toggle.type = 'button';
    toggle.setAttribute('aria-controls', 'recent-work-grid');
    toggle.setAttribute('aria-expanded', recentCollapsed ? 'false' : 'true');
    toggle.setAttribute('aria-label', recentCollapsed ? 'Recent Work 펼치기' : 'Recent Work 접기');
    toggle.appendChild(ui.fontIcon(recentCollapsed ? 'fas fa-chevron-down' : 'fas fa-chevron-up'));
    toggle.appendChild(document.createTextNode(recentCollapsed ? '펼치기' : '접기'));
    controls.appendChild(toggle);
    header.appendChild(controls);
    section.appendChild(header);

    var grid = ui.el('div', 'recent-grid');
    grid.id = 'recent-work-grid';
    grid.hidden = recentCollapsed;

    items.forEach(function (item) {
      var button = ui.el('button', 'recent-card');
      button.type = 'button';
      button.setAttribute('aria-label', '프로젝트 카드로 이동: ' + item.name);

      var top = ui.el('div', 'recent-card__top');
      top.appendChild(ui.el('span', 'recent-card__date', ui.dateText(item.updatedAt)));
      top.appendChild(ui.el('span', 'recent-card__category', item.categoryLabel));
      button.appendChild(top);
      button.appendChild(ui.el('h3', 'recent-card__name', item.name));
      button.appendChild(ui.el('p', 'recent-card__desc', item.shortDescription));

      var jump = ui.el('span', 'recent-card__jump');
      jump.appendChild(ui.fontIcon('fas fa-arrow-down'));
      jump.appendChild(document.createTextNode('카드로 이동'));
      button.appendChild(jump);

      button.addEventListener('click', function () { flashProject(item.id); });
      grid.appendChild(button);
    });

    toggle.addEventListener('click', function () {
      recentCollapsed = !recentCollapsed;
      grid.hidden = recentCollapsed;
      toggle.setAttribute('aria-expanded', recentCollapsed ? 'false' : 'true');
      toggle.setAttribute('aria-label', recentCollapsed ? 'Recent Work 펼치기' : 'Recent Work 접기');
      toggle.replaceChildren(
        ui.fontIcon(recentCollapsed ? 'fas fa-chevron-down' : 'fas fa-chevron-up'),
        document.createTextNode(recentCollapsed ? '펼치기' : '접기')
      );
    });

    section.appendChild(grid);
    return section;
  }

  function categorySection(category) {
    var ui = window.PortfolioUI;
    var section = ui.el('section', 'portfolio-section');
    section.id = category.key;

    var header = ui.el('div', 'section-header');
    var titleWrap = ui.el('div', 'section-title-wrap');
    titleWrap.appendChild(ui.el('span', 'section-kicker', 'JTech project category'));
    titleWrap.appendChild(ui.el('h2', 'section-title', '// ' + category.label));
    if (category.description) titleWrap.appendChild(ui.el('p', 'section-description', category.description));
    header.appendChild(titleWrap);

    var count = ui.el('span', 'section-count');
    count.appendChild(ui.el('span', '', String(category.items.length)));
    count.appendChild(document.createTextNode(' 프로젝트'));
    header.appendChild(count);
    section.appendChild(header);

    if (category.error) {
      section.appendChild(state('데이터를 불러오지 못했습니다: ' + category.error, true));
      return section;
    }

    var items = category.items.slice().sort(function (a, b) {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      return (b.updatedAt || '').localeCompare(a.updatedAt || '');
    });

    if (!items.length) {
      section.appendChild(state('등록된 프로젝트가 없습니다.'));
      return section;
    }

    var grid = ui.el('div', 'portfolio-grid');
    items.forEach(function (item) { grid.appendChild(ui.card(item)); });
    section.appendChild(grid);

    if (category.issues.length) console.warn('[' + category.key + '] ' + category.issues.join('\n'));
    return section;
  }

  function render(root) {
    if (!cachedCategories) return;
    var fragment = document.createDocumentFragment();
    var recentItems = recent(cachedCategories);
    if (recentItems.length) fragment.appendChild(recentSection(recentItems));
    cachedCategories.forEach(function (category) { fragment.appendChild(categorySection(category)); });
    root.replaceChildren(fragment);
  }

  function init() {
    var root = document.getElementById('portfolio-root');
    if (!root) return Promise.resolve();

    root.setAttribute('aria-busy', 'true');
    return window.PortfolioCatalog.load().then(function (categories) {
      cachedCategories = categories;
      render(root);
      document.dispatchEvent(new CustomEvent('portfolio:loaded'));
    }).catch(function (error) {
      root.replaceChildren(state('포트폴리오를 불러오지 못했습니다: ' + error.message, true));
      console.error(error);
    }).finally(function () {
      root.setAttribute('aria-busy', 'false');
    });
  }

  window.PortfolioRuntime = {
    getItems: allItems,
    flashProject: flashProject
  };
  window.initPortfolio = init;
})();
