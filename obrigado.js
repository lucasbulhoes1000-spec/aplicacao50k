/**
 * obrigado.js — Página de obrigado da Operação 50K
 * -----------------------------------------------------------------
 * Integra com o player da Panda Video para revelar o botão
 * "QUERO CORTAR A FILA" depois que a pessoa assiste a um trecho
 * mínimo do vídeo.
 */
(function () {
  'use strict';

  // =================================================================
  // CONFIGURAÇÃO — preencha com os dados reais antes de publicar
  // =================================================================

  // Painel da Panda Video → Vídeos → abra o vídeo → botão "Embed".
  // library_id = pullzone_name · video_id = video_external_id (um UUID)
  const PANDA_LIBRARY_ID = 'SEU_PULLZONE_NAME';
  const PANDA_VIDEO_ID = 'SEU_VIDEO_EXTERNAL_ID';
  const PANDA_ELEMENT_ID = 'panda-obrigado-video';

  // Segundos assistidos até o botão de prioridade aparecer (combinado: 1 minuto)
  const REVEAL_AFTER_SECONDS = 60;

  // Número de WhatsApp do comercial, formato internacional sem espaços/símbolos.
  // PLACEHOLDER — substitua pelo número real antes de publicar.
  const WHATSAPP_NUMBER = '5500000000000';
  const WHATSAPP_MESSAGE = 'Oi! Acabei de preencher minha aplicação para a Operação 50K e quero cortar a fila para falar com o time.';

  // =================================================================
  var revealed = false;

  function revealButton() {
    if (revealed) return;
    revealed = true;
    var cta = document.getElementById('fila-cta');
    if (cta) cta.hidden = false;
    // eslint-disable-next-line no-console
    console.log('[OBRIGADO] Botão de prioridade revelado após ' + REVEAL_AFTER_SECONDS + 's de vídeo assistido.');
  }

  function setupWhatsAppLink() {
    var link = document.getElementById('fila-cta-link');
    if (!link) return;
    var url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(WHATSAPP_MESSAGE);
    link.setAttribute('href', url);
  }

  function handlePandaEvent(e) {
    if (e.message === 'panda_timeupdate') {
      if (e.isMutedIndicator) return; // evento de autoplay mudo — ignora para não revelar cedo demais
      if (e.currentTime >= REVEAL_AFTER_SECONDS) revealButton();
    }
  }

  function initPandaPlayer() {
    if (typeof window.PandaPlayer === 'undefined') {
      // eslint-disable-next-line no-console
      console.error('[OBRIGADO] Script da Panda Video não carregou. Verifique a conexão ou o bloqueador de anúncios.');
      return;
    }
    // eslint-disable-next-line no-new
    new window.PandaPlayer(PANDA_ELEMENT_ID, {
      library_id: PANDA_LIBRARY_ID,
      video_id: PANDA_VIDEO_ID,
      onReady: function () {
        // eslint-disable-next-line no-console
        console.log('[OBRIGADO] Player Panda pronto.');
      },
      onEvent: handlePandaEvent
    });
  }

  function init() {
    setupWhatsAppLink();

    window.pandascripttag = window.pandascripttag || [];
    window.pandascripttag.push(initPandaPlayer);

    // Fallback: se por algum motivo o player não carregar (bloqueio, erro de
    // configuração), ainda assim revela o botão depois do tempo combinado,
    // para não deixar o lead sem opção de contato.
    window.setTimeout(revealButton, (REVEAL_AFTER_SECONDS + 15) * 1000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
