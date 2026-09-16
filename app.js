/**
 * app.js — Motor do funil de aplicação (exibido em pop-up modal)
 * -----------------------------------------------------------------
 * Lê a configuração de FLOW (flow.js) e renderiza, valida e navega
 * entre as etapas dentro de um modal acessível. Qualquer botão com
 * [data-open-funnel] na página abre o mesmo modal.
 */
(function () {
  'use strict';

  // =================================================================
  // CONFIGURAÇÃO — preencha aqui para conectar tracking e destino do lead
  // =================================================================
  const LEAD_SUBMIT_URL = ''; // Ex: 'https://services.leadconnectorhq.com/hooks/xxxx'

  const TRACKING_CONFIG = {
    ga4_id: '',
    meta_pixel_id: '',
    custom_webhook: ''
  };

  const STORAGE_KEY = 'operacao50k_funnel_state_v2';

  // =================================================================
  // TRACKING
  // =================================================================
  function trackEvent(eventName, data) {
    var payload = Object.assign({ event: eventName, timestamp: new Date().toISOString() }, data || {});
    // eslint-disable-next-line no-console
    console.log('[TRACK]', eventName, payload);
    if (TRACKING_CONFIG.ga4_id && typeof window.gtag === 'function') {
      window.gtag('event', eventName, data || {});
    }
    if (TRACKING_CONFIG.meta_pixel_id && typeof window.fbq === 'function') {
      window.fbq('trackCustom', eventName, data || {});
    }
    if (TRACKING_CONFIG.custom_webhook && navigator.sendBeacon) {
      try {
        navigator.sendBeacon(TRACKING_CONFIG.custom_webhook, JSON.stringify(payload));
      } catch (e) { /* falha silenciosa de tracking não deve travar o funil */ }
    }
  }

  // =================================================================
  // ESTADO
  // =================================================================
  var state = {
    currentIndex: 0,
    answers: {},
    stepStartedAt: Date.now(),
    funnelStartedAt: null,
    utm: captureUTM()
  };

  var steps = FLOW.steps;
  var root = document.getElementById('funnel-app');
  var overlay = document.getElementById('funnel-modal-overlay');
  var modal = document.getElementById('funnel-modal');
  var closeBtn = document.getElementById('funnel-modal-close');
  var submitted = false;
  var lastFocusedTrigger = null;

  function captureUTM() {
    var params = new URLSearchParams(window.location.search);
    var utm = {};
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(function (key) {
      if (params.get(key)) utm[key] = params.get(key);
    });
    return utm;
  }

  function saveState() {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ currentIndex: state.currentIndex, answers: state.answers }));
    } catch (e) { /* sessionStorage indisponível — segue sem persistência */ }
  }

  function loadState() {
    try {
      var raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function clearState() {
    try { sessionStorage.removeItem(STORAGE_KEY); } catch (e) { /* noop */ }
  }

  // =================================================================
  // MODAL — abrir/fechar, focus trap, scroll lock
  // =================================================================
  function getFocusable() {
    return Array.prototype.slice.call(
      modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
    ).filter(function (el) { return !el.disabled && el.offsetParent !== null; });
  }

  function trapFocus(evt) {
    if (evt.key === 'Escape') {
      closeModal();
      return;
    }
    if (evt.key !== 'Tab') return;
    var focusable = getFocusable();
    if (!focusable.length) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (evt.shiftKey && document.activeElement === first) {
      evt.preventDefault();
      last.focus();
    } else if (!evt.shiftKey && document.activeElement === last) {
      evt.preventDefault();
      first.focus();
    }
  }

  function openModal(trigger) {
    lastFocusedTrigger = trigger || document.activeElement;
    overlay.hidden = false;
    document.body.classList.add('funnel-scroll-lock');
    modal.addEventListener('keydown', trapFocus);
    trackEvent('popup_open', {});

    var saved = loadState();
    if (saved && saved.currentIndex > 0 && !submitted) {
      renderResumeBanner(saved);
    } else if (!root.hasChildNodes()) {
      render();
    }

    window.setTimeout(function () {
      var focusable = getFocusable();
      (focusable[0] || modal).focus();
    }, 10);
  }

  function closeModal() {
    overlay.hidden = true;
    document.body.classList.remove('funnel-scroll-lock');
    modal.removeEventListener('keydown', trapFocus);
    if (lastFocusedTrigger && typeof lastFocusedTrigger.focus === 'function') {
      lastFocusedTrigger.focus();
    }
  }

  // =================================================================
  // RENDERIZAÇÃO
  // =================================================================
  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    attrs = attrs || {};
    Object.keys(attrs).forEach(function (key) {
      if (key === 'text') {
        node.textContent = attrs[key];
      } else if (key === 'html') {
        node.innerHTML = attrs[key];
      } else if (key.indexOf('on') === 0 && typeof attrs[key] === 'function') {
        node.addEventListener(key.slice(2).toLowerCase(), attrs[key]);
      } else {
        node.setAttribute(key, attrs[key]);
      }
    });
    (children || []).forEach(function (child) { if (child) node.appendChild(child); });
    return node;
  }

  function getGroups() {
    var groups = [];
    steps.forEach(function (step) {
      if (groups.indexOf(step.group) === -1) groups.push(step.group);
    });
    return groups;
  }

  function estimateSecondsLeft() {
    var remainingSteps = steps.length - state.currentIndex;
    var seconds = remainingSteps * 12;
    if (seconds < 60) return '~' + seconds + ' segundos';
    return '~' + Math.round(seconds / 60) + ' min';
  }

  function renderProgress(container) {
    var groups = getGroups();
    var currentGroup = steps[state.currentIndex].group;
    var currentGroupIndex = groups.indexOf(currentGroup);

    var header = el('div', { class: 'funnel-header' });
    header.appendChild(el('p', { class: 'funnel-brand', text: 'OPERAÇÃO 50K' }));

    var indicator = el('div', { class: 'funnel-step-indicator', role: 'list', 'aria-label': 'Progresso da aplicação' });
    groups.forEach(function (groupName, i) {
      var state_ = i < currentGroupIndex ? 'done' : (i === currentGroupIndex ? 'current' : 'upcoming');
      var item = el('div', { class: 'funnel-step-dot funnel-step-dot--' + state_, role: 'listitem' });
      var circle = el('span', { class: 'funnel-step-circle', text: state_ === 'done' ? '✓' : String(i + 1) });
      var label = el('span', { class: 'funnel-step-dot-label', text: groupName });
      item.appendChild(circle);
      item.appendChild(label);
      indicator.appendChild(item);
    });
    header.appendChild(indicator);

    var meta = el('div', { class: 'funnel-step-meta' });
    meta.appendChild(el('span', { text: 'Passo ' + (currentGroupIndex + 1) + ' de ' + groups.length }));
    meta.appendChild(el('span', { text: estimateSecondsLeft() }));
    header.appendChild(meta);

    container.appendChild(header);
  }

  function renderTrustFooter(container) {
    var footer = el('div', { class: 'funnel-trust-footer' });
    footer.appendChild(el('p', { text: 'Vagas limitadas por mês · Resposta em até 48h úteis · Sem compromisso' }));
    footer.appendChild(el('p', { class: 'funnel-trust-footer-secure', html: '🔒 Seus dados ficam protegidos · Sem spam' }));
    container.appendChild(footer);
  }

  function fieldValue(fieldId) {
    var v = state.answers[fieldId];
    if (v === undefined) return '';
    return v;
  }

  function renderField(field, errors) {
    var fieldError = errors && errors.find(function (e) { return e.fieldId === field.id; });
    var wrap = el('div', { class: 'funnel-field' + (fieldError ? ' funnel-field-error' : '') });
    var labelText = field.label + (field.required ? ' *' : ' (opcional)');
    var describedBy = [];
    if (field.hint) describedBy.push(field.id + '-hint');
    if (fieldError) describedBy.push(field.id + '-error');

    var labelTag = (field.type === 'radio' || field.type === 'checkbox-group') ? 'p' : 'label';
    var labelAttrs = { class: 'funnel-label' + (field.hideLabel ? ' sr-only-abs' : ''), text: labelText, id: field.id + '-legend' };
    if (labelTag === 'label') labelAttrs.for = field.id;
    wrap.appendChild(el(labelTag, labelAttrs));

    if (field.hint) {
      wrap.appendChild(el('p', { id: field.id + '-hint', class: 'funnel-hint', text: field.hint }));
    }

    var input;
    if (field.type === 'select') {
      input = el('select', { id: field.id, name: field.id, class: 'funnel-input', 'aria-required': field.required ? 'true' : 'false' });
      input.appendChild(el('option', { value: '', text: 'Selecione uma opção' }));
      field.options.forEach(function (opt) {
        var optionEl = el('option', { value: opt.value, text: opt.label });
        if (fieldValue(field.id) === opt.value) optionEl.setAttribute('selected', 'selected');
        input.appendChild(optionEl);
      });
    } else if (field.type === 'radio') {
      var allShort = field.options.every(function (o) { return o.label.length <= 20; });
      input = el('div', { class: 'funnel-radio-group' + (allShort ? ' funnel-options-grid' : ''), role: 'radiogroup', 'aria-labelledby': field.id + '-legend' });
      field.options.forEach(function (opt, i) {
        var optId = field.id + '-' + i;
        var radioWrap = el('div', { class: 'funnel-radio-option' + (fieldValue(field.id) === opt.value ? ' is-selected' : '') });
        var radio = el('input', { type: 'radio', id: optId, name: field.id, value: opt.value });
        if (fieldValue(field.id) === opt.value) radio.checked = true;
        radioWrap.appendChild(radio);
        radioWrap.appendChild(el('label', { for: optId, text: opt.label }));
        input.appendChild(radioWrap);
      });
      input.addEventListener('change', function () {
        Array.prototype.forEach.call(input.querySelectorAll('.funnel-radio-option'), function (o) {
          o.classList.toggle('is-selected', o.querySelector('input').checked);
        });
      });
    } else if (field.type === 'checkbox-group') {
      var selected = Array.isArray(fieldValue(field.id)) ? fieldValue(field.id) : [];
      input = el('div', { class: 'funnel-radio-group', role: 'group', 'aria-labelledby': field.id + '-legend' });
      field.options.forEach(function (opt, i) {
        var optId = field.id + '-' + i;
        var wrapOpt = el('div', { class: 'funnel-radio-option' + (selected.indexOf(opt.value) !== -1 ? ' is-selected' : '') });
        var box = el('input', { type: 'checkbox', id: optId, name: field.id, value: opt.value });
        if (selected.indexOf(opt.value) !== -1) box.checked = true;
        wrapOpt.appendChild(box);
        wrapOpt.appendChild(el('label', { for: optId, text: opt.label }));
        input.appendChild(wrapOpt);
      });
      input.addEventListener('change', function (evt) {
        var wrapOpt = evt.target.closest('.funnel-radio-option');
        if (wrapOpt) wrapOpt.classList.toggle('is-selected', evt.target.checked);
      });
    } else if (field.type === 'textarea') {
      input = el('textarea', {
        id: field.id, name: field.id, class: 'funnel-input funnel-textarea', rows: '3',
        placeholder: field.placeholder || '', maxlength: field.maxLength ? String(field.maxLength) : ''
      });
      input.value = fieldValue(field.id);
    } else {
      input = el('input', {
        type: field.type, id: field.id, name: field.id, class: 'funnel-input',
        placeholder: field.placeholder || '', autocomplete: field.autocomplete || 'off'
      });
      input.value = fieldValue(field.id);
    }

    if (describedBy.length) input.setAttribute('aria-describedby', describedBy.join(' '));
    if (fieldError) input.setAttribute('aria-invalid', 'true');

    wrap.appendChild(input);

    if (fieldError) {
      wrap.appendChild(el('p', { id: field.id + '-error', class: 'funnel-field-error-msg', role: 'alert', text: 'Erro: ' + fieldError.message }));
    }
    return wrap;
  }

  function renderTrustScreen(step, container) {
    var box = el('div', { class: 'funnel-trust' });
    box.appendChild(el('h3', { class: 'funnel-step-title', text: step.title }));
    box.appendChild(el('p', { class: 'funnel-trust-item', text: step.trustMessage.why }));
    box.appendChild(el('p', { class: 'funnel-trust-item', text: step.trustMessage.what }));
    box.appendChild(el('p', { class: 'funnel-trust-item funnel-trust-privacy', text: step.trustMessage.privacy }));
    container.appendChild(box);
  }

  function displayValueFor(field, value) {
    if (field.type === 'select' || field.type === 'radio') {
      var opt = field.options.find(function (o) { return o.value === value; });
      return opt ? opt.label : value;
    }
    if (field.type === 'checkbox-group' && Array.isArray(value)) {
      return value.map(function (v) {
        var opt = field.options.find(function (o) { return o.value === v; });
        return opt ? opt.label : v;
      }).join(', ');
    }
    return value;
  }

  function renderReviewScreen(container) {
    var box = el('div', { class: 'funnel-review' });
    box.appendChild(el('h3', { class: 'funnel-step-title', text: 'Revise suas respostas' }));
    box.appendChild(el('p', { class: 'funnel-hint', text: 'Confira antes de enviar. Você pode voltar e editar qualquer etapa.' }));

    steps.forEach(function (step, index) {
      if (step.isTrustScreen || !step.fields.length) return;
      step.fields.forEach(function (field) {
        var value = fieldValue(field.id);
        if (!value || (Array.isArray(value) && !value.length)) return;
        var row = el('div', { class: 'funnel-review-row' });
        row.appendChild(el('span', { class: 'funnel-review-label', text: field.label }));
        row.appendChild(el('span', { class: 'funnel-review-value', text: displayValueFor(field, value) }));
        row.appendChild(el('button', {
          type: 'button', class: 'funnel-review-edit', text: 'Editar',
          'aria-label': 'Editar resposta: ' + field.label,
          onclick: function () { goToStep(index); }
        }));
        box.appendChild(row);
      });
    });
    container.appendChild(box);
  }

  function render() {
    var step = steps[state.currentIndex];
    root.innerHTML = '';

    var card = el('div', { class: 'funnel-card' });
    renderProgress(card);

    var errorSummary = el('div', { id: 'funnel-error-summary', class: 'funnel-error-summary', tabindex: '-1' });
    card.appendChild(errorSummary);

    var form = el('form', { novalidate: 'novalidate', id: 'funnel-form' });

    var groups = getGroups();
    var groupIdx = groups.indexOf(step.group);
    form.appendChild(el('p', { class: 'funnel-eyebrow-step', text: 'PASSO ' + (groupIdx + 1) + ' DE ' + groups.length + ' · ' + step.group.toUpperCase() }));

    if (step.isTrustScreen) {
      renderTrustScreen(step, form);
    } else {
      form.appendChild(el('h3', { class: 'funnel-step-title', text: step.title }));
      if (step.subtitle) form.appendChild(el('p', { class: 'funnel-step-subtitle', text: step.subtitle }));
      step.fields.forEach(function (field) { form.appendChild(renderField(field, [])); });
    }

    var isLastContentStep = state.currentIndex === steps.length - 1;
    if (isLastContentStep) renderReviewScreen(form);

    var nav = el('div', { class: 'funnel-nav' });
    if (state.currentIndex > 0) {
      nav.appendChild(el('button', { type: 'button', class: 'funnel-btn funnel-btn-ghost', text: 'Voltar', onclick: function () { goBack(); } }));
    }
    var nextLabel = isLastContentStep ? 'Enviar aplicação' : (step.isTrustScreen ? 'Continuar' : 'Avançar');
    var nextBtn = el('button', { type: 'submit', class: 'funnel-btn funnel-btn-primary', text: nextLabel });
    nav.appendChild(nextBtn);
    form.appendChild(nav);

    form.addEventListener('submit', function (evt) {
      evt.preventDefault();
      handleAdvance(isLastContentStep, nextBtn);
    });

    card.appendChild(form);
    renderTrustFooter(card);
    root.appendChild(card);

    if (state.funnelStartedAt === null && (step.fields.length || step.isTrustScreen)) {
      state.funnelStartedAt = Date.now();
      trackEvent('funnel_start', {});
    }
    trackEvent('step_view', { step_id: step.id, step_number: state.currentIndex + 1, step_title: step.title });
    state.stepStartedAt = Date.now();
  }

  // =================================================================
  // VALIDAÇÃO
  // =================================================================
  function validateStep(step) {
    var errors = [];
    step.fields.forEach(function (field) {
      if (!field.required) return;
      var value;
      if (field.type === 'radio') {
        var checked = document.querySelector('input[name="' + field.id + '"]:checked');
        value = checked ? checked.value : '';
      } else if (field.type === 'checkbox-group') {
        value = Array.prototype.slice.call(document.querySelectorAll('input[name="' + field.id + '"]:checked')).map(function (i) { return i.value; });
        if (!value.length) {
          errors.push({ fieldId: field.id, message: 'Selecione ao menos uma opção.' });
          trackEvent('field_error', { step_id: step.id, field_id: field.id, error_type: 'required' });
        }
        return;
      } else {
        var elx = document.getElementById(field.id);
        value = elx ? elx.value.trim() : '';
      }
      if (!value) {
        errors.push({ fieldId: field.id, message: 'Este campo é obrigatório.' });
        trackEvent('field_error', { step_id: step.id, field_id: field.id, error_type: 'required' });
        return;
      }
      if (field.type === 'tel' && value.replace(/\D/g, '').length < 10) {
        errors.push({ fieldId: field.id, message: 'Informe um telefone válido com DDD.' });
        trackEvent('field_error', { step_id: step.id, field_id: field.id, error_type: 'invalid_tel' });
      }
    });
    return errors;
  }

  function collectStepValues(step) {
    step.fields.forEach(function (field) {
      if (field.type === 'radio') {
        var checked = document.querySelector('input[name="' + field.id + '"]:checked');
        state.answers[field.id] = checked ? checked.value : '';
      } else if (field.type === 'checkbox-group') {
        state.answers[field.id] = Array.prototype.slice.call(document.querySelectorAll('input[name="' + field.id + '"]:checked')).map(function (i) { return i.value; });
      } else {
        var elx = document.getElementById(field.id);
        if (elx) state.answers[field.id] = elx.value.trim();
      }
    });
  }

  function showErrors(errors) {
    var summary = document.getElementById('funnel-error-summary');
    if (!errors.length) {
      summary.innerHTML = '';
      summary.removeAttribute('role');
      return;
    }
    summary.setAttribute('role', 'alert');
    summary.setAttribute('aria-live', 'assertive');
    summary.innerHTML = '';
    summary.appendChild(el('p', { class: 'funnel-error-summary-title', text: 'Erro: corrija os campos abaixo antes de continuar.' }));
    var list = document.createElement('ul');
    errors.forEach(function (err) {
      var li = document.createElement('li');
      var link = document.createElement('a');
      link.href = '#' + err.fieldId;
      link.textContent = err.message;
      link.addEventListener('click', function (e) {
        e.preventDefault();
        var target = document.getElementById(err.fieldId);
        if (target) target.focus();
      });
      li.appendChild(link);
      list.appendChild(li);
    });
    summary.appendChild(list);
    summary.focus();

    errors.forEach(function (err) {
      var input = document.getElementById(err.fieldId) || modal.querySelector('[name="' + err.fieldId + '"]');
      var wrap = input ? input.closest('.funnel-field') : modal.querySelector('.funnel-radio-group[aria-labelledby="' + err.fieldId + '-legend"]');
      if (wrap && wrap.classList && !wrap.classList.contains('funnel-field')) wrap = wrap.closest('.funnel-field');
      if (wrap && !wrap.querySelector('.funnel-field-error-msg')) {
        wrap.classList.add('funnel-field-error');
        var msg = document.createElement('p');
        msg.id = err.fieldId + '-error';
        msg.className = 'funnel-field-error-msg';
        msg.setAttribute('role', 'alert');
        msg.textContent = 'Erro: ' + err.message;
        wrap.appendChild(msg);
      }
    });
  }

  function handleAdvance(isSubmitStep, btn) {
    var step = steps[state.currentIndex];
    if (!step.isTrustScreen) {
      var errors = validateStep(step);
      if (errors.length) { showErrors(errors); return; }
      collectStepValues(step);
    }
    showErrors([]);
    saveState();

    var timeOnStep = Math.round((Date.now() - state.stepStartedAt) / 1000);
    trackEvent('step_complete', { step_id: step.id, step_number: state.currentIndex + 1, time_on_step: timeOnStep });

    if (isSubmitStep) { submitFunnel(btn); return; }
    state.currentIndex += 1;
    render();
  }

  function goBack() {
    var fromStep = steps[state.currentIndex].id;
    state.currentIndex = Math.max(0, state.currentIndex - 1);
    trackEvent('step_back', { from_step: fromStep, to_step: steps[state.currentIndex].id });
    render();
  }

  function goToStep(index) {
    state.currentIndex = index;
    render();
    var firstField = root.querySelector('input, select, textarea');
    if (firstField) firstField.focus();
  }

  // =================================================================
  // SUBMISSÃO
  // =================================================================
  function submitFunnel(btn) {
    if (submitted) return;
    submitted = true;
    btn.disabled = true;
    btn.textContent = 'Enviando...';

    var totalTime = state.funnelStartedAt ? Math.round((Date.now() - state.funnelStartedAt) / 1000) : null;
    var payload = Object.assign({}, state.answers, {
      utm: state.utm,
      submitted_at: new Date().toISOString(),
      page_url: window.location.href
    });

    trackEvent('funnel_complete', { total_time: totalTime, steps_completed: steps.length });

    function finish() {
      clearState();
      window.location.href = 'obrigado.html';
    }

    if (LEAD_SUBMIT_URL) {
      fetch(LEAD_SUBMIT_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        .then(finish)
        .catch(function () {
          // eslint-disable-next-line no-console
          console.error('[FUNIL] Falha ao enviar para o webhook. Payload:', payload);
          finish();
        });
    } else {
      // eslint-disable-next-line no-console
      console.log('[FUNIL] LEAD_SUBMIT_URL não configurado. Payload que seria enviado:', payload);
      finish();
    }
  }

  // Tela de sucesso inline não é mais usada — o envio bem-sucedido
  // redireciona para obrigado.html (ver finish() em submitFunnel).

  // =================================================================
  // RETOMAR SESSÃO
  // =================================================================
  function renderResumeBanner(saved) {
    root.innerHTML = '';
    var banner = el('div', { class: 'funnel-resume', role: 'region', 'aria-label': 'Continuar aplicação' });
    banner.appendChild(el('p', { text: 'Você começou a preencher antes. Quer continuar de onde parou?' }));
    var actions = el('div', { class: 'funnel-resume-actions' });
    actions.appendChild(el('button', {
      type: 'button', class: 'funnel-btn funnel-btn-primary', text: 'Continuar de onde parei',
      onclick: function () { state.currentIndex = saved.currentIndex; state.answers = saved.answers; render(); }
    }));
    actions.appendChild(el('button', {
      type: 'button', class: 'funnel-btn funnel-btn-ghost', text: 'Recomeçar',
      onclick: function () { clearState(); state.currentIndex = 0; state.answers = {}; render(); }
    }));
    banner.appendChild(actions);
    root.appendChild(banner);
  }

  // =================================================================
  // INICIALIZAÇÃO
  // =================================================================
  function init() {
    if (!root || !overlay || !modal) return;

    trackEvent('page_view', { url: window.location.href, referrer: document.referrer });

    document.querySelectorAll('[data-open-funnel]').forEach(function (btn) {
      btn.addEventListener('click', function () { openModal(btn); });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('mousedown', function (evt) {
      if (evt.target === overlay) closeModal();
    });

    setupStickyBar();

    window.addEventListener('beforeunload', function () {
      if (!submitted && state.funnelStartedAt) {
        var lastStep = steps[state.currentIndex];
        trackEvent('funnel_abandon', { last_step: lastStep.id, time_on_page: Math.round((Date.now() - state.funnelStartedAt) / 1000) });
      }
    });
  }

  function setupStickyBar() {
    var bar = document.getElementById('sticky-cta-bar');
    var hero = document.querySelector('.hero');
    if (!bar || !hero || !('IntersectionObserver' in window)) return;
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        bar.classList.toggle('is-visible', !entry.isIntersecting);
      });
    }, { threshold: 0 });
    observer.observe(hero);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
