/**
 * flow.js — Configuração do funil de aplicação da Operação 50K
 * -----------------------------------------------------------------
 * Fonte de verdade do formulário (exibido em pop-up).
 * app.js lê esta estrutura e renderiza, valida e navega.
 *
 * ORDEM: engajamento (zero dados pessoais) → qualificação → dados pessoais.
 * V2 (simplificada a pedido do cliente): sem etapa de objetivo aberto,
 * sem tela de confiança separada, sem tela de revisão final — Faturamento
 * como alternativas visíveis (não dropdown), Instagram junto dos dados
 * de contato num único passo.
 */

const FLOW = {
  steps: [
    // ===== ENGAJAMENTO =====
    {
      id: 'engajamento-1',
      block: 'engajamento',
      group: 'Momento',
      title: 'Qual dessas opções melhor representa seu momento com lentes?',
      subtitle: 'Selecione a opção que mais combina com você hoje.',
      fields: [
        {
          id: 'momento_lentes',
          type: 'radio',
          label: 'Momento com lentes',
          hideLabel: true,
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

    // ===== QUALIFICAÇÃO =====
    {
      id: 'qualificacao-1',
      block: 'qualificacao',
      group: 'Faturamento',
      title: 'Qual é o seu faturamento médio mensal hoje?',
      subtitle: 'Selecione a faixa mais próxima do seu momento atual.',
      fields: [
        {
          id: 'faturamento_atual',
          type: 'radio',
          label: 'Faturamento médio mensal',
          hideLabel: true,
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
      group: 'Desafio',
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
      group: 'Investimento',
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

    // ===== DADOS PESSOAIS (por último, tudo num único passo) =====
    {
      id: 'dados-1',
      block: 'dados',
      group: 'Contato',
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
        },
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
      'Fique de olho no WhatsApp que você cadastrou, inclusive em números que não estão salvos.',
      'Vagas da turma fundadora são limitadas a 5 dentistas. Aplicações são analisadas por ordem de chegada e aderência.'
    ]
  },

  // Desativada nesta V1 — ver nota em README/app.js
  disqualifyScreen: {
    enabled: false,
    title: 'Ainda não é o momento ideal',
    message: 'Pelo que você nos contou, a Operação 50K provavelmente não é o próximo passo certo agora. Mas isso não significa que não possa ser no futuro.',
    alternative: { label: 'Conheça o Universo das Lentes Online', url: '#' }
  }
};
