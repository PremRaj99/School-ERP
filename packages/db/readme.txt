write docker compose in docker-compose.yml

run the script for make it live create space for docker database
$/   docker-compose up -d

install prisma steps 


mkdir my-prisma-project
cd my-prisma-project

npm init -y

npm install typescript ts-node @types/node --save-dev

npx tsc --init

"outDir": "./dist"
"rootDir": "./src"

mkdir src

npm install prisma --save-dev

npx prisma init

// prisma/schema.prisma

Open the .env file.
Set the DATABASE_URL
mongodb://premraj:premraj@localhost:27017/metaverse?authSource=admin

npx prisma generate // generate prisma client

src/index.ts

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

npx prisma studio //visualize and manage data using UI