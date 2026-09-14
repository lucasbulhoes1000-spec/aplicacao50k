/**
 * app.js — Motor do funil de aplicação
 * -----------------------------------------------------------------
 * Lê a configuração de FLOW (flow.js) e renderiza, valida e navega
 * entre as etapas. Não contém conteúdo/copy — isso vive em flow.js.
 */
(function () {
  'use strict';

  // =================================================================
  // CONFIGURAÇÃO — preencha aqui para conectar tracking e destino do lead
  // =================================================================

  // URL do webhook do GoHighLevel (ou Zapier/Make) para onde a aplicação
  // será enviada quando o usuário concluir o formulário.
  // Deixe em branco para apenas logar no console (útil para testar).
  const LEAD_SUBMIT_URL = ''; // Ex: 'https://services.leadconnectorhq.com/hooks/xxxx'

  const TRACKING_CONFIG = {
    ga4_id: '', // Ex: 'G-XXXXXXXXXX'
    meta_pixel_id: '', // Ex: '1234567890'
    custom_webhook: '' // Ex: 'https://hooks.zapier.com/...' — espelho opcional de eventos
  };

  const STORAGE_KEY = 'operacao50k_funnel_state_v1';

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
  var liveRegion = document.getElementById('funnel-live-region');
  var submitted = false;

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
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
        currentIndex: state.currentIndex,
        answers: state.answers
      }));
    } catch (e) { /* sessionStorage indisponível — segue sem persistência */ }
  }

  function loadState() {
    try {
      var raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function clearState() {
    try { sessionStorage.removeItem(STORAGE_KEY); } catch (e) { /* noop */ }
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
    (children || []).forEach(function (child) {
      if (child) node.appendChild(child);
    });
    return node;
  }

  function renderProgress(container) {
    var total = steps.length;
    var current = state.currentIndex + 1;
    var pct = Math.round((current / total) * 100);
    var wrap = el('div', { class: 'funnel-progress' });
    var barOuter = el('div', {
      class: 'funnel-progress-track',
      role: 'progressbar',
      'aria-valuenow': String(pct),
      'aria-valuemin': '0',
      'aria-valuemax': '100',
      'aria-label': 'Progresso da aplicação'
    });
    var barInner = el('div', { class: 'funnel-progress-fill' });
    barInner.style.width = pct + '%';
    barOuter.appendChild(barInner);
    var label = el('p', { class: 'funnel-progress-label', text: 'Etapa ' + current + ' de ' + total });
    wrap.appendChild(barOuter);
    wrap.appendChild(label);
    container.appendChild(wrap);
  }

  function fieldValue(fieldId) {
    return state.answers[fieldId] !== undefined ? state.answers[fieldId] : '';
  }

  function renderField(field, errors) {
    var fieldError = errors && errors.find(function (e) { return e.fieldId === field.id; });
    var wrap = el('div', { class: 'funnel-field' + (fieldError ? ' funnel-field-error' : '') });
    var labelText = field.label + (field.required ? ' *' : ' (opcional)');
    var describedBy = [];
    if (field.hint) describedBy.push(field.id + '-hint');
    if (fieldError) describedBy.push(field.id + '-error');

    var label = el('label', { for: field.id, class: 'funnel-label', text: labelText });
    wrap.appendChild(label);

    if (field.hint) {
      wrap.appendChild(el('p', { id: field.id + '-hint', class: 'funnel-hint', text: field.hint }));
    }

    var input;
    if (field.type === 'select') {
      input = el('select', {
        id: field.id,
        name: field.id,
        class: 'funnel-input',
        'aria-required': field.required ? 'true' : 'false'
      });
      input.appendChild(el('option', { value: '', text: 'Selecione uma opção' }));
      field.options.forEach(function (opt) {
        var optionEl = el('option', { value: opt.value, text: opt.label });
        if (fieldValue(field.id) === opt.value) optionEl.setAttribute('selected', 'selected');
        input.appendChild(optionEl);
      });
    } else if (field.type === 'radio') {
      input = el('div', { class: 'funnel-radio-group', role: 'radiogroup', 'aria-labelledby': field.id + '-legend' });
      field.options.forEach(function (opt, i) {
        var optId = field.id + '-' + i;
        var radioWrap = el('div', { class: 'funnel-radio-option' });
        var radio = el('input', {
          type: 'radio',
          id: optId,
          name: field.id,
          value: opt.value
        });
        if (fieldValue(field.id) === opt.value) radio.checked = true;
        var radioLabel = el('label', { for: optId, text: opt.label });
        radioWrap.appendChild(radio);
        radioWrap.appendChild(radioLabel);
        input.appendChild(radioWrap);
      });
    } else if (field.type === 'textarea') {
      input = el('textarea', {
        id: field.id,
        name: field.id,
        class: 'funnel-input funnel-textarea',
        rows: '3',
        placeholder: field.placeholder || '',
        maxlength: field.maxLength ? String(field.maxLength) : ''
      });
      input.value = fieldValue(field.id);
    } else {
      input = el('input', {
        type: field.type,
        id: field.id,
        name: field.id,
        class: 'funnel-input',
        placeholder: field.placeholder || '',
        autocomplete: field.autocomplete || 'off'
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

  function renderReviewScreen(container) {
    var box = el('div', { class: 'funnel-review' });
    box.appendChild(el('h3', { class: 'funnel-step-title', text: 'Revise suas respostas' }));
    box.appendChild(el('p', { class: 'funnel-hint', text: 'Confira antes de enviar. Você pode voltar e editar qualquer etapa.' }));

    steps.forEach(function (step, index) {
      if (step.isTrustScreen || !step.fields.length) return;
      step.fields.forEach(function (field) {
        var value = fieldValue(field.id);
        if (!value) return;
        var displayValue = value;
        if (field.type === 'select' || field.type === 'radio') {
          var opt = field.options.find(function (o) { return o.value === value; });
          if (opt) displayValue = opt.label;
        }
        var row = el('div', { class: 'funnel-review-row' });
        row.appendChild(el('span', { class: 'funnel-review-label', text: field.label }));
        row.appendChild(el('span', { class: 'funnel-review-value', text: displayValue }));
        var editBtn = el('button', {
          type: 'button',
          class: 'funnel-review-edit',
          text: 'Editar',
          'aria-label': 'Editar resposta: ' + field.label,
          onclick: function () { goToStep(index); }
        });
        row.appendChild(editBtn);
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

    if (step.isTrustScreen) {
      renderTrustScreen(step, form);
    } else {
      form.appendChild(el('h3', { class: 'funnel-step-title', text: step.title }));
      step.fields.forEach(function (field) {
        form.appendChild(renderField(field, []));
      });
    }

    var isLastContentStep = state.currentIndex === steps.length - 1;

    if (isLastContentStep) {
      renderReviewScreen(form);
    }

    var nav = el('div', { class: 'funnel-nav' });
    if (state.currentIndex > 0) {
      nav.appendChild(el('button', {
        type: 'button',
        class: 'funnel-btn funnel-btn-ghost',
        text: 'Voltar',
        onclick: function () { goBack(); }
      }));
    }

    var nextLabel = isLastContentStep ? 'Enviar aplicação' : (step.isTrustScreen ? 'Continuar' : 'Avançar');
    var nextBtn = el('button', {
      type: 'submit',
      class: 'funnel-btn funnel-btn-primary',
      text: nextLabel
    });
    nav.appendChild(nextBtn);
    form.appendChild(nav);

    form.addEventListener('submit', function (evt) {
      evt.preventDefault();
      handleAdvance(isLastContentStep, nextBtn);
    });

    card.appendChild(form);
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
      } else {
        var el2 = document.getElementById(field.id);
        value = el2 ? el2.value.trim() : '';
      }
      if (!value) {
        errors.push({ fieldId: field.id, message: 'Este campo é obrigatório.' });
        trackEvent('field_error', { step_id: step.id, field_id: field.id, error_type: 'required' });
        return;
      }
      if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errors.push({ fieldId: field.id, message: 'Informe um e-mail válido.' });
        trackEvent('field_error', { step_id: step.id, field_id: field.id, error_type: 'invalid_email' });
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
      } else {
        var el2 = document.getElementById(field.id);
        if (el2) state.answers[field.id] = el2.value.trim();
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
    var title = document.createElement('p');
    title.className = 'funnel-error-summary-title';
    title.textContent = 'Erro: corrija os campos abaixo antes de continuar.';
    summary.innerHTML = '';
    summary.appendChild(title);
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

    // Re-render inline errors without wiping already-entered data
    errors.forEach(function (err) {
      var input = document.getElementById(err.fieldId);
      if (!input) return;
      var wrap = input.closest('.funnel-field');
      if (wrap && !wrap.querySelector('.funnel-field-error-msg')) {
        wrap.classList.add('funnel-field-error');
        input.setAttribute('aria-invalid', 'true');
        var msg = document.createElement('p');
        msg.id = err.fieldId + '-error';
        msg.className = 'funnel-field-error-msg';
        msg.setAttribute('role', 'alert');
        msg.textContent = 'Erro: ' + err.message;
        wrap.appendChild(msg);
        input.setAttribute('aria-describedby', ((input.getAttribute('aria-describedby') || '') + ' ' + msg.id).trim());
      }
    });
  }

  function handleAdvance(isSubmitStep, btn) {
    var step = steps[state.currentIndex];

    if (!step.isTrustScreen) {
      var errors = validateStep(step);
      if (errors.length) {
        showErrors(errors);
        return;
      }
      collectStepValues(step);
    }

    showErrors([]);
    saveState();

    var timeOnStep = Math.round((Date.now() - state.stepStartedAt) / 1000);
    trackEvent('step_complete', { step_id: step.id, step_number: state.currentIndex + 1, time_on_step: timeOnStep });

    if (isSubmitStep) {
      submitFunnel(btn);
      return;
    }

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
      renderSuccess();
    }

    if (LEAD_SUBMIT_URL) {
      fetch(LEAD_SUBMIT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(finish).catch(function () {
        // Mesmo se o envio falhar, não perdemos os dados: seguem no console
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

  function renderSuccess() {
    var s = FLOW.successScreen;
    root.innerHTML = '';
    var card = el('div', { class: 'funnel-card funnel-success', role: 'status' });
    card.appendChild(el('h3', { class: 'funnel-step-title', text: s.title }));
    card.appendChild(el('p', { class: 'funnel-success-message', text: s.message }));
    var list = el('ul', { class: 'funnel-success-list' });
    s.nextSteps.forEach(function (item) {
      list.appendChild(el('li', { text: item }));
    });
    card.appendChild(list);
    root.appendChild(card);
    card.setAttribute('tabindex', '-1');
    card.focus();
  }

  // =================================================================
  // RETOMAR SESSÃO
  // =================================================================
  function renderResumeBanner(saved) {
    var banner = el('div', { class: 'funnel-resume', role: 'region', 'aria-label': 'Continuar aplicação' });
    banner.appendChild(el('p', { text: 'Você começou a preencher antes. Quer continuar de onde parou?' }));
    var actions = el('div', { class: 'funnel-resume-actions' });
    actions.appendChild(el('button', {
      type: 'button',
      class: 'funnel-btn funnel-btn-primary',
      text: 'Continuar de onde parei',
      onclick: function () {
        state.currentIndex = saved.currentIndex;
        state.answers = saved.answers;
        render();
      }
    }));
    actions.appendChild(el('button', {
      type: 'button',
      class: 'funnel-btn funnel-btn-ghost',
      text: 'Recomeçar',
      onclick: function () {
        clearState();
        state.currentIndex = 0;
        state.answers = {};
        render();
      }
    }));
    banner.appendChild(actions);
    root.appendChild(banner);
  }

  // =================================================================
  // INICIALIZAÇÃO
  // =================================================================
  function init() {
    if (!root) return;

    trackEvent('page_view', { url: window.location.href, referrer: document.referrer });

    var saved = loadState();
    if (saved && saved.currentIndex > 0) {
      renderResumeBanner(saved);
    } else {
      render();
    }

    window.addEventListener('beforeunload', function () {
      if (!submitted && state.funnelStartedAt) {
        var lastStep = steps[state.currentIndex];
        trackEvent('funnel_abandon', {
          last_step: lastStep.id,
          time_on_page: Math.round((Date.now() - state.funnelStartedAt) / 1000)
        });
      }
    });

    // CTAs fora do formulário levam até o funil
    document.querySelectorAll('[data-scroll-to-funnel]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var target = document.getElementById('aplicacao');
        if (target) target.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
        var firstField = root.querySelector('input, select, textarea, button');
        if (firstField) window.setTimeout(function () { firstField.focus(); }, 400);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
