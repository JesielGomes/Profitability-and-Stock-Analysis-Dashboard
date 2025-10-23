
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Procura pelo elemento 'root' no HTML, que servirá como o contêiner principal para a aplicação.
const rootElement = document.getElementById('root');
if (!rootElement) {
  // Lança um erro se o elemento 'root' não for encontrado, pois a aplicação não pode ser montada.
  // Isso previne erros inesperados durante a execução.
  throw new Error("Could not find root element to mount to");
}

// Cria a raiz da aplicação React, utilizando o novo ReactDOM.createRoot API para habilitar funcionalidades concorrentes.
const root = ReactDOM.createRoot(rootElement);

// Renderiza o componente principal <App /> dentro da raiz.
// React.StrictMode é um wrapper que ajuda a identificar potenciais problemas na aplicação durante o desenvolvimento.
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);