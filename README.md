````markdown
# 🗳️ Polls API

Uma API RESTful para criação e gerenciamento de enquetes, com suporte a votos, visibilidade restrita, datas de expiração e autenticação de usuários.

---

## 🚀 Tecnologias

- **Node.js**
- **Express**
- **MongoDB + Mongoose**
- **JWT (autenticação)**
- **Socket.IO** *(opcional para tempo real)*
- **dotenv** (variáveis de ambiente)

---

## 📦 Instalação

Clone o repositório e instale as dependências:

```bash
git clone https://github.com/seu-usuario/polls-api.git
cd polls-api
npm install
````

---

## ⚙️ Configuração

Crie um arquivo `.env` na raiz do projeto com as variáveis:

```
PORT=3000
MONGO_URI=mongodb://localhost:27017/polls
JWT_SECRET=sua_chave_secreta
```

---

## ▶️ Rodando o servidor

```bash
npm run dev
```

Ou, se não estiver usando `nodemon`:

```bash
node index.js
```

---

## 📚 Rotas principais

### 🔐 Autenticação

| Método | Rota             | Descrição                       |
| ------ | ---------------- | ------------------------------- |
| POST   | `/auth/register` | Registrar usuário               |
| POST   | `/auth/login`    | Fazer login (retorna token JWT) |

---

### 📊 Enquetes (Polls)

| Método | Rota                 | Descrição                          |
| ------ | -------------------- | ---------------------------------- |
| POST   | `/polls`             | Criar uma nova enquete             |
| GET    | `/polls/:id`         | Ver detalhes de uma enquete        |
| PATCH  | `/polls/:id/vote`    | Votar em uma opção                 |
| GET    | `/polls/:id/results` | Ver resultado da enquete (criador) |
| DELETE | `/polls/:id`         | Deletar enquete (criador)          |

---

### 📌 Exemplo de body para criar enquete

```json
{
  "title": "Qual sua linguagem favorita?",
  "desc": "(Opcional)",
  "options": [
    { "text": "JavaScript" },
    { "text": "Python" },
    { "text": "C#" }
  ],
  "expiresAt": "2025-12-31T23:59:59Z",
  "privacy": false,
  "visibleBy": [{id1}, {id2}] // Somente se for privado
}
```

---

### 🗳️ Exemplo de voto

```json
{
  "option": 2
}
```

> Isso vota na **2ª opção**. A contagem começa em 1 no front-end, mas o back-end converte para índice com `option - 1`.

---

## 🔐 Regras de voto e visibilidade

* Se `privacy = false`, qualquer usuário autenticado pode votar.
* Se `privacy = true`, somente usuários listados no campo `visibleBy` podem votar.
* O sistema impede:

  * Votos duplicados (via `votesID`)
  * Voto após expiração (`expiresAt`)

---

## 🛠️ To-do / Melhorias futuras

* [ ] Adicionar paginação em `/polls`
* [ ] Criar rota para listar todas as enquetes criadas
* [ ] Enviar resultados em tempo real com Socket.IO
* [ ] Front-end para consumir a API
* [ ] Exportar resultados em PDF/CSV

---

## 🧑‍💻 Autor

Desenvolvido por [Samuel Santana](https://github.com/samuelsnnt) 💻

Se quiser colaborar, fique à vontade para abrir uma PR ou issue!
