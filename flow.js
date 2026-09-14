/**
 * flow.js — Configuração do funil de aplicação da Operação 50K
 * -----------------------------------------------------------------
 * Este arquivo é a FONTE DE VERDADE do formulário. app.js apenas lê
 * esta estrutura e renderiza, valida e navega entre as etapas.
 *
 * Para adicionar/remover/reordenar perguntas, edite apenas este arquivo.
 * Não é necessário tocar em app.js para mudanças de conteúdo do formulário.
 *
 * Estrutura de cada campo (field):
 *   id          — identificador único (usado como chave no payload final)
 *   type        — 'text' | 'tel' | 'email' | 'select' | 'radio' | 'textarea'
 *   label       — texto exibido acima do campo
 *   placeholder — (opcional) texto de exemplo dentro do campo
 *   required    — true/false
 *   hint        — (opcional) texto de ajuda contextual abaixo do label
 *   options     — obrigatório para 'select' e 'radio': [{ value, label }]
 *   autocomplete— (opcional) valor do atributo autocomplete do HTML
 *   maxLength   — (opcional) limite de caracteres para text/textarea
 */

const FLOW = {
  // ---------------------------------------------------------------
  // ETAPAS — ordem inviolável para funil de aplicação:
  // engajamento (sem dados pessoais) → qualificação → dados pessoais
  // ---------------------------------------------------------------
  steps: [
    // ===== BLOCO 1 — ENGAJAMENTO (baixo atrito, zero dados pessoais) =====
    {
      id: 'engajamento-1',
      block: 'engajamento',
      title: 'Vamos começar pela sua experiência com lentes',
      fields: [
        {
          id: 'tempo_dentista',
          type: 'select',
          label: 'Há quanto tempo você é dentista?',
          required: true,
          options: [
            { value: 'menos_2', label: 'Menos de 2 anos' },
            { value: '2_5', label: 'De 2 a 5 anos' },
            { value: '5_10', label: 'De 5 a 10 anos' },
            { value: 'mais_10', label: 'Mais de 10 anos' }
          ]
        },
        {
          id: 'realiza_lentes',
          type: 'radio',
          label: 'Você já realiza lentes em resina?',
          required: true,
          options: [
            { value: 'sim_frequente', label: 'Sim, com frequência' },
            { value: 'sim_pouco', label: 'Sim, mas ainda poucos casos' },
            { value: 'nao_ainda', label: 'Ainda não, mas já domino o básico' }
          ]
        }
      ]
    },
    {
      id: 'engajamento-2',
      block: 'engajamento',
      title: 'Sua operação hoje',
      fields: [
        {
          id: 'casos_mes',
          type: 'select',
          label: 'Quantos casos de lentes você realiza, em média, por mês?',
          required: true,
          options: [
            { value: '0_2', label: '0 a 2 casos' },
            { value: '3_5', label: '3 a 5 casos' },
            { value: '6_10', label: '6 a 10 casos' },
            { value: 'mais_10', label: 'Mais de 10 casos' }
          ]
        },
        {
          id: 'meta_faturamento',
          type: 'select',
          label: 'Qual meta de faturamento com lentes você gostaria de atingir nos próximos 6 a 12 meses?',
          required: true,
          options: [
            { value: 'ate_30k', label: 'Até R$ 30 mil/mês' },
            { value: '30_50k', label: 'De R$ 30 a R$ 50 mil/mês' },
            { value: '50_80k', label: 'De R$ 50 a R$ 80 mil/mês' },
            { value: 'mais_80k', label: 'Mais de R$ 80 mil/mês' }
          ]
        }
      ]
    },

    // ===== BLOCO 2 — QUALIFICAÇÃO =====
    {
      id: 'qualificacao-1',
      block: 'qualificacao',
      title: 'Sua situação financeira atual',
      fields: [
        {
          id: 'faturamento_atual',
          type: 'select',
          label: 'Qual seu faturamento médio mensal atual com lentes?',
          required: true,
          options: [
            { value: 'ate_5k', label: 'Até R$ 5 mil' },
            { value: '5_10k', label: 'De R$ 5 a R$ 10 mil' },
            { value: '10_20k', label: 'De R$ 10 a R$ 20 mil' },
            { value: '20_35k', label: 'De R$ 20 a R$ 35 mil' },
            { value: 'mais_35k', label: 'Mais de R$ 35 mil' }
          ]
        }
      ]
    },
    {
      id: 'qualificacao-2',
      block: 'qualificacao',
      title: 'Como você atende hoje',
      fields: [
        {
          id: 'local_atendimento',
          type: 'radio',
          label: 'Você atende em quê?',
          required: true,
          options: [
            { value: 'clinica_propria', label: 'Clínica própria' },
            { value: 'sala_coworking', label: 'Sala alugada ou coworking' },
            { value: 'clinica_terceiros', label: 'Clínica de terceiros' }
          ]
        },
        {
          id: 'autonomia_captacao',
          type: 'radio',
          label: 'Você tem autonomia para captar e atender seus próprios pacientes?',
          required: true,
          options: [
            { value: 'sim_total', label: 'Sim, totalmente' },
            { value: 'sim_parcial', label: 'Parcialmente' },
            { value: 'nao', label: 'Não, dependo de terceiros para isso' }
          ]
        }
      ]
    },
    {
      id: 'qualificacao-3',
      block: 'qualificacao',
      title: 'O que trava seu crescimento',
      fields: [
        {
          id: 'maior_gargalo',
          type: 'radio',
          label: 'Hoje, qual é o seu maior gargalo para crescer com lentes?',
          required: true,
          options: [
            { value: 'atrair_pacientes', label: 'Atrair pacientes qualificados' },
            { value: 'converter_orcamentos', label: 'Converter orçamentos em fechamento' },
            { value: 'tempo_agenda', label: 'Falta de tempo / agenda desorganizada' },
            { value: 'processo_comercial', label: 'Não ter um processo comercial estruturado' },
            { value: 'precificacao', label: 'Precificação e valorização do caso' },
            { value: 'outro', label: 'Outro' }
          ]
        }
      ]
    },
    {
      id: 'qualificacao-4',
      block: 'qualificacao',
      title: 'Suas tentativas anteriores',
      fields: [
        {
          id: 'ja_investiu',
          type: 'radio',
          label: 'Você já investiu em tráfego pago, agência ou mentoria para crescer com lentes?',
          required: true,
          options: [
            { value: 'sim_nao_funcionou', label: 'Sim, mas não trouxe o resultado esperado' },
            { value: 'sim_parcial', label: 'Sim, trouxe algum resultado, mas não sustentável' },
            { value: 'nao_ainda', label: 'Ainda não investi em nada disso' }
          ]
        },
        {
          id: 'o_que_aconteceu',
          type: 'textarea',
          label: 'Se já investiu, o que aconteceu? (opcional)',
          required: false,
          maxLength: 400,
          hint: 'Conte em poucas linhas — isso nos ajuda a entender seu histórico antes da call.'
        }
      ]
    },
    {
      id: 'qualificacao-5',
      block: 'qualificacao',
      title: 'Sua estrutura de equipe',
      fields: [
        {
          id: 'tem_recepcao',
          type: 'radio',
          label: 'Você já possui alguém na recepção/comercial hoje?',
          required: true,
          options: [
            { value: 'sim', label: 'Sim' },
            { value: 'nao', label: 'Não, ainda faço tudo sozinho(a)' },
            { value: 'parcial', label: 'Tenho apoio parcial (ex: alguém que ajuda em outras funções)' }
          ]
        },
        {
          id: 'disposto_investir',
          type: 'radio',
          label: 'Se aprovado, você está disposto(a) a investir na estruturação e no crescimento da sua operação?',
          required: true,
          options: [
            { value: 'sim', label: 'Sim, esse é meu momento' },
            { value: 'talvez', label: 'Preciso entender melhor antes de decidir' },
            { value: 'nao', label: 'Não é o momento' }
          ]
        }
      ]
    },

    // ===== TELA DE CONFIANÇA — antes de pedir dados pessoais =====
    {
      id: 'confianca',
      block: 'confianca',
      title: 'Só mais um passo',
      isTrustScreen: true,
      trustMessage: {
        why: 'Pedimos seu contato para que nosso time analise sua aplicação com calma e te retorne pessoalmente — não é usado para nenhuma outra finalidade.',
        what: 'Se sua aplicação for aprovada, alguém do time do Instituto Bulhões entra em contato por WhatsApp em até 48h úteis para agendar sua call.',
        privacy: 'Seus dados não são compartilhados com terceiros e você pode pedir a remoção a qualquer momento.'
      },
      fields: []
    },

    // ===== BLOCO 3 — DADOS PESSOAIS (por último) =====
    {
      id: 'dados-1',
      block: 'dados',
      title: 'Seus dados de contato',
      fields: [
        {
          id: 'nome_completo',
          type: 'text',
          label: 'Nome completo',
          required: true,
          autocomplete: 'name',
          placeholder: 'Seu nome completo'
        },
        {
          id: 'whatsapp',
          type: 'tel',
          label: 'WhatsApp',
          required: true,
          autocomplete: 'tel',
          placeholder: '(11) 91234-5678',
          hint: 'Com DDD. É por aqui que nosso time vai te chamar.'
        }
      ]
    },
    {
      id: 'dados-2',
      block: 'dados',
      title: 'Últimos detalhes',
      fields: [
        {
          id: 'instagram',
          type: 'text',
          label: 'Instagram profissional',
          required: true,
          placeholder: '@seuusuario',
          hint: 'Usamos para conhecer um pouco do seu trabalho antes da call.'
        },
        {
          id: 'cidade_estado',
          type: 'text',
          label: 'Cidade / Estado',
          required: true,
          autocomplete: 'address-level2',
          placeholder: 'Ex: Belo Horizonte / MG'
        }
      ]
    }
  ],

  // ---------------------------------------------------------------
  // TELA FINAL (sucesso)
  // ---------------------------------------------------------------
  successScreen: {
    title: 'Aplicação recebida.',
    message: 'Nosso time vai analisar suas respostas com calma. Se sua operação tiver aderência ao momento da turma fundadora, alguém do Instituto Bulhões te chama no WhatsApp em até 48h úteis para agendar sua call.',
    nextSteps: [
      'Fique de olho no WhatsApp que você cadastrou — inclusive em números que não estão salvos.',
      'Aproveite para listar, por escrito, seus 2 ou 3 maiores gargalos hoje — isso deixa a call mais produtiva.',
      'Vagas da turma fundadora são limitadas a 5 dentistas. Aplicações são analisadas por ordem de chegada e aderência.'
    ]
  },

  // ---------------------------------------------------------------
  // TELA DE DESQUALIFICAÇÃO — desativada nesta V1 (MVP)
  // ---------------------------------------------------------------
  // O briefing estratégico (seção 17) instrui explicitamente a NÃO
  // automatizar rejeições definitivas nesta primeira versão — os
  // critérios de pontuação ainda serão desenhados com o time comercial.
  // A estrutura abaixo fica pronta para uso futuro: para ativar,
  // adicione lógica de verificação em app.js (função checkDisqualify)
  // comparando FLOW.disqualifyScreen.rules contra FLOW.answers.
  disqualifyScreen: {
    enabled: false,
    title: 'Ainda não é o momento ideal',
    message: 'Pelo que você nos contou, a Operação 50K provavelmente não é o próximo passo certo agora — mas isso não significa que não possa ser no futuro.',
    alternative: {
      label: 'Conheça o Universo das Lentes Online',
      url: '#'
    }
  }
};
