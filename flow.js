/**
 * flow.js — Configuração do funil de aplicação da Operação 50K
 * -----------------------------------------------------------------
 * Fonte de verdade do formulário (agora exibido em pop-up).
 * app.js lê esta estrutura e renderiza, valida e navega.
 *
 * ORDEM (inviolável para funil de aplicação):
 * engajamento (zero dados pessoais) → qualificação → confiança → dados pessoais
 *
 * Nota: o documento de copy original do cliente lista nome/WhatsApp/Instagram
 * como as 3 primeiras perguntas. Foram reordenadas para o final a pedido
 * explícito do cliente, seguindo a boa prática de funil de aplicação.
 */

const FLOW = {
  steps: [
    // ===== BLOCO 1 — ENGAJAMENTO =====
    {
      id: 'engajamento-1',
      block: 'engajamento',
      title: 'Seu momento com lentes',
      fields: [
        {
          id: 'momento_lentes',
          type: 'radio',
          label: 'Qual dessas opções melhor representa seu momento com lentes?',
          required: true,
          options: [
            { value: 'ainda_nao', label: 'Ainda não realizo lentes' },
            { value: 'primeiros_casos', label: 'Já realizei meus primeiros casos' },
            { value: 'alguns_por_mes', label: 'Realizo alguns casos por mês' },
            { value: 'frequente', label: 'Já realizo lentes com frequência' }
          ]
        }
      ]
    },
    {
      id: 'engajamento-2',
      block: 'engajamento',
      title: 'Seu objetivo',
      fields: [
        {
          id: 'objetivo_6_meses',
          type: 'textarea',
          label: 'Qual é o seu principal objetivo para os próximos 6 meses?',
          required: true,
          maxLength: 400
        }
      ]
    },

    // ===== BLOCO 2 — QUALIFICAÇÃO =====
    {
      id: 'qualificacao-1',
      block: 'qualificacao',
      title: 'Seu faturamento hoje',
      fields: [
        {
          id: 'faturamento_atual',
          type: 'select',
          label: 'Qual é o seu faturamento médio mensal hoje?',
          required: true,
          options: [
            { value: 'ate_5k', label: 'Até R$ 5 mil' },
            { value: '5_10k', label: 'R$ 5 mil a R$ 10 mil' },
            { value: '10_20k', label: 'R$ 10 mil a R$ 20 mil' },
            { value: '20_30k', label: 'R$ 20 mil a R$ 30 mil' },
            { value: '30_50k', label: 'R$ 30 mil a R$ 50 mil' },
            { value: 'acima_50k', label: 'Acima de R$ 50 mil' }
          ]
        }
      ]
    },
    {
      id: 'qualificacao-2',
      block: 'qualificacao',
      title: 'Seu principal desafio',
      fields: [
        {
          id: 'desafio_principal',
          type: 'checkbox-group',
          label: 'Qual é o principal desafio que impede você de crescer com lentes hoje?',
          hint: 'Você pode selecionar mais de uma opção.',
          required: true,
          options: [
            { value: 'melhorar_casos', label: 'Melhorar meus casos' },
            { value: 'atrair_pacientes', label: 'Atrair mais pacientes' },
            { value: 'posicionamento', label: 'Melhorar meu posicionamento/Instagram' },
            { value: 'trafego', label: 'Fazer o tráfego gerar resultado' },
            { value: 'comercial', label: 'Melhorar meu processo comercial e fechamento' },
            { value: 'nao_sei', label: 'Não sei exatamente o que preciso mudar' }
          ]
        }
      ]
    },
    {
      id: 'qualificacao-3',
      block: 'qualificacao',
      title: 'Sua disposição para investir',
      fields: [
        {
          id: 'disposto_investir',
          type: 'radio',
          label: 'Se entendermos que a Operação 50K faz sentido para o seu momento, você está disposto(a) a investir no crescimento da sua operação?',
          required: true,
          options: [
            { value: 'sim_pronto', label: 'Sim, estou pronto(a) para investir' },
            { value: 'sim_entender', label: 'Sim, mas preciso entender melhor o programa e as condições' },
            { value: 'depende', label: 'Depende do investimento' },
            { value: 'nao', label: 'Não tenho disponibilidade para investir neste momento' }
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
        what: 'Se identificarmos alinhamento entre o seu momento e a proposta do programa, alguém do time do Instituto Bulhões entra em contato por WhatsApp para avançar para uma conversa.',
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
          label: 'Qual é o seu nome completo?',
          required: true,
          autocomplete: 'name',
          placeholder: 'Seu nome completo'
        },
        {
          id: 'whatsapp',
          type: 'tel',
          label: 'Qual é o seu WhatsApp?',
          required: true,
          autocomplete: 'tel',
          placeholder: '(11) 91234-5678'
        }
      ]
    },
    {
      id: 'dados-2',
      block: 'dados',
      title: 'Último passo',
      fields: [
        {
          id: 'instagram',
          type: 'text',
          label: 'Qual é o seu @ no Instagram?',
          required: true,
          placeholder: '@seuusuario'
        }
      ]
    }
  ],

  successScreen: {
    title: 'Aplicação recebida.',
    message: 'Nosso time vai analisar suas respostas com calma. Se identificarmos alinhamento entre o seu momento e a proposta da Operação 50K, você recebe um retorno no WhatsApp para avançar para uma conversa.',
    nextSteps: [
      'Fique de olho no WhatsApp que você cadastrou — inclusive em números que não estão salvos.',
      'Vagas da turma fundadora são limitadas a 5 dentistas. Aplicações são analisadas por ordem de chegada e aderência.'
    ]
  },

  // Desativada nesta V1 — ver nota em README/app.js
  disqualifyScreen: {
    enabled: false,
    title: 'Ainda não é o momento ideal',
    message: 'Pelo que você nos contou, a Operação 50K provavelmente não é o próximo passo certo agora — mas isso não significa que não possa ser no futuro.',
    alternative: { label: 'Conheça o Universo das Lentes Online', url: '#' }
  }
};
