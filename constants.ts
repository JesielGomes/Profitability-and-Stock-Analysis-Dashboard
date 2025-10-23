
import { FormState, InfoContent } from './types';

/**
 * Define o estado inicial para o formulário da aplicação.
 * É usado na primeira renderização ou quando os dados do localStorage não podem ser carregados.
 * Garante que a aplicação inicie com um estado previsível e consistente.
 */
export const initialFormData: FormState = {
    productImage: '',
    productName: '',
    supplierName: '',
    supplierContact: '',
    stockQuantity: '',
    unitCost: '',
    sellingPrice: '',
    taxRate: '',
    commissionRate: '',
    freightCost: '',
    freightCostType: 'fixed',
    laborCost: '',
    rentCost: '',
    depreciationCost: '',
    otherFixedCosts: '',
};

/**
 * Armazena o conteúdo didático (título, fórmula, explicação) para cada indicador.
 * Este objeto serve como uma fonte de dados centralizada para os modais de informação ('i' pop-ups).
 * A chave de cada entrada corresponde ao 'key' do resultado no componente `App.tsx`,
 * permitindo uma busca fácil do conteúdo a ser exibido.
 */
export const infoContent: { [key: string]: InfoContent } = {
    contributionMargin: {
        title: "Margem de Contribuição (MC)",
        formula: "Preço de Venda - (Custo Unitário + Custos Variáveis)",
        explanation: "É o valor que sobra da venda de um produto após subtrair os custos diretos e variáveis. Esse montante 'contribui' para pagar os custos fixos e, depois disso, gerar lucro. É um indicador crucial para decisões de preço e análise de viabilidade do produto."
    },
    grossProfit: {
        title: "Lucro Bruto (R$)",
        formula: "Margem de Contribuição - Custos Fixos Rateados",
        explanation: "Representa o lucro real obtido em cada unidade vendida, após a cobertura de TODOS os custos (variáveis e fixos). É a medida final da rentabilidade de uma transação unitária."
    },
    netMargin: {
        title: "Margem Líquida (%)",
        formula: "(Lucro Bruto / Preço de Venda) * 100",
        explanation: "Indica o percentual de lucro líquido em relação ao preço de venda. Uma margem líquida de 20%, por exemplo, significa que a cada R$100 de venda, R$20 são lucro puro. É um indicador chave da eficiência operacional e da saúde financeira."
    },
    markup: {
        title: "Mark-up (%)",
        formula: "((Preço de Venda - Custo Total) / Custo Total) * 100",
        explanation: "É o percentual que a empresa adiciona sobre o custo total de um produto para chegar ao preço de venda. Enquanto a margem analisa o lucro a partir do preço de venda, o mark-up mostra o quanto o preço está acima do custo."
    },
    totalStockCost: {
        title: "Custo Total do Estoque",
        formula: "Quantidade em Estoque * Custo Unitário",
        explanation: "Representa o valor total investido que está imobilizado no estoque. É o 'dinheiro parado' em forma de produtos, aguardando a venda. Gerenciar este valor é vital para o fluxo de caixa."
    },
    potentialGrossSale: {
        title: "Venda Bruta Potencial",
        formula: "Quantidade em Estoque * Preço de Venda Unitário",
        explanation: "É a receita máxima que pode ser gerada se todo o estoque atual for vendido pelo preço de venda definido. Serve como uma meta de faturamento para o estoque existente."
    },
    totalPotentialProfit: {
        title: "Lucro Potencial Total",
        formula: "Venda Bruta Potencial - Custo Total do Estoque",
        explanation: "Indica o lucro a ser realizado com a venda completa do estoque, considerando apenas o custo de aquisição do produto. Este valor não deduz outros custos (variáveis e fixos). É uma medida do retorno bruto sobre o investimento no estoque."
    }
};