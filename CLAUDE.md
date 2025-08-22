# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

**Development:**
- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check code formatting
- `pnpm clean` - Clean all build artifacts and dependencies

**Database Operations:**
- `pnpm db:generate` - Generate Drizzle migrations after schema changes
- `pnpm db:push` - Push schema changes to database (development)
- `pnpm db:migrate` - Run migrations (production)
- `pnpm db:seed` - Seed database with initial data
- `pnpm db:studio` - Open Drizzle Studio GUI for database inspection
- `pnpm db:cleanup` - Clean up database (development)
- `pnpm db:introspect` - Introspect existing database schema
- `pnpm db:drop-migration` - Drop specific migration file

**Email Development:**
- `pnpm email` - Start React Email development server

**Component Development:**
- `pnpm shadcn` - Add new Shadcn/ui components

## Architecture Overview

This is a Next.js 14 e-commerce admin application using:
- **Database:** PostgreSQL with Drizzle ORM + Xata BaaS
- **Authentication:** NextAuth.js v5 with role-based access (USER, ADMIN, SUPER_ADMIN, GUEST)
- **UI:** Shadcn/ui components with Tailwind CSS
- **Forms:** React Hook Form + Zod validation
- **State:** TanStack Query for server state management

## Architecture Patterns

### File Structure & Conventions
Each feature follows this consistent pattern:
```
app/(admin)/admin/feature/
├── _components/           # React components
│   ├── feature-table.tsx     # Data table (client)
│   ├── feature-columns.tsx   # Table column definitions
│   ├── feature-sheet.tsx     # Create/edit modal (client)
│   ├── feature-toolbar-actions.tsx
│   ├── feature-floating-bar.tsx
│   └── delete-feature-dialog.tsx
├── _lib/
│   ├── actions.ts        # Server actions with middleware composition
│   ├── queries.ts        # Database queries with caching
│   └── validations.ts    # Zod schemas + search params cache
├── _hooks/               # TanStack Query hooks for mutations
└── page.tsx             # Route component (server)
```

### Component Naming Conventions
- **Server Components**: `.server.tsx` suffix, run on server only
- **Client Components**: `.client.tsx` suffix, use "use client" directive
- **Regular Components**: `.tsx` without suffix, can be either based on usage
- **Feature Tables**: `{feature}-table.tsx` - main data table component
- **Feature Sheets**: `{feature}-sheet.tsx` - create/edit modal forms
- **Column Definitions**: `{feature}-columns.tsx` - table column configurations

### Server Actions & Middleware Composition
All server actions follow a strict middleware composition pattern using functional composition:
```typescript
// Base action function
async function createFeatureBase(input: CreateFeatureSchema, ctx: ActionContext = {}) {
  if (!ctx.session?.user?.id) throw new AppError(ERRORS.UNAUTHENTICATED);
  
  // Database operations with transactions
  const feature = await db.transaction(async (tx) => {
    // Validation logic
    // Database operations
    return result;
  });
  
  // Cache revalidation
  revalidateTag("features");
  revalidateTag("features-count");
  
  return { data: feature, message: SUCCESS_MESSAGES.FEATURE_CREATED };
}

// Composed action with middleware stack
export const createFeature = composeMiddleware<CreateFeatureSchema, ReturnType<typeof createFeatureBase>>(
  withErrorHandling(),
  withValidation({
    schema: createFeatureSchema,
    errorMessage: "Datos inválidos"
  }),
  withAuth({
    requiredRole: [UserRoleValues.ADMIN, UserRoleValues.SUPER_ADMIN]
  }),
  withRateLimit({
    requests: 10,
    duration: "1m"
  })
)(createFeatureBase);
```

**Middleware Stack Order** (applied right-to-left):
1. `withErrorHandling()` - Global error catching and transformation
2. `withValidation()` - Zod schema validation with custom error messages
3. `withAuth()` - Authentication + role-based authorization
4. `withRateLimit()` - IP-based rate limiting with Redis/Upstash

### Database Architecture
**Database Stack:**
- PostgreSQL with Xata BaaS (Backend-as-a-Service)
- Drizzle ORM v0.35.3 with full TypeScript support
- Schema-first approach with automatic type generation

