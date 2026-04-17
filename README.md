# Ateliê Nós de Afeto

## Pré-requisitos

- Node.js 20+
- MySQL 8+

---

## Crie uma conexão com o banco de dados localmente

## START MySql no XAMPP

## Backend

```bash

cd back-atelie-no-de-afeto

>>>>>>>>   npm install

```

Crie `.env` na pasta root:

```env
Adicione dentro do arquivo:

DATABASE_URL="mysql://usuario:senha@localhost:3306/nos_de_afeto"
JWT_SECRET="sua_chave_secreta"
JWT_EXPIRES_IN="7d"
PORT=3333
BASE_URL="http://localhost:3333"


```

```bash
npx prisma migrate dev
npx prisma generate
npx prisma db seed
npm run dev
```

---

## Frontend

```bash

cd front-atelie-no-de-afeto
npm install

```

Crie `.env`:

```env
Adicione dentro do arquivo:

REACT_APP_API_URL=http://localhost:3333/api


```

```bash

npm start

```

---

## Acesso

| URL | |
|---|---|
| Frontend | http://localhost:3000 |
| Backend  | http://localhost:3333 |

**Admin padrão:** `admin@nosdeafeto.com` / `Admin123`
