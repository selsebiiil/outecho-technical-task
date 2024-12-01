# Outecho - NestJS Project

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

## Description

Outecho is a server-side application built using the [NestJS](https://nestjs.com) framework. It includes a PostgreSQL database, Prisma as the ORM, and follows modern development practices for building scalable applications.

## Project Setup

### Clone the Repository

Clone the project to your local machine:

```bash
git clone <repository-url>
cd <repository-url>
```

Install Dependencies
In the root folder, install the required dependencies:

```bash
pnpm install
```

Environment Variables
Create a .env file in the root directory and add the following variables:

```bash
DATABASE_URL="postgresql://root:root@localhost:5432/outecho"
DIRECT_URL="postgresql://root:root@localhost:5432/outecho"
JWT_SECRET=0f37fd5b8b0f4e28d3354ce1522ec101d6796b4d09194f42f5a4d4766c0c457267d1ebb17eb8e203a5a50a453b39dfc26e09cf376501988ae476b09ae8a33d81

```

Run PostgreSQL
Make sure you have a PostgreSQL server running locally on port 5432 with username root and password root. Create a database named outecho.

Run Migrations
To set up the database schema, run the Prisma migrations:

```bash
pnpm run prisma:migrate

```

Generate Prisma Client
Generate the Prisma client:

```bash
pnpm run prisma:generate

```

Compile and Run the Project
Start the development server:

```bash
pnpm run start:dev

```

The application will run at http://localhost:3000.

Swagger docs: http://localhost:3000/api
