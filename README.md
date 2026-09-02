# Dynamic Form Builder

A full-stack tenant-based form builder for creating and updating dynamic questionnaire configurations. The app includes a React builder UI, an Express API, MongoDB persistence, client/server validation, and a dependency-flow preview before save.

## Tech Stack

| Layer    | Technology                                                                    |
| -------- | ----------------------------------------------------------------------------- |
| Frontend | React 18, Vite, Tailwind CSS, React Router, Axios, React Flow, dagre, dnd-kit |
| Backend  | Node.js, Express, MongoDB, Mongoose, Joi                                      |

## Project Structure

```text
form-builder/
├── README.md
├── client/                      # Vite + React frontend
│   ├── package.json
│   └── src/
│       ├── api/                 # Axios client and API helpers
│       ├── components/
│       │   ├── builder/         # Builder UI, editor, flow modal, validations editor
│       │   ├── common/          # Shared UI primitives
│       │   ├── preview/         # Older preview components kept in the codebase
│       │   └── setup/           # Initial configuration loader
│       ├── context/             # Builder state with useReducer
│       ├── hooks/               # Custom data hooks
│       ├── pages/               # SetupPage, BuilderPage
│       └── utils/               # Helpers, validation, layout, question utilities
└── server/                      # Express API
    ├── package.json
    └── src/
        ├── app.js               # Express app setup
        ├── server.js            # Server bootstrap
        ├── config/              # MongoDB connection
        ├── controllers/         # Request handlers
        ├── middleware/          # Validation and error handling
        ├── models/              # Mongoose schemas
        ├── routes/              # API route registration
        ├── services/            # Business logic
        ├── utils/               # ApiError and helpers
        └── validations/         # Joi schemas and integrity checks
```

## Current App Flow

### 1. Setup

The app starts on a loader page where the user selects:

- a tenant from `/api/tenants`
- a submission type
- a form type

The current UI exposes:

- `submission_type`: `FOUND`, `NOT_FOUND`
- `form_type`: `submission`, `new_poi`, `additional`

After selection, the client calls `/api/form-builder/resolve` to determine whether the user is creating a new configuration or editing an existing one.

### 2. Builder

The builder page has two main panels:

- a question list for ordering and selecting questions
- a question editor for changing question details

Supported actions include:

- add, duplicate, delete, and reorder questions
- split independent and dependent questions in the builder state
- define parent question and parent option dependencies
- reset a question back to its original loaded state

### 3. Question Types and Validation

Supported question types:

- `radio`
- `checkbox`
- `dropdown`
- `text`
- `textarea`
- `number`
- `date`
- `image`

Question editing supports:

- options for `radio`, `checkbox`, and `dropdown`
- images metadata for `image`
- per-question validation rules through `ValidationsEditor`

Examples of supported validation rules:

- `required`
- `min_length`, `max_length`, `pattern`
- `contains`, `not_contains`
- `min`, `max`, `integer_only`
- `min_date`, `max_date`
- `must_match_option`
- `min_selections`, `max_selections`
- `min_images`, `max_images`

### 4. Save Preview

When the user clicks save, the current workflow opens a dependency graph preview modal built with React Flow before the final save is confirmed.

## Features

- Tenant-specific configuration loading and edit/create resolution
- Drag-and-drop question ordering
- Question duplication and reset support
- Parent question and option dependency management
- Dependency-aware question organization
- Pre-save integrity validation on both client and server
- Visual form-flow preview before saving

## Validation and Integrity Checks

The app validates form definitions before persistence, including checks such as:

- duplicate `answer_key`
- duplicate option values
- duplicate image keys
- duplicate orders
- missing option labels or values
- missing image keys
- orphaned parent question or option references
- circular dependencies
- empty form submissions

## API Reference

| Method | Endpoint                    | Description                                                              |
| ------ | --------------------------- | ------------------------------------------------------------------------ |
| GET    | `/health`                   | Health check                                                             |
| GET    | `/api/tenants`              | List tenants with `require_validation=true`                              |
| GET    | `/api/form-builder`         | List configs, filterable by `tenant`, `submission_type`, and `form_type` |
| GET    | `/api/form-builder/resolve` | Resolve whether a config should be created or edited                     |
| GET    | `/api/form-builder/:id`     | Get a config by ID                                                       |
| POST   | `/api/form-builder`         | Create a new config                                                      |
| PUT    | `/api/form-builder/:id`     | Update an existing config                                                |
| DELETE | `/api/form-builder/:id`     | Delete a config                                                          |

## Getting Started

### Prerequisites

- Node.js 18+ recommended (Node 16 works via a Vite crypto polyfill in `client/scripts`)
- MongoDB running locally or a MongoDB Atlas URI

### 1. Start the server

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

Set at least `MONGODB_URI` in `server/.env`.

The API runs on `http://localhost:5000` by default.

### 2. Start the client

```bash
cd client
npm install
npm run dev
```

The frontend runs on `http://localhost:3000` and proxies `/api` requests to the server.

## Scripts

### Client

```bash
npm run dev
npm run build
npm run preview
```

### Server

```bash
npm run dev
npm start
```

## Environment Variables

### Server (`server/.env`)

```bash
PORT=5000
MONGODB_URI=mongodb://localhost:27017/form_builder
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

`CLIENT_URL` is used for CORS configuration. The checked-in `.env.example` currently includes `PORT`, `MONGODB_URI`, and `NODE_ENV`, so add `CLIENT_URL` manually if you need a specific origin during local development.
