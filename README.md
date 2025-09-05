# NestJS Boilerplate for Starter

A robust, pre-configured NestJS boilerplate for backend service development. This starter includes integrations for Prisma, JWT authentication, AWS S3, static file serving, and advanced logging with Winston.

---

## 📦 Features

- 🧱 **NestJS 11** with modular architecture
- 🔐 **JWT Auth** support
- 📦 **Prisma ORM** integration
- ☁️ **AWS S3** SDK with presigned URL generation
- 🗃️ **Caching** with `@nestjs/cache-manager`
- 🔒 **bcrypt** for password hashing
- 📤 **Static file** serving with `@nestjs/serve-static`
- 🧾 **Zod** for schema validation
- 🪵 **Winston** for advanced logging
- 🧰 Preconfigured **ESLint** and **Prettier**

---

## 🚀 Getting Started

### Prerequisites

- Node.js (>= 18.x)
- npm or Yarn
- PostgreSQL or other supported DB
- AWS credentials (if using S3)

### Installation

```bash
npm install
# or
yarn install
```

---

### Configuration

Set up your environment variables in `.env`:

```dotenv
NODE_ENV=<NODE_ENV>
LOG_LEVEL=<LOG_LEVEL>
PORT=<PORT>
DATABASE_URL=postgres://{user}:{password}@{hostname}:{port}/{database-name}
JWT_SECRET=<JWT_SECRET>
S3_ENDPOINT=<S3_ENDPOINT>
S3_ACCESS_KEY=<S3_ACCESS_KEY>
S3_SECRET_KEY=<S3_SECRET_KEY>
S3_BUCKET=<S3_BUCKET>
```

---

## 🔧 Scripts

| Command               | Description                       |
| --------------------- | --------------------------------- |
| `npm run build`       | Build the project                 |
| `npm run start`       | Start the app in production mode  |
| `npm run start:dev`   | Start the app in development mode |
| `npm run start:debug` | Start with debug mode + watch     |
| `npm run start:prod`  | Start compiled output             |
| `npm run lint`        | Run ESLint with auto fix          |
| `npm run format`      | Format files with Prettier        |

---

## 🛠 Project Structure

```
src/
├── app.module.ts
├── main.ts
├── your-modules/
│   └── dto/
│   └── module, controller, service, repository, validation
├── common/
│   └── interceptors, filters, decorators, common services
├── config/
│   └── config files
prisma/
├── schema.prisma
├── seed.ts
```

---

## 🗄 Prisma ORM

### Generate Prisma Client

```bash
npx prisma generate
```

### Run Migrations

```bash
npx prisma migrate dev --name init
```

### Seed Database

```bash
npx prisma db seed
```

---

## 🔧 Winston Logging

| Log Level | Description                     |
| --------- | ------------------------------- |
| `error`   | Logs only errors                |
| `warn`    | Warnings and errors             |
| `info`    | Info messages, warnings, errors |
| `debug`   | Debug + info + warn + error     |
| `verbose` | More detailed logs              |
| `silly`   | All logs (max verbosity)        |
