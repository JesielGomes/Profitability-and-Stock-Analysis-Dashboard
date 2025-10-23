// Importa o React para fornecer tipos para manipuladores de eventos como `React.ChangeEvent`.
// Essencial para garantir a segurança de tipos em componentes que lidam com eventos de formulário.
import React from 'react';

// Define os tipos possíveis para o custo de frete. Limita as opções a 'fixed' (valor fixo em R$) 
// ou 'percentage' (valor percentual sobre a venda), evitando erros de digitação.
export type FreightCostType = 'fixed' | 'percentage';

// Define os temas de aparência disponíveis para a aplicação.
// Usar um tipo aqui garante que apenas valores válidos ('light' ou 'dark') possam ser usados.
export type Theme = 'light' | 'dark';

// Interface que descreve a estrutura completa do estado do formulário.
// Cada propriedade corresponde a um campo de entrada na interface do usuário.
// O tipo `number | ''` é usado para campos numéricos para permitir que o campo fique vazio sem causar erros.
export interface FormState {
    productImage: string | File; // Pode ser uma string vazia ou um objeto File.
    productName: string;
    supplierName: string;
    supplierContact: string;
    stockQuantity: number | '';
    unitCost: number | '';
    sellingPrice: number | '';
    taxRate: number | '';
    commissionRate: number | '';
    freightCost: number | '';
    freightCostType: FreightCostType; // Usa o tipo definido acima.
    laborCost: number | '';
    rentCost: number | '';
    depreciationCost: number | '';
    otherFixedCosts: number | '';
}

// Interface que define a estrutura do conteúdo exibido no modal de informações.
// Garante que cada modal terá um título, uma fórmula e uma explicação consistentes.
export interface InfoContent {
    title: string;
    formula: string;
    explanation: string;
}

// Interface para a configuração de cada campo de input renderizado dinamicamente.
// Isso permite criar os formulários de forma programática, reduzindo a repetição de código.
export interface InputConfig {
    name: keyof FormState; // Garante que o nome do input corresponda a uma chave da interface FormState.
    label: string; // O texto exibido para o usuário.
    type: string; // O tipo do input HTML (ex: 'text', 'number', 'file').
    value?: string | number; // O valor atual do campo.
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; // A função a ser chamada quando o valor muda.
    min?: number; // Valor mínimo para inputs numéricos.
    step?: number; // Incremento para inputs numéricos.
}