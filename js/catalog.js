(function () {
  'use strict';

  var CATEGORY_INDEX_URL = 'portfolio/categories.json';
  var VALID_STATUS = ['active', 'beta', 'coming-soon'];
  var ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

  function fetchJson(url) {
    return fetch(url, { headers: { Accept: 'application/json' } }).then(function (response) {
      if (!response.ok) throw new Error(url + ' 요청 실패 (' + response.status + ')');
      return response.json().catch(function () {
        throw new Error(url + '의 JSON 형식이 올바르지 않습니다.');
      });
    });
  }

  function toText(value, fallback) {
    if (typeof value !== 'string') return fallback || '';
    return value.trim() || fallback || '';
  }

  function toTextArray(value) {
    if (!Array.isArray(value)) return [];
    return value
      .filter(function (entry) { return typeof entry === 'string' && entry.trim(); })
      .map(function (entry) { return entry.trim(); });
  }

  function toImageFolder(name) {
    return name
      .trim()
      .replace(/[<>:"/\\|?*\u0000-\u001f]/g, '-')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/[.\s]+$/g, '') || 'project';
  }

  function getImageUrl(category, name) {
    var separatorIndex = category.source.lastIndexOf('/');
    var categoryPath = separatorIndex >= 0 ? category.source.slice(0, separatorIndex + 1) : '';
    return categoryPath + 'images/' + encodeURIComponent(toImageFolder(name)) + '/icon.png';
  }

  function normalizeUrl(value, issues, context) {
    var rawUrl = toText(value, '');
    if (!rawUrl || rawUrl === '#') return '';
    try {
      var url = new URL(rawUrl, document.baseURI);
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        issues.push(context + ': 지원하지 않는 URL 프로토콜입니다.');
        return '';
      }
      return url.href;
    } catch (error) {
      issues.push(context + ': URL 형식이 올바르지 않습니다.');
      return '';
    }
  }

  function normalizeItem(rawItem, category, index, seenIds, issues) {
    var context = category.key + '[' + index + ']';
    if (!rawItem || typeof rawItem !== 'object' || Array.isArray(rawItem)) {
      issues.push(context + ': 객체 형식이 아니어서 제외했습니다.');
      return null;
    }

    var id = toText(rawItem.id, '');
    var name = toText(rawItem.name, '');
    var shortDescription = toText(rawItem.shortDescription, '');
    if (!ID_PATTERN.test(id) || !name || !shortDescription) {
      issues.push(context + ': id, name, shortDescription를 확인하세요.');
      return null;
    }
    if (seenIds.has(id)) {
      issues.push(context + ': 중복 id "' + id + '"를 제외했습니다.');
      return null;
    }
    seenIds.add(id);

    var status = VALID_STATUS.indexOf(rawItem.status) >= 0 ? rawItem.status : 'active';
    if (status !== rawItem.status) issues.push(context + ': 알 수 없는 status를 active로 변경했습니다.');

    return {
      id: id,
      name: name,
      shortDescription: shortDescription,
      fullDescription: toText(rawItem.fullDescription, shortDescription),
      icon: toText(rawItem.icon, 'fas fa-cube'),
      imageUrl: getImageUrl(category, name),
      tags: toTextArray(rawItem.tags),
      status: status,
      version: toText(rawItem.version, ''),
      url: normalizeUrl(rawItem.url, issues, context),
      actionLabel: toText(rawItem.actionLabel, '바로가기'),
      features: toTextArray(rawItem.features),
    };
  }

  function normalizeItems(payload, category, issues) {
    var rawItems = Array.isArray(payload) ? payload : payload && payload.items;
    if (!Array.isArray(rawItems)) throw new Error(category.key + ' 데이터에 items 배열이 없습니다.');
    var seenIds = new Set();
    return rawItems.map(function (item, index) {
      return normalizeItem(item, category, index, seenIds, issues);
    }).filter(Boolean);
  }

  function normalizeCategories(payload) {
    var rawCategories = payload && payload.categories;
    if (!Array.isArray(rawCategories)) throw new Error('categories.json에 categories 배열이 없습니다.');
    var seenKeys = new Set();
    return rawCategories.map(function (rawCategory, index) {
      var key = toText(rawCategory && rawCategory.key, '');
      var source = toText(rawCategory && rawCategory.source, '');
      if (!ID_PATTERN.test(key) || !source || seenKeys.has(key)) {
        throw new Error('categories[' + index + ']의 key 또는 source를 확인하세요.');
      }
      seenKeys.add(key);
      return { key: key, label: toText(rawCategory.label, key), source: source };
    });
  }

  function loadCategory(category) {
    var issues = [];
    return fetchJson(category.source).then(function (payload) {
      return {
        key: category.key,
        label: category.label,
        items: normalizeItems(payload, category, issues),
        issues: issues,
        error: '',
      };
    }).catch(function (error) {
      return {
        key: category.key,
        label: category.label,
        items: [],
        issues: issues,
        error: error.message,
      };
    });
  }

  function load() {
    return fetchJson(CATEGORY_INDEX_URL).then(normalizeCategories).then(function (categories) {
      return Promise.all(categories.map(loadCategory));
    });
  }

  window.PortfolioCatalog = { load: load };
})();
