# Trello Clone

A full-stack Trello clone featuring boards, lists, cards with drag-and-drop reordering, labels, checklists, due dates, comments, and JWT-based authentication with automatic token refresh. Includes a dark/light theme toggle with localStorage persistence. Built as a portfolio project to demonstrate modern full-stack JavaScript development.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 5, Tailwind CSS 3, React Router 6 |
| Drag & Drop | @hello-pangea/dnd |
| HTTP Client | Axios (with interceptors for token refresh) |
| Backend | Node.js, Express 4 |
| Database | PostgreSQL (Neon-compatible via Prisma pg adapter) |
| ORM | Prisma (with @prisma/adapter-pg for serverless drivers) |
| Authentication | JWT (access + refresh tokens), bcryptjs |
| Validation | Zod |
| Testing (server) | Jest, Supertest |
| Testing (client) | Vitest, React Testing Library |
| Testing (E2E) | Playwright |

## Features

- **Authentication** — Register, login, logout with JWT access/refresh tokens
- **Boards** — Create, view, delete boards with custom colors; stats (list count, card count, overdue/due-soon badges)
- **Lists** — Create, rename, reorder, delete lists within boards
- **Cards** — Create, move, reorder cards within and across lists
- **Card Details** — Description, due dates, colored labels, checklists with progress tracking
- **Comments** — Post and delete comments on cards with author name and relative timestamps
- **Drag & Drop** — Full board drag-and-drop for lists and cards with optimistic updates
- **Dark/Light Theme** — Toggle between a dark high-tech aesthetic and a clean light theme; persists in localStorage

## Project Structure

```
trello-clone/
├── client/                     # React single-page application
│   ├── src/
│   │   ├── api/                # Axios HTTP clients
│   │   │   ├── auth.js         #   Auth endpoints (register, login, logout, refresh)
│   │   │   ├── axios.js        #   Axios instance with token interceptors
│   │   │   ├── boards.js       #   Board CRUD endpoints
│   │   │   ├── cards.js        #   Card CRUD endpoints
│   │   │   ├── cardDetails.js  #   Labels, checklists, comments, and items endpoints
│   │   │   └── lists.js        #   List CRUD endpoints
│   │   ├── components/         # Reusable UI components
│   │   │   ├── CardModal.jsx   #   Card detail modal (title, desc, due date, labels, checklists, comments)
│   │   │   ├── CardTile.jsx    #   Card preview tile in list column
│   │   │   ├── DueDateBadge.jsx#   Color-coded due date badge
│   │   │   ├── Header.jsx      #   Top navigation bar with theme toggle and user menu
│   │   │   └── ListColumn.jsx  #   Draggable list column with cards
│   │   ├── context/
│   │   │   ├── AuthContext.jsx  #   Auth state provider (user, tokens)
│   │   │   └── ThemeContext.jsx #   Dark/light theme provider with localStorage persistence
│   │   ├── hooks/
│   │   │   └── useAuth.js      #   Hook for accessing auth context
│   │   ├── pages/
│   │   │   ├── BoardsPage.jsx  #   Dashboard with board grid and stats
│   │   │   ├── BoardView.jsx   #   Board detail with lists and drag-and-drop
│   │   │   ├── LoginPage.jsx   #   Login form
│   │   │   └── RegisterPage.jsx#   Registration form
│   │   ├── __tests__/          #   Vitest unit and component tests
│   │   ├── App.jsx             #   Route definitions
│   │   ├── main.jsx            #   Entry point
│   │   └── index.css           #   Tailwind directives, theme variables, custom styles
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js      #   Custom colors, fonts, animations, dark mode config
│   └── package.json
├── server/                     # Express REST API
│   ├── src/
│   │   ├── controllers/        # Request handlers
│   │   │   ├── authController.js
│   │   │   ├── boardController.js  # Includes board stats aggregation
│   │   │   ├── cardController.js
│   │   │   ├── cardDetailController.js  # Labels, checklists, and comments
│   │   │   └── listController.js
│   │   ├── middleware/         # Express middleware
│   │   │   ├── auth.js         #   JWT verification
│   │   │   └── errorHandler.js #   Global error handler
│   │   ├── prisma/
│   │   │   ├── schema.prisma   #   Database schema (8 models)
│   │   │   └── client.js       #   Prisma client with pg adapter
│   │   ├── routes/             # Express routers
│   │   │   ├── auth.js
│   │   │   ├── boards.js
│   │   │   ├── cards.js
│   │   │   ├── cardDetails.js  #   Includes comment routes
│   │   │   └── lists.js
│   │   ├── __tests__/          # Jest integration tests
│   │   └── index.js            # Server entry point
│   ├── jest.config.js
│   └── package.json
├── e2e/                        # Playwright end-to-end tests
│   ├── tests/
│   │   ├── auth.spec.ts
│   │   ├── boards.spec.ts
│   │   ├── card-detail.spec.ts
│   │   └── lists-cards.spec.ts
│   ├── fixtures/
│   │   └── test-helpers.ts
│   ├── playwright.config.ts
│   └── package.json
├── docs/features/              # Feature documentation
│   ├── index.md
│   ├── architecture.md
│   ├── auth.md
│   ├── boards.md
│   ├── cards.md
│   └── drag-and-drop.md
├── app-overview.html           # Self-contained app overview (product, architecture, tests)
├── CLAUDE.md                   # AI assistant context
└── README.md
```