**Schema Structure:**
- 20+ tables covering complete e-commerce domain
- User management with role hierarchy (GUEST → USER → ADMIN → SUPER_ADMIN)
- Product catalog: categories, subcategories, products, variants, inventory
- Order management: orders, payments, shipping, order items
- Store management: colors, sizes, designs

**Key Patterns:**
```typescript
// Always use UserRoleValues (not UserRole enum)
import { UserRoleValues } from "@/db/schema";

// Database operations with transactions
const result = await db.transaction(async (tx) => {
  // Multiple operations
  return tx.insert(table).values(data).returning().then(takeFirstOrThrow);
});

// Cache invalidation after mutations
revalidateTag("table-name");
revalidateTag("table-count");
```

### Component Architecture

**Data Table System:**
Reusable table system built on TanStack Table v8 with advanced features:
```typescript
// Main table component structure
<DataTable table={table} floatingBar={<FloatingBar />}>
  <DataTableAdvancedToolbar
    table={table}
    filterFields={advancedFilterFields}
    tableName="features"
  >
    <ToolbarActions />
  </DataTableAdvancedToolbar>
</DataTable>

// Advanced features
- Column pinning and resizing
- Advanced filtering with multiple operators
- URL state synchronization with nuqs
- Feature flags for conditional rendering
- Export functionality
- Bulk actions with floating bar
```

**Form System:**
Consistent form handling across all features:
```typescript
// Form setup with React Hook Form + Zod
const form = useForm<CreateFeatureSchema>({
  resolver: zodResolver(createFeatureSchema),
  defaultValues: { /* ... */ }
});

// Shadcn/ui form components
<Form {...form}>
  <FormField
    control={form.control}
    name="fieldName"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Label</FormLabel>
        <FormControl>
          <Input {...field} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
</Form>
```

**State Management with TanStack Query:**
```typescript
// Mutation hooks pattern
export function useCreateFeature() {
  return useMutation({
    mutationFn: createFeature,
    onSuccess: (result) => toast.success(result.message),
    onError: (error: Error) => toast.error(error.message)
  });
}

// Usage in components
const { mutate: createFeature, isPending } = useCreateFeature();
```

### Authentication & Authorization System
**Session Management:**
- NextAuth.js v5 with JWT strategy
- 24-hour session expiry with automatic refresh
- Drizzle adapter for database session storage
- Multi-provider support: Credentials, Google, Instagram

**Role-Based Access Control (RBAC):**
```typescript
enum UserRoleValues {
  GUEST = "GUEST"
  USER = "USER"
  ADMIN = "ADMIN"
  SUPER_ADMIN = "SUPER_ADMIN"
}
```

**Middleware Protection:**
- Route-based protection in `middleware.ts`
- Automatic redirects based on authentication state and role
- Admin routes require `ADMIN` or `SUPER_ADMIN` roles
- Auth flow redirection logic for different user types

**Session Access:**
```typescript
// In server components/actions
const session = await auth();

// In middleware composition
withAuth({ requiredRole: [UserRoleValues.ADMIN] })
```

### File Upload System
**Vercel Blob Integration:**
```typescript
// API route pattern (/app/api/avatar/upload/route.ts)
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autorizado" });
  
  return handleUpload({
    body: await request.json(),
    request,
    onBeforeGenerateToken: async () => ({
      allowedContentTypes: ACCEPTED_IMAGE_TYPES,
      maximumSizeInBytes: MAX_FILE_SIZE,
      tokenPayload: JSON.stringify({ userId: session.user.id })
    }),
    onUploadCompleted: async () => { /* Post-upload logic */ }
  });
}
```

### Email System
**React Email + SendGrid:**
```typescript
// Email template system
export const sendEmail = async ({ data, options }: SendEmailOptions) => {
  const { subject, component } = getEmailTemplate(data);
  const emailHtml = await render(component);
  await sendgrid.send({
    from: { email: "web.christian.dev@gmail.com", name: "Pañalera Mundo Bebé" },
    to: data.to,
    html: emailHtml,
    subject
  });
};

// Template types: "welcome" | "reset_password"
// Discriminated union validation with Zod
```

### Admin UI Architecture
**Layout System:**
- Collapsible sidebar with Shadcn/ui Sidebar primitives
- Role-based navigation filtering with access levels
- Breadcrumb navigation with automatic path generation
- Header with search, user menu, and theme toggle
- Feature flags for conditional UI elements

