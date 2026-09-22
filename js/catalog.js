(function () {
  'use strict';

  var INDEX = 'portfolio/categories.json';
  var VALID = ['active', 'beta', 'coming-soon'];
  var ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

  function fetchJson(url) {
    return fetch(url, { headers: { Accept: 'application/json' } }).then(function (response) {
      if (!response.ok) throw new Error(url + ' (' + response.status + ')');
      return response.json().catch(function () { throw new Error(url + ' JSON'); });
    });
  }

  function text(value, fallback) {
    return typeof value === 'string' && value.trim() ? value.trim() : (fallback || '');
  }

  function array(value) {
    return Array.isArray(value)
      ? value.filter(function (entry) { return typeof entry === 'string' && entry.trim(); }).map(function (entry) { return entry.trim(); })
      : [];
  }

  function normalizeUrl(value, issues, context) {
    var raw = text(value, '');
    if (!raw) return '';
    try {
      var parsed = new URL(raw, document.baseURI);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        issues.push(context + ': unsupported URL protocol');
        return '';
      }
      return parsed.href;
    } catch (error) {
      issues.push(context + ': invalid URL');
      return '';
    }
  }

  function normalizeItem(raw, category, index, seen, issues) {
    var context = category.key + '[' + index + ']';
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;

    var id = text(raw.id, '');
    var name = text(raw.name, '');
    var shortDescription = text(raw.shortDescription, '');
    if (!ID.test(id) || !name || !shortDescription || seen.has(id)) {
      issues.push(context + ': invalid or duplicate item');
      return null;
    }
    seen.add(id);

    return {
      id: id,
      name: name,
      shortDescription: shortDescription,
      icon: text(raw.icon, 'fas fa-cube'),
      tags: array(raw.tags),
      status: VALID.indexOf(raw.status) >= 0 ? raw.status : 'active',
      version: text(raw.version, ''),
      updatedAt: text(raw.updatedAt, ''),
      featured: raw.featured === true,
      repoUrl: normalizeUrl(raw.repoUrl, issues, context),
      liveUrl: normalizeUrl(raw.liveUrl, issues, context),
      actionLabel: text(raw.actionLabel, ''),
      categoryKey: category.key,
      categoryLabel: category.label
    };
  }

  function normalizeCategories(payload) {
    if (!payload || !Array.isArray(payload.categories)) throw new Error('categories');
    var seen = new Set();
    return payload.categories.map(function (raw, index) {
      var key = text(raw && raw.key, '');
      var source = text(raw && raw.source, '');
      if (!ID.test(key) || !source || seen.has(key)) throw new Error('categories[' + index + ']');
      seen.add(key);
      return {
        key: key,
        label: text(raw.label, key),
        description: text(raw.description, ''),
        source: source
      };
    });
  }

  function loadCategory(category) {
    var issues = [];
    return fetchJson(category.source).then(function (payload) {
      var raw = Array.isArray(payload) ? payload : (payload && payload.items);
      if (!Array.isArray(raw)) throw new Error(category.key + ' items');
      var seen = new Set();
      return {
        key: category.key,
        label: category.label,
        description: category.description,
        items: raw.map(function (entry, index) {
          return normalizeItem(entry, category, index, seen, issues);
        }).filter(Boolean),
        issues: issues,
        error: ''
      };
    }).catch(function (error) {
      return {
        key: category.key,
        label: category.label,
        description: category.description,
        items: [],
        issues: issues,
        error: error.message
      };
    });
  }

  function load() {
    return fetchJson(INDEX).then(normalizeCategories).then(function (categories) {
      return Promise.all(categories.map(loadCategory));
    });
  }

  window.PortfolioCatalog = { load: load };
})();