## Setup

### Prerequisites

- Node.js 18+
- PostgreSQL (local install, Docker, or cloud service like Neon)

### 1. Clone the repository

```bash
git clone <repository-url>
cd trello-clone
```

### 2. Set up the database

Start PostgreSQL locally, via Docker, or use a cloud provider:

```bash
# Option A: Docker
docker run -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres

# Option B: Neon (free cloud PostgreSQL)
# Create a project at https://neon.tech and copy the connection string
```

### 3. Configure environment variables

**Server** — create `server/.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/trello_clone"
JWT_SECRET="your-access-token-secret"
JWT_REFRESH_SECRET="your-refresh-token-secret"
CLIENT_URL="http://localhost:5173"
PORT=4000
```

**Client** — create `client/.env`:

```env
VITE_API_URL=http://localhost:4000/api
```

### 4. Install dependencies and set up the database

```bash
# Server
cd server
npm install
npx prisma migrate dev --name init
cd ..

# Client
cd client
npm install
cd ..

# E2E tests (optional)
cd e2e
npm install
npx playwright install
cd ..
```

### 5. Start the development servers

In two separate terminals:

```bash
# Terminal 1 - API server
cd server
npm run dev

# Terminal 2 - React client
cd client
npm run dev
```

The client will be available at `http://localhost:5173` and the API at `http://localhost:4000`.

## Available Scripts

### Server (`cd server`)

| Script | Description |
|---|---|
| `npm run dev` | Start the API server with nodemon (auto-reload) |
| `npm start` | Start the API server (production) |
| `npm test` | Run Jest integration tests |
| `npx prisma studio` | Open Prisma Studio (database GUI) |
| `npx prisma migrate dev` | Run database migrations |

### Client (`cd client`)

| Script | Description |
|---|---|
| `npm run dev` | Start the Vite dev server with HMR |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build |
| `npm test` | Run Vitest unit and component tests |

### E2E Tests (`cd e2e`)

| Script | Description |
|---|---|
| `npm test` | Run Playwright E2E tests (headless) |
| `npm run test:headed` | Run E2E tests in a visible browser |
| `npm run report` | Open the HTML test report |

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create a new account |
| POST | `/api/auth/login` | Sign in and receive tokens |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Clear refresh token |

### Boards
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/boards` | List user's boards (with stats) |
| POST | `/api/boards` | Create a board |
| GET | `/api/boards/:id` | Get board with lists and cards |
| PATCH | `/api/boards/:id` | Update board |
| DELETE | `/api/boards/:id` | Delete board |

### Lists
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/boards/:boardId/lists` | Create a list |
| PATCH | `/api/boards/:boardId/lists/:id` | Update/move list |
| DELETE | `/api/boards/:boardId/lists/:id` | Delete list |

### Cards
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/lists/:listId/cards` | Create a card |
| PATCH | `/api/lists/:listId/cards/:id` | Update/move card |
| DELETE | `/api/lists/:listId/cards/:id` | Delete card |

### Card Details
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/cards/:cardId` | Get card with labels, checklists, comments |
| POST | `/api/cards/:cardId/labels` | Add label |
| DELETE | `/api/cards/:cardId/labels/:labelId` | Remove label |
| POST | `/api/cards/:cardId/checklists` | Add checklist |
| DELETE | `/api/cards/:cardId/checklists/:id` | Remove checklist |
| POST | `/api/cards/:cardId/checklists/:id/items` | Add checklist item |
| PATCH | `/api/cards/:cardId/checklists/:id/items/:itemId` | Toggle item |
| DELETE | `/api/cards/:cardId/checklists/:id/items/:itemId` | Remove item |
| POST | `/api/cards/:cardId/comments` | Post comment |
| DELETE | `/api/cards/:cardId/comments/:commentId` | Delete comment |

## Architecture Overview

The application follows a standard client-server architecture:

- **Client**: React SPA with Vite, communicating with the server via Axios. Authentication state is managed through React Context. Access tokens are stored in memory (not localStorage) to prevent XSS attacks. Refresh tokens are stored in httpOnly cookies. Theme preference (dark/light) is persisted in localStorage and applied via Tailwind's `darkMode: 'class'` strategy.

- **Server**: Express REST API with Prisma ORM using the `@prisma/adapter-pg` driver for Neon/serverless PostgreSQL compatibility. All routes under `/api/boards`, `/api/lists`, `/api/cards` are protected by JWT middleware. Input validation uses Zod schemas.

- **Database**: PostgreSQL with 8 tables (User, Board, List, Card, Label, Checklist, ChecklistItem, Comment). Cascading deletes ensure referential integrity.

- **Drag and Drop**: Uses @hello-pangea/dnd with float-based positioning to avoid full re-indexing on every reorder operation. Updates are applied optimistically with rollback on failure.

- **Theming**: Custom Tailwind config with `void` color palette for dark mode, `neon` accent colors (indigo, cyan, purple), glassmorphism header, and dual-mode utility classes. Fonts: Exo 2 (display), IBM Plex Sans (body), JetBrains Mono (code).

For detailed documentation, see the [docs/features/](./docs/features/index.md) directory.

## License

MIT