**Navigation Structure:**
```typescript
// Navigation items with role-based access
export const navItems: NavItem[] = [
  {
    title: "Panel de información",
    url: "/admin/panel",
    icon: "dashboard",
    accessLevel: [UserRoleValues.ADMIN],
    items: [] // Collapsible sub-items
  },
  // Nested navigation for store management
  {
    title: "Tienda",
    url: "#", // Parent item
    icon: "store",
    accessLevel: [UserRoleValues.ADMIN],
    items: [
      { title: "Categorías", url: "/admin/tienda/categorias", ... },
      { title: "Subcategorías", url: "/admin/tienda/subcategorias", ... }
    ]
  }
];
```

**Icon System:**
- Centralized icon mapping with Tabler Icons
- Type-safe icon references in navigation
- Consistent iconography across admin interface

**Feature Flags System:**
```typescript
// URL-based feature toggles
const { featureFlags } = useFeatureFlags();
const enableAdvancedTable = featureFlags.includes("advancedTable");
const enableFloatingBar = featureFlags.includes("floatingBar");

// Conditional rendering based on flags
{enableAdvancedTable ? <AdvancedToolbar /> : <BasicToolbar />}
```

### Provider Architecture
**Global Providers Stack:**
```jsx
<SessionProvider>          {/* NextAuth session management */}
  <QueryClientProvider>    {/* TanStack Query cache */}
    <TooltipProvider>      {/* Radix UI tooltips */}
      <NuqsAdapter>        {/* URL state synchronization */}
        {children}
        <Toaster />        {/* Toast notifications */}
        <SonnerToaster />  {/* Sonner toast system */}
      </NuqsAdapter>
    </TooltipProvider>
  </QueryClientProvider>
</SessionProvider>
```

### Technology Stack
**Framework & Runtime:**
- Next.js 14.2.18 with App Router
- React 18.3.1 with Server Components
- TypeScript 5.6.3 strict mode

**Styling & UI:**
- Tailwind CSS 3.4.14 with CSS variables
- Shadcn/ui components with Radix UI primitives
- `next-themes` for dark/light mode
- Tailwind CSS Animate for animations
- `next-view-transitions` for page transitions

**State & Forms:**
- TanStack Query v5.59.16 for server state
- React Hook Form v7.53.1 with Zod v3.24.0
- nuqs v2.4.0 for URL state management
- Sonner for toast notifications

**Database & Auth:**
- Drizzle ORM v0.35.3 with PostgreSQL
- NextAuth.js v5.0.0-beta.28
- Xata.io client for BaaS
- Upstash Redis for rate limiting

**Development:**
- ESLint with Next.js config
- Prettier with Tailwind plugin
- TypeScript strict mode
- Absolute imports with `@/` alias

## Database Operations

When making schema changes:
1. Modify `db/schema.ts`
2. Run `pnpm db:generate` to create migration
3. Run `pnpm db:push` for development or `pnpm db:migrate` for production
4. Update `drizzle/schema.ts` and `drizzle/relations.ts` if needed

## Development Guidelines

### Code Patterns & Best Practices
- **Imports**: Always use absolute imports with `@/` prefix
- **Validation**: All inputs validated with Zod schemas
- **Caching**: Use `revalidateTag()` after mutations, `unstable_cache` for queries
- **Security**: Rate limiting on all sensitive actions, role-based authorization
- **Types**: Use `UserRoleValues` enum (not `UserRole` type)
- **Components**: Follow `.server.tsx`/`.client.tsx` naming for clarity
- **Forms**: React Hook Form + Zod resolver pattern throughout
- **Tables**: Use `useDataTable` hook with feature flags for conditional features

### Feature Implementation Pattern
1. **Database Schema**: Define in `db/schema.ts` with proper relations
2. **Validations**: Create Zod schemas with search params cache
3. **Queries**: Database queries with proper caching tags
4. **Actions**: Server actions with full middleware composition stack
5. **Hooks**: TanStack Query mutations with toast notifications
6. **Components**: Table, sheet (modal), toolbar, and dialog components
7. **Page**: Server component that orchestrates data fetching

### Error Handling & Logging
- Custom `AppError` class for structured errors
- Global error boundary in middleware composition
- Toast notifications for user feedback
- Console logging for server-side errors

