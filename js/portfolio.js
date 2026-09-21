(function () {
  'use strict';

  var cachedCategories = null;
  var recentCollapsed = false;

  function state(message, isError) {
    return window.PortfolioUI.el('p', 'portfolio-state' + (isError ? ' portfolio-state--error' : ''), message);
  }

  function localizedCategory(category, field) {
    var englishField = field + 'En';
    return window.PortfolioUI.localized(category[field], category[englishField]);
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
    titleWrap.appendChild(ui.el('span', 'section-kicker', window.PortfolioI18n.t('recentKicker')));
    titleWrap.appendChild(ui.el('h2', 'section-title', window.PortfolioI18n.t('recentTitle')));
    titleWrap.appendChild(ui.el('p', 'section-description', window.PortfolioI18n.t('recentDescription')));
    header.appendChild(titleWrap);

    var controls = ui.el('div', 'recent-controls');
    var count = ui.el('span', 'section-count');
    count.appendChild(ui.el('span', '', String(items.length)));
    count.appendChild(document.createTextNode(' ' + window.PortfolioI18n.t('recentCount')));
    controls.appendChild(count);

    var toggle = ui.el('button', 'recent-toggle');
    toggle.type = 'button';
    toggle.setAttribute('aria-controls', 'recent-work-grid');
    toggle.setAttribute('aria-expanded', recentCollapsed ? 'false' : 'true');
    toggle.setAttribute('aria-label', window.PortfolioI18n.t(recentCollapsed ? 'expandAria' : 'collapseAria'));
    toggle.appendChild(ui.fontIcon(recentCollapsed ? 'fas fa-chevron-down' : 'fas fa-chevron-up'));
    toggle.appendChild(document.createTextNode(window.PortfolioI18n.t(recentCollapsed ? 'expand' : 'collapse')));
    controls.appendChild(toggle);
    header.appendChild(controls);
    section.appendChild(header);

    var grid = ui.el('div', 'recent-grid');
    grid.id = 'recent-work-grid';
    grid.hidden = recentCollapsed;

    items.forEach(function (item) {
      var button = ui.el('button', 'recent-card');
      button.type = 'button';
      button.setAttribute('aria-label', window.PortfolioI18n.t('recentJumpAria') + ' ' + item.name);

      var top = ui.el('div', 'recent-card__top');
      top.appendChild(ui.el('span', 'recent-card__date', ui.dateText(item.updatedAt)));
      top.appendChild(ui.el('span', 'recent-card__category', ui.localized(item.categoryLabel, item.categoryLabelEn)));
      button.appendChild(top);
      button.appendChild(ui.el('h3', 'recent-card__name', item.name));
      button.appendChild(ui.el('p', 'recent-card__desc', ui.localized(item.shortDescription, item.shortDescriptionEn)));

      var jump = ui.el('span', 'recent-card__jump');
      jump.appendChild(ui.fontIcon('fas fa-arrow-down'));
      jump.appendChild(document.createTextNode(window.PortfolioI18n.getLanguage() === 'en' ? 'View card' : '카드로 이동'));
      button.appendChild(jump);

      button.addEventListener('click', function () { flashProject(item.id); });
      grid.appendChild(button);
    });

    toggle.addEventListener('click', function () {
      recentCollapsed = !recentCollapsed;
      grid.hidden = recentCollapsed;
      toggle.setAttribute('aria-expanded', recentCollapsed ? 'false' : 'true');
      toggle.setAttribute('aria-label', window.PortfolioI18n.t(recentCollapsed ? 'expandAria' : 'collapseAria'));
      toggle.replaceChildren(
        ui.fontIcon(recentCollapsed ? 'fas fa-chevron-down' : 'fas fa-chevron-up'),
        document.createTextNode(window.PortfolioI18n.t(recentCollapsed ? 'expand' : 'collapse'))
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
    titleWrap.appendChild(ui.el('span', 'section-kicker', window.PortfolioI18n.t('categoryKicker')));
    titleWrap.appendChild(ui.el('h2', 'section-title', '// ' + localizedCategory(category, 'label')));
    var description = localizedCategory(category, 'description');
    if (description) titleWrap.appendChild(ui.el('p', 'section-description', description));
    header.appendChild(titleWrap);

    var count = ui.el('span', 'section-count');
    count.appendChild(ui.el('span', '', String(category.items.length)));
    count.appendChild(document.createTextNode(' ' + window.PortfolioI18n.t('projectsCount')));
    header.appendChild(count);
    section.appendChild(header);

    if (category.error) {
      section.appendChild(state(window.PortfolioI18n.t('loadError') + ' ' + category.error, true));
      return section;
    }

    var items = category.items.slice().sort(function (a, b) {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      return (b.updatedAt || '').localeCompare(a.updatedAt || '');
    });

    if (!items.length) {
      section.appendChild(state(window.PortfolioI18n.t('empty')));
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
    document.addEventListener('portfolio:languagechange', function () { render(root); });

    return window.PortfolioCatalog.load().then(function (categories) {
      cachedCategories = categories;
      render(root);
    }).catch(function (error) {
      root.replaceChildren(state(window.PortfolioI18n.t('portfolioLoadError') + ' ' + error.message, true));
      console.error(error);
    }).finally(function () {
      root.setAttribute('aria-busy', 'false');
    });
  }

  window.initPortfolio = init;
})();
