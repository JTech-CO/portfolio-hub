(function () {
  'use strict';

  var STATUS_LABEL = {
    active: '활성',
    beta: '베타',
    'coming-soon': '출시 예정',
  };

  function createElement(tagName, className, text) {
    var element = document.createElement(tagName);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function createIconElement(icon, size) {
    var wrapper = document.createDocumentFragment();
    var isImage = /\.(png|jpe?g|svg|webp)(?:[?#].*)?$/i.test(icon);

    if (isImage) {
      var image = document.createElement('img');
      image.src = icon;
      image.alt = '';
      image.width = size;
      image.height = size;
      image.loading = 'lazy';
      wrapper.appendChild(image);
      return wrapper;
    }

    var iconElement = document.createElement('i');
    var safeClasses = icon.split(/\s+/).filter(function (className) {
      return /^[a-z0-9-]+$/i.test(className);
    });
    iconElement.className = safeClasses.length ? safeClasses.join(' ') : 'fas fa-cube';
    iconElement.setAttribute('aria-hidden', 'true');
    wrapper.appendChild(iconElement);
    return wrapper;
  }

  function createTagElement(tag) {
    return createElement('span', 'item-card__tag', tag);
  }

  function createStatusElement(status) {
    return createElement(
      'span',
      'item-card__status item-card__status--' + status,
      STATUS_LABEL[status] || status
    );
  }

  function createCardElement(config, onDetailClick) {
    var card = createElement('article', 'item-card');
    card.dataset.id = config.id;

    var icon = createElement('div', 'item-card__icon');
    icon.appendChild(createIconElement(config.icon, 36));
    card.appendChild(icon);
    card.appendChild(createElement('h3', 'item-card__name', config.name));
    card.appendChild(createElement('div', 'item-card__divider'));
    card.appendChild(createElement('p', 'item-card__desc', config.shortDescription));

    var meta = createElement('div', 'item-card__meta');
    var tags = createElement('div', 'item-card__tags');
    config.tags.forEach(function (tag) { tags.appendChild(createTagElement(tag)); });
    meta.appendChild(tags);
    meta.appendChild(createStatusElement(config.status));
    card.appendChild(meta);

    if (config.version) card.appendChild(createElement('div', 'item-card__version', 'v' + config.version));

    var footer = createElement('div', 'item-card__footer');
    var button = createElement('button', 'item-card__btn', '자세히 보기');
    button.type = 'button';
    button.setAttribute('aria-label', config.name + ' 자세히 보기');
    var arrow = createElement('i', 'fas fa-arrow-right');
    arrow.setAttribute('aria-hidden', 'true');
    button.appendChild(arrow);
    button.addEventListener('click', function () { onDetailClick(config); });
    footer.appendChild(button);
    card.appendChild(footer);

    return card;
  }

  window.PortfolioUI = {
    createElement: createElement,
    createIconElement: createIconElement,
    createTagElement: createTagElement,
    createStatusElement: createStatusElement,
    createCardElement: createCardElement,
  };
})();
