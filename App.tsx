

import React, { useState, useMemo, useRef, useEffect } from 'react';
// FIX: Import InputConfig to correctly type the input arrays.
import { FormState, InfoContent, FreightCostType, Theme, InputConfig } from './types';
import { initialFormData, infoContent } from './constants';
import { useCalculations } from './hooks/useCalculations';
import { InputBlock } from './components/InputBlock';
import { ResultsBlock } from './components/ResultsBlock';
import { InfoModal } from './components/InfoModal';
import { Header } from './components/Header';
import { ExportButton } from './components/ExportButton';
import { ImagePreview } from './components/ImagePreview';

/**
 * Componente principal da aplicação.
 * Orquestra todos os outros componentes, gerencia o estado global do formulário,
 * os cálculos de rentabilidade e as interações do usuário.
 */
const App: React.FC = () => {
    // ---- ESTADO (STATE) ----

    // Gerencia os dados do formulário. Tenta carregar os dados salvos do localStorage na primeira renderização.
    // Isso melhora a experiência do usuário, permitindo que ele continue de onde parou.
    const [formData, setFormData] = useState<FormState>(() => {
        try {
            const savedData = localStorage.getItem('profitabilityData');
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                // Retorna os dados salvos, mas garante que a imagem do produto não seja persistida.
                return { ...initialFormData, ...parsedData, productImage: '' };
            }
        } catch (error) {
            console.error("Falha ao analisar os dados do localStorage:", error);
        }
        return initialFormData; // Retorna o estado inicial se não houver dados salvos.
    });

    // Gerencia o tema da aplicação (claro ou escuro). Também carrega a preferência do usuário do localStorage.
    const [theme, setTheme] = useState<Theme>(() => {
        const savedTheme = localStorage.getItem('theme') as Theme | null;
        return savedTheme || 'light'; // O tema 'light' é o padrão.
    });

    // Armazena a URL de pré-visualização da imagem do produto. Usado para exibir a imagem sem precisar armazenar o arquivo no estado principal.
    const [productImagePreview, setProductImagePreview] = useState<string | null>(null);

    // Controla a visibilidade do modal de informações.
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Armazena o conteúdo a ser exibido no modal (título, fórmula, explicação).
    const [modalContent, setModalContent] = useState<InfoContent | null>(null);

    // ---- REFERÊNCIAS (REFS) ----

    // Cria uma referência ao elemento do dashboard, necessária para a biblioteca html2pdf capturar o conteúdo a ser exportado.
    const dashboardRef = useRef<HTMLDivElement>(null);

    // ---- HOOKS CUSTOMIZADOS ----

    // Utiliza o hook customizado para realizar todos os cálculos de rentabilidade.
    // Os cálculos são memoizados, ou seja, só são refeitos quando os dados do formulário (formData) mudam.
    const calculations = useCalculations(formData);

    // ---- EFEITOS COLATERAIS (USEEFFECT) ----

    // Salva os dados do formulário no localStorage sempre que `formData` é alterado.
    // Isso garante a persistência dos dados entre as sessões.
    useEffect(() => {
        try {
            const dataToSave = { ...formData };
            delete (dataToSave as any).productImage; // O objeto File não pode ser serializado, então é removido.
            localStorage.setItem('profitabilityData', JSON.stringify(dataToSave));
        } catch (error) {
            console.error("Falha ao salvar no localStorage:", error);
        }
    }, [formData]);

    // Aplica o tema (claro/escuro) ao elemento <html> e o salva no localStorage sempre que `theme` muda.
    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark'); // Remove classes antigas para evitar conflitos.
        root.classList.add(theme); // Adiciona a classe do tema atual.
        root.style.colorScheme = theme; // Garante que a UI do navegador (ex: scrollbars) corresponda ao tema.
        localStorage.setItem('theme', theme);
    }, [theme]);


    // ---- MANIPULADORES DE EVENTOS (HANDLERS) ----

    // Atualiza o estado `formData` quando o valor de um campo de input muda.
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            // Converte o valor para número se o tipo do input for 'number'.
            [name]: type === 'number' ? (value === '' ? '' : parseFloat(value)) : value
        }));
    };

    // Altera o tipo de custo de frete (fixo ou percentual).
    const handleFreightTypeChange = (type: FreightCostType) => {
        setFormData(prev => ({ ...prev, freightCostType: type }));
    };

    // Processa o arquivo de imagem selecionado, cria uma URL de pré-visualização e a armazena no estado.
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setProductImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Abre o modal de informações e define seu conteúdo com base no ícone 'i' que foi clicado.
    const handleInfoClick = (key: keyof typeof infoContent) => {
        setModalContent(infoContent[key]);
        setIsModalOpen(true);
    };

    // Gera e baixa o PDF do dashboard.
    const handleExport = () => {
        const element = dashboardRef.current;
        if (!element) return; // Se a referência não existir, interrompe a função.
        
        // Salva o tema original para restaurá-lo após a exportação.
        const originalTheme = theme;
        // Muda temporariamente para o tema claro para garantir consistência visual no PDF.
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
        document.documentElement.style.colorScheme = 'light';

        const productName = formData.productName || 'Produto';
        const date = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
        const fileName = `Margem_${productName}_${date}.pdf`;

        // Opções de configuração para a biblioteca html2pdf.
        const opt = {
            margin:       0.5,
            filename:     fileName,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { 
                scale: 2,          // Aumenta a resolução da imagem gerada.
                useCORS: true,     // Permite carregar imagens de outras origens.
                logging: false,
                width: 1280,       // Força uma largura para evitar que o layout responsivo quebre no PDF.
                windowWidth: 1280
            },
            jsPDF:        { unit: 'in', format: 'letter', orientation: 'landscape' } // Define o PDF para o modo paisagem.
        };

        // Chama a função da biblioteca, salva o PDF e, em seguida, restaura o tema original.
        (window as any).html2pdf().from(element).set(opt).save().then(() => {
            document.documentElement.classList.remove('light');
            document.documentElement.classList.add(originalTheme);
            document.documentElement.style.colorScheme = originalTheme;
        });
    };

    // ---- DADOS MEMOIZADOS PARA RENDERIZAÇÃO ----

    // `useMemo` é usado aqui para evitar que os arrays de configuração dos inputs sejam recriados a cada renderização.
    // Isso otimiza a performance, pois os componentes filhos que recebem esses arrays não serão re-renderizados desnecessariamente.

    // FIX: Add explicit type InputConfig[] to ensure name property is correctly typed as keyof FormState.
    const metadataInputs: InputConfig[] = useMemo(() => ([
        { name: 'productImage', label: 'Foto do Produto', type: 'file', onChange: handleImageChange },
        { name: 'productName', label: 'Nome do Produto', type: 'text', value: formData.productName, onChange: handleInputChange },
        { name: 'supplierName', label: 'Nome do Fornecedor', type: 'text', value: formData.supplierName, onChange: handleInputChange },
        { name: 'supplierContact', label: 'Contato do Fornecedor', type: 'text', value: formData.supplierContact, onChange: handleInputChange },
        { name: 'stockQuantity', label: 'Quantidade em Estoque', type: 'number', value: formData.stockQuantity, onChange: handleInputChange, min: 0 },
        { name: 'unitCost', label: 'Custo Unitário (R$)', type: 'number', value: formData.unitCost, onChange: handleInputChange, min: 0, step: 0.01 },
        { name: 'sellingPrice', label: 'Preço de Venda Unitário (R$)', type: 'number', value: formData.sellingPrice, onChange: handleInputChange, min: 0, step: 0.01 },
    ]), [formData.productName, formData.supplierName, formData.supplierContact, formData.stockQuantity, formData.unitCost, formData.sellingPrice]);

    // FIX: Add explicit type InputConfig[] to ensure name property is correctly typed as keyof FormState.
    const variableCostInputs: InputConfig[] = useMemo(() => ([
        { name: 'taxRate', label: 'Alíquota de Impostos (%)', type: 'number', value: formData.taxRate, onChange: handleInputChange, min: 0, step: 0.01 },
        { name: 'commissionRate', label: 'Comissão / Taxas (%)', type: 'number', value: formData.commissionRate, onChange: handleInputChange, min: 0, step: 0.01 },
        { name: 'freightCost', label: `Custo de Frete na Entrega (${formData.freightCostType === 'fixed' ? 'R$' : '%'})`, type: 'number', value: formData.freightCost, onChange: handleInputChange, min: 0, step: 0.01 },
    ]), [formData.taxRate, formData.commissionRate, formData.freightCost, formData.freightCostType]);
    
    // FIX: Add explicit type InputConfig[] to ensure name property is correctly typed as keyof FormState.
    const fixedCostInputs: InputConfig[] = useMemo(() => ([
        { name: 'laborCost', label: 'Mão de Obra / Salários (R$)', type: 'number', value: formData.laborCost, onChange: handleInputChange, min: 0, step: 0.01 },
        { name: 'rentCost', label: 'Desp. Adm./Aluguel (R$)', type: 'number', value: formData.rentCost, onChange: handleInputChange, min: 0, step: 0.01 },
        { name: 'depreciationCost', label: 'Depreciação de Equip. (R$)', type: 'number', value: formData.depreciationCost, onChange: handleInputChange, min: 0, step: 0.01 },
        { name: 'otherFixedCosts', label: 'Outras Despesas Fixas (R$)', type: 'number', value: formData.otherFixedCosts, onChange: handleInputChange, min: 0, step: 0.01 },
    ]), [formData.laborCost, formData.rentCost, formData.depreciationCost, formData.otherFixedCosts]);

    // Define os dados a serem exibidos nos blocos de resultados.
    const profitabilityResults = [
        { key: 'contributionMargin', label: 'Margem de Contribuição', value: calculations.contributionMargin, isCurrency: true },
        { key: 'grossProfit', label: 'Lucro Bruto (R$)', value: calculations.grossProfit, isCurrency: true },
        { key: 'netMargin', label: 'Margem Líquida (%)', value: calculations.netMargin, isPercentage: true },
        { key: 'markup', label: 'Mark-up (%)', value: calculations.markup, isPercentage: true },
    ];
    
    const stockResults = [
        { key: 'totalStockCost', label: 'Custo Total do Estoque', value: calculations.totalStockCost, isCurrency: true },
        { key: 'potentialGrossSale', label: 'Venda Bruta Potencial', value: calculations.potentialGrossSale, isCurrency: true },
        { key: 'totalPotentialProfit', label: 'Lucro Potencial Total', value: calculations.totalPotentialProfit, isCurrency: true },
    ];
    
    // ---- RENDERIZAÇÃO DO COMPONENTE ----
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-4 sm:p-6 lg:p-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
                <Header theme={theme} setTheme={setTheme} />
                <main>
                    {/* A div com a ref 'dashboardRef' engloba todo o conteúdo que será exportado para o PDF. */}
                    <div ref={dashboardRef} className="p-4 sm:p-6 bg-white dark:bg-gray-800/50 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700/50">
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                            {/* Coluna de Inputs */}
                            <div className="lg:col-span-3 space-y-6">
                                <InputBlock title="Identificação e Estoque" inputs={metadataInputs} />
                                <InputBlock 
                                    title="Custos Variáveis (por Venda)" 
                                    inputs={variableCostInputs}
                                    freightType={formData.freightCostType}
                                    onFreightTypeChange={handleFreightTypeChange}
                                />
                                <InputBlock title="Custos Fixos Rateados (por Unidade)" inputs={fixedCostInputs} />
                            </div>
                            
                            {/* Coluna de Resultados */}
                            <div className="lg:col-span-2 space-y-6">
                                <ImagePreview src={productImagePreview} />
                                <ResultsBlock title="Indicadores de Rentabilidade Unitária" results={profitabilityResults} onInfoClick={handleInfoClick} />
                                <ResultsBlock title="Indicadores de Gestão de Estoque" results={stockResults} onInfoClick={handleInfoClick} />
                            </div>
                        </div>
                    </div>
                    <ExportButton onExport={handleExport} />
                </main>
            </div>
            {/* Renderização condicional do modal de informações. */}
            {isModalOpen && modalContent && (
                <InfoModal
                    title={modalContent.title}
                    formula={modalContent.formula}
                    explanation={modalContent.explanation}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </div>
    );
};

export default App;