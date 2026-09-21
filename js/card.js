(function () {
  'use strict';

  function el(tag, className, text) {
    var element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function fontIcon(icon) {
    var element = document.createElement('i');
    var safe = icon.split(/\s+/).filter(function (className) { return /^[a-z0-9-]+$/i.test(className); });
    element.className = safe.length ? safe.join(' ') : 'fas fa-cube';
    element.setAttribute('aria-hidden', 'true');
    return element;
  }

  function language() {
    return window.PortfolioI18n.getLanguage();
  }

  function localized(primary, english) {
    return language() === 'en' ? (english || primary) : primary;
  }

  function tag(value) {
    return el('span', 'item-card__tag', value);
  }

  function status(value) {
    var keys = {
      active: 'statusActive',
      beta: 'statusBeta',
      'coming-soon': 'statusComingSoon'
    };
    return el('span', 'item-card__status item-card__status--' + value, window.PortfolioI18n.t(keys[value] || value));
  }

  function dateText(value) {
    return value ? value.replace(/-/g, '.') : '';
  }

  function createAction(url, label, icon, primary) {
    var link = el('a', 'item-card__action' + (primary ? ' item-card__action--primary' : ''));
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener';
    link.appendChild(fontIcon(icon));
    link.appendChild(document.createTextNode(label));
    return link;
  }

  function card(config) {
    var article = el('article', 'item-card');
    article.dataset.id = config.id;
    article.id = 'project-' + config.id;

    var top = el('div', 'item-card__top');
    var icon = el('div', 'item-card__icon');
    icon.appendChild(fontIcon(config.icon));
    top.appendChild(icon);
    if (config.featured) top.appendChild(el('span', 'item-card__badge', window.PortfolioI18n.t('featured')));
    article.appendChild(top);

    article.appendChild(el('h3', 'item-card__name', config.name));
    article.appendChild(el('div', 'item-card__divider'));
    article.appendChild(el('p', 'item-card__desc', localized(config.shortDescription, config.shortDescriptionEn)));

    var meta = el('div', 'item-card__meta');
    var tags = el('div', 'item-card__tags');
    config.tags.slice(0, 3).forEach(function (value) { tags.appendChild(tag(value)); });
    meta.appendChild(tags);
    meta.appendChild(status(config.status));
    article.appendChild(meta);

    if (config.updatedAt || config.version) {
      var submeta = el('div', 'item-card__submeta');
      submeta.appendChild(el('span', '', config.updatedAt ? window.PortfolioI18n.t('updated') + ' ' + dateText(config.updatedAt) : ''));
      submeta.appendChild(el('span', '', config.version ? 'v' + config.version : ''));
      article.appendChild(submeta);
    }

    var actions = el('div', 'item-card__actions');
    if (config.liveUrl) {
      var liveLabel = localized(config.actionLabel || window.PortfolioI18n.t('openProject'), config.actionLabelEn || window.PortfolioI18n.t('openProject'));
      actions.appendChild(createAction(config.liveUrl, liveLabel, 'fas fa-arrow-up-right-from-square', true));
    }
    if (config.repoUrl) {
      actions.appendChild(createAction(config.repoUrl, window.PortfolioI18n.t('github'), 'fa-brands fa-github', !config.liveUrl));
    }
    if (actions.children.length) article.appendChild(actions);

    return article;
  }

  window.PortfolioUI = {
    el: el,
    fontIcon: fontIcon,
    card: card,
    dateText: dateText,
    localized: localized
  };
})();