### Performance Optimizations
- Server Components for initial data fetching
- TanStack Query for client-side caching
- URL state management with nuqs for table filters
- Debounced search inputs (300ms default)
- Feature flags for conditional rendering

### Cache Strategy
- Database queries tagged with feature names (`"categories"`, `"categories-count"`)
- Revalidation after mutations with `revalidateTag()`
- 24-hour session cache with JWT
- Redis-based rate limiting cache
- TanStack Query client-side caching with automatic background refetching
- Next.js App Router built-in caching for static and dynamic routes

### Internationalization & Localization
**Spanish-First Application:**
- All UI text, error messages, and labels in Spanish
- Centralized label mappings in `constants/index.ts`
- Role names and status labels localized
- Form validation messages in Spanish
- Date formatting with Spanish locale

**Column Mappings:**
```typescript
export const columnLabelMappings: DataTableMappings = {
  users: {
    name: "Nombre completo",
    email: "Correo electrónico",
    role: "Rol",
    active: "Activo"
  },
  categories: {
    name: "Nombre de la categoría",
    slug: "Identificador",
    active: "Activo"
  }
};
```

### Route Protection & Middleware
**Middleware Chain:**
1. **Authentication Check**: Verify JWT token validity
2. **Route Classification**: Determine if route is admin/auth/protected
3. **Role Validation**: Check user role against route requirements
4. **Redirect Logic**: Handle authenticated/unauthenticated state transitions

**Path Utilities:**
```typescript
// Route classification helpers
isAdminPath(pathname) // Admin routes require ADMIN+ role
isAuthFlowPath(pathname) // Login, register, reset password
isProtectedPath(pathname) // Requires authentication
```

**Access Control:**
```typescript
// Module-based access control
const checkAdminAccess = createModuleAccessChecker("admin", "/");
await checkAdminAccess(); // In layout components

// Navigation filtering by role
const filteredNavItems = filterNavItems(navItems, session?.user.role);
```

### Configuration & Constants
**Centralized Configuration:**
- `constants/index.ts` - Application constants, role mappings, navigation
- `config/data-table.ts` - Data table operators and feature flags
- Route enums: `PublicPaths`, `AdminPaths`, `AuthPaths`, `ProtectedPaths`
- Column label mappings for internationalization
- Password validation rules and security constants

**Data Table Configuration:**
```typescript
export const dataTableConfig = {
  featureFlags: [
    { label: "Tabla avanzada", value: "advancedTable", icon: IconFilterPlus },
    { label: "Barra flotante", value: "floatingBar", icon: IconFlask2 }
  ],
  textOperators: [{ label: "Contiene", value: "iLike" }, ...],
  numericOperators: [{ label: "Es", value: "eq" }, ...],
  // Operators for different column types
};
```

### Data Flow Architecture
```
[User Action] → [Client Component] → [TanStack Query Hook] → 
[Server Action] → [Middleware Stack] → [Database] → 
[Cache Revalidation] → [UI Update]
```

1. **User Interaction**: Form submission, table action, etc.
2. **Client State**: React Hook Form handles form state
3. **Mutation**: TanStack Query mutation with optimistic updates
4. **Server Action**: Composed with validation, auth, rate limiting
5. **Database**: Drizzle ORM with transactions
6. **Cache**: Revalidate Next.js cache tags
7. **UI Feedback**: Toast notification + automatic refetch

### Code Organization Principles
**Feature-Based Architecture:**
- Each business domain (categories, users, colors) has dedicated folder
- Co-located components, hooks, actions, and validations
- Consistent file naming across all features

**Dependency Management:**
- Barrel exports for cleaner imports
- Type definitions in dedicated `types/` directory
- Shared utilities in `lib/` directory
- UI components in `components/ui/` following Shadcn conventions

**File Naming Conventions:**
```
_components/           # Feature-specific components
_lib/                  # Feature business logic
_hooks/                # Feature-specific React hooks
page.tsx              # Route entry point (server component)
layout.tsx            # Layout wrapper with access control
```

**Import Strategy:**
```typescript
// Always use absolute imports
import { Button } from "@/components/ui/button";
import { createCategory } from "@/app/(admin)/admin/tienda/categorias/_lib/actions";
import { UserRoleValues } from "@/db/schema";
```