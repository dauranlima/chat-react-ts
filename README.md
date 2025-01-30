# D-Chat - Chat Application

Um aplicativo de chat moderno construído com React, TypeScript e Tailwind CSS.

## 🚀 Funcionalidades

- 💬 Chat em tempo real
- 🔐 Sistema de autenticação (login/registro)
- 📎 Suporte para anexos (imagens e documentos)
- 😊 Seletor de emojis
- 🔍 Busca de conversas
- 📱 Design responsivo
- 👤 Gerenciamento de contatos

## 🛠️ Tecnologias Utilizadas

- [React](https://reactjs.org/) - Biblioteca JavaScript para construção de interfaces
- [TypeScript](https://www.typescriptlang.org/) - Superset JavaScript com tipagem estática
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS utilitário
- [React Router](https://reactrouter.com/) - Roteamento
- [Formik](https://formik.org/) - Gerenciamento de formulários
- [Yup](https://github.com/jquense/yup) - Validação de esquemas
- [Emoji Picker React](https://github.com/ealush/emoji-picker-react) - Seletor de emojis

## 📦 Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/d-chat.git

# Entre no diretório
cd d-chat

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

## 🏗️ Estrutura do Projeto

```
src/
├── components/        # Componentes reutilizáveis
├── layouts/          # Layouts da aplicação
├── pages/           # Páginas/Rotas
└── assets/          # Recursos estáticos
```

### Principais Componentes

- `InfoUser`: Exibe informações do usuário atual
- `AuthLayout`: Layout para páginas de autenticação
- `MainLayout`: Layout principal do chat
- `Login`: Página de login
- `Register`: Página de registro
- `Chat`: Componente principal do chat

## 🔒 Autenticação

O sistema inclui:
- Registro com nome, email e senha
- Login com email e senha
- Validação de formulários
- Feedback visual de erros

## 💭 Chat

Funcionalidades do chat:
- Lista de contatos
- Mensagens em tempo real
- Suporte para emojis
- Upload de arquivos (imagens: PNG, JPEG, JPG)
- Upload de documentos (PDF, DOC, DOCX, TXT)
- Indicadores de status de mensagem
- Interface responsiva

## 🎨 UI/UX

- Design moderno e minimalista
- Feedback visual para ações do usuário
- Layouts adaptáveis para desktop e mobile
- Temas consistentes e acessíveis

## 🤝 Contribuindo

1. Faça um Fork do projeto
2. Crie uma Branch para sua Feature (`git checkout -b feature/AmazingFeature`)
3. Faça o Commit das suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Faça o Push para a Branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request