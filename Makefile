# Aegis Lens — local dev shortcuts.

.PHONY: help install up down dev test typecheck lint build clean db-generate db-migrate db-studio

help:
	@echo "Targets:"
	@echo "  install      pnpm install"
	@echo "  up           docker compose up -d   (Postgres + Redis + MinIO)"
	@echo "  down         docker compose down"
	@echo "  dev          start web on :5454"
	@echo "  test         run all tests"
	@echo "  typecheck    type-check all packages"
	@echo "  lint         lint web app"
	@echo "  build        production build"
	@echo "  db-generate  drizzle-kit generate"
	@echo "  db-migrate   drizzle-kit migrate"
	@echo "  db-studio    drizzle-kit studio"
	@echo "  clean        remove node_modules + .next + .turbo"

install:
	pnpm install

up:
	docker compose up -d

down:
	docker compose down

dev:
	pnpm --filter @aegis/web dev

test:
	pnpm test

typecheck:
	pnpm typecheck

lint:
	pnpm --filter @aegis/web lint

build:
	pnpm build

db-generate:
	pnpm --filter @aegis/db generate

db-migrate:
	pnpm --filter @aegis/db migrate

db-studio:
	pnpm --filter @aegis/db studio

clean:
	pnpm clean
	rm -rf node_modules
