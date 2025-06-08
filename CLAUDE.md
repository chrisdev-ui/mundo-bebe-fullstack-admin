# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

**Development:**
- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm lint` - Run ESLint
- `pnpm format` - Format code with Prettier

**Database Operations:**
- `pnpm db:generate` - Generate Drizzle migrations after schema changes
- `pnpm db:push` - Push schema changes to database (development)
- `pnpm db:migrate` - Run migrations (production)
- `pnpm db:seed` - Seed database with initial data
- `pnpm db:studio` - Open Drizzle Studio GUI for database inspection

## Architecture Overview

This is a Next.js 14 e-commerce admin application using:
- **Database:** PostgreSQL with Drizzle ORM + Xata BaaS
- **Authentication:** NextAuth.js v5 with role-based access (USER, ADMIN, SUPER_ADMIN, GUEST)
- **UI:** Shadcn/ui components with Tailwind CSS
- **Forms:** React Hook Form + Zod validation
- **State:** TanStack Query for server state management

## Key Patterns

### File Structure
Each feature follows this pattern:
```
app/(admin)/admin/feature/
├── _components/           # React components (.server.tsx/.client.tsx)
├── _lib/
│   ├── actions.ts        # Server actions with middleware
│   ├── queries.ts        # Database queries
│   └── validations.ts    # Zod schemas
├── _hooks/               # Custom React hooks
└── page.tsx             # Route component
```

### Server Actions Pattern
All server actions use middleware composition:
```typescript
export const actionName = withAuth(
  withRateLimit(
    withValidation(schema, async (input) => {
      // Action logic
    })
  )
);
```

### Database Schema
- Comprehensive e-commerce schema with 20+ tables
- Role-based user management with hierarchy
- Product catalog with variants, inventory, categories
- Order management with payments and shipping
- Use `UserRoleValues` (not UserRole enum) for role types

### Component Conventions
- Server components: `.server.tsx` suffix
- Client components: `.client.tsx` suffix
- Data tables use reusable system in `components/ui/table/`
- Forms use React Hook Form with consistent error handling

### Authentication & Authorization
- JWT sessions with 24-hour expiry
- Role checks throughout application
- Middleware protection on admin routes
- Use `auth()` from `@/auth` for session access

## Database Operations

When making schema changes:
1. Modify `db/schema.ts`
2. Run `pnpm db:generate` to create migration
3. Run `pnpm db:push` for development or `pnpm db:migrate` for production
4. Update `drizzle/schema.ts` and `drizzle/relations.ts` if needed

## Important Notes

- Always use absolute imports with `@/` prefix
- Validate all inputs with Zod schemas
- Use `revalidateTag()` for cache invalidation after mutations
- Rate limiting is applied to all sensitive server actions
- Email templates use React Email in `components/emails/`
- File uploads use Vercel Blob storage