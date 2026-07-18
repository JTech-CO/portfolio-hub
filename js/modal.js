(function () {
  'use strict';

  function Modal(overlayElement) {
    if (!overlayElement) throw new Error('모달 오버레이를 찾을 수 없습니다.');
    this._overlay = overlayElement;
    this._modal = overlayElement.querySelector('.modal');
    if (!this._modal) throw new Error('모달 컨테이너를 찾을 수 없습니다.');

    this._previousFocus = null;
    this._onKeyDown = this._onKeyDown.bind(this);
    this._onOverlayClick = this._onOverlayClick.bind(this);
    this._overlay.addEventListener('click', this._onOverlayClick);
  }

  Modal.prototype.open = function (config) {
    this._previousFocus = document.activeElement;
    this._renderContent(config);
    this._overlay.classList.add('is-open');
    this._overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', this._onKeyDown);

    var closeButton = this._modal.querySelector('.modal__close');
    window.requestAnimationFrame(function () { closeButton.focus(); });
  };

  Modal.prototype.close = function () {
    if (!this._overlay.classList.contains('is-open')) return;
    this._overlay.classList.remove('is-open');
    this._overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    document.removeEventListener('keydown', this._onKeyDown);

    if (this._previousFocus && this._previousFocus.isConnected) this._previousFocus.focus();
    this._previousFocus = null;
  };

  Modal.prototype._renderContent = function (config) {
    var ui = window.PortfolioUI;
    var header = ui.createElement('div', 'modal__header');
    var headerLeft = ui.createElement('div', 'modal__header-left');
    var icon = ui.createElement('div', 'modal__icon');
    icon.appendChild(ui.createIconElement(config.icon, 40, config.imageUrl));
    headerLeft.appendChild(icon);

    var heading = document.createElement('div');
    var title = ui.createElement('h2', 'modal__title', config.name);
    title.id = 'portfolio-modal-title';
    heading.appendChild(title);
    if (config.version) heading.appendChild(ui.createElement('div', 'modal__version', 'v' + config.version));
    headerLeft.appendChild(heading);
    header.appendChild(headerLeft);

    var closeButton = ui.createElement('button', 'modal__close');
    closeButton.type = 'button';
    closeButton.setAttribute('aria-label', '닫기');
    var closeIcon = ui.createElement('i', 'fas fa-xmark');
    closeIcon.setAttribute('aria-hidden', 'true');
    closeButton.appendChild(closeIcon);
    closeButton.addEventListener('click', this.close.bind(this));
    header.appendChild(closeButton);

    var body = ui.createElement('div', 'modal__body');
    body.appendChild(ui.createElement('p', 'modal__desc', config.fullDescription));

    if (config.features.length) {
      body.appendChild(ui.createElement('div', 'modal__section-label', '주요 기능'));
      var features = ui.createElement('ul', 'modal__features');
      config.features.forEach(function (feature) {
        features.appendChild(ui.createElement('li', 'modal__feature', feature));
      });
      body.appendChild(features);
    }

    if (config.tags.length) {
      body.appendChild(ui.createElement('div', 'modal__section-label', '카테고리'));
      var tags = ui.createElement('div', 'modal__tags');
      config.tags.forEach(function (tag) { tags.appendChild(ui.createTagElement(tag)); });
      body.appendChild(tags);
    }

    var footer = ui.createElement('div', 'modal__footer');
    footer.appendChild(ui.createStatusElement(config.status));

    var isDisabled = config.status === 'coming-soon' || !config.url;
    var action = ui.createElement('a', 'modal__install-btn');
    if (isDisabled) {
      action.classList.add('modal__install-btn--disabled');
      action.setAttribute('aria-disabled', 'true');
      action.tabIndex = -1;
    } else {
      action.href = config.url;
      action.target = '_blank';
      action.rel = 'noopener';
    }

    var actionIcon = ui.createElement('i', isDisabled ? 'fas fa-clock' : 'fas fa-arrow-up-right-from-square');
    actionIcon.setAttribute('aria-hidden', 'true');
    action.appendChild(actionIcon);
    action.appendChild(document.createTextNode(
      config.status === 'coming-soon' ? '출시 예정' : (!config.url ? '링크 준비 중' : config.actionLabel)
    ));
    footer.appendChild(action);
    body.appendChild(footer);

    this._modal.replaceChildren(header, body);
  };

  Modal.prototype._onOverlayClick = function (event) {
    if (event.target === this._overlay) this.close();
  };

  Modal.prototype._onKeyDown = function (event) {
    if (event.key === 'Escape') {
      this.close();
      return;
    }
    if (event.key !== 'Tab') return;

    var focusable = this._modal.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])');
    if (!focusable.length) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  window.Modal = Modal;
})();
