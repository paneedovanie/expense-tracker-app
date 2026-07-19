# Expense Tracker App - Agent Guide

## Project Overview

- **Type**: Expo (React Native) mobile application
- **Stack**: Expo SDK 54, React Native 0.79.2, TypeScript 5.8.3
- **API Backend**: `https://expense-tracker-api.hiramis.org`
- **Purpose**: Group expense tracking with split bills, payments, and summary exports

---

## Tech Stack

| Category      | Technology                                             |
| ------------- | ------------------------------------------------------ |
| Framework     | Expo SDK 54                                            |
| Routing       | expo-router 5.0.6 (file-based, tab + stack navigation) |
| UI Components | @ui-kitten/components 5.3.1 + @eva-design/eva 2.2.0    |
| Global State  | Jotai 2.12.5 (atoms for user + accessToken)            |
| Server State  | TanStack React Query 5.60.0                            |
| Forms         | react-hook-form 7.56.4 + @hookform/resolvers 5.0.1     |
| Validation    | Zod 3.25.36                                            |
| Auth Storage  | expo-secure-store 14.2.3                               |
| Animations    | react-native-reanimated 3.17.4                         |
| PDF/Export    | expo-print, expo-sharing, react-native-webview         |
| Date Handling | dayjs 1.11.13                                          |
| i18n          | react-native-localize, i18n-js                         |

---

## Directory Structure

```
app/                    # expo-router pages
  (app)/                # Protected app routes (bottom tabs)
    (groups)/           # Groups section with nested routes
      (expenses)/       # Expense routes (add, view, payments, summary)
      (members)/        # Member management routes
    (profile)/          # Profile section (view, update, change-password)
  (auth)/               # Auth routes (login, register, forgot-password)
  _layout.tsx           # Root layout with providers
  +not-found.tsx        # 404 handler

components/             # Reusable UI components
  avatar/               # Avatar display + picker
  buttons/               # FAB, menu buttons
  dev/                  # Dev-only components (DevLogin)
  expenses/             # Expense-related components
  forms/                # Form components (InputField, ExpenseForm, etc.)
  groups/               # Group-related components
  providers/            # Context providers (Toast, ReactQuery)
  toasts/               # Toast notifications

hooks/                  # Custom hooks wrapping services + React Query
  use-auth.ts           # Authentication logic
  use-groups.ts         # Groups CRUD + infinite query
  use-expenses.ts       # Expenses CRUD + infinite query
  use-payments.ts       # Payments CRUD
  use-users.ts          # User queries
  use-pagination.ts     # Pagination state helper
  use-protected-route.ts # Auth guard hook

services/               # API service classes
  auth.service.ts
  base.service.ts       # Base class with token injection
  expenses.service.ts
  groups.service.ts
  payments.service.ts
  users.service.ts

stores.ts               # Jotai atoms (userStore, accessTokenStore)

types/                  # TypeScript type definitions
  i-*.ts                # Interfaces (IUser, IGroup, IExpense, etc.)
  t-*.ts                # Type aliases from Zod schemas
  e-*.ts                # Enums (EExpenseCategory, ESplitType, etc.)

validations/            # Zod validation schemas
  login.validation.ts
  register.validation.ts
  create-expense.validation.ts
  expense.validation.ts
  create-group.validation.ts
  *.validation.ts

utils/                  # Utility functions
  api.ts                # Fetch wrapper (get, post, put, patch, delete)
  request.ts            # Query string formatting, FormData conversion
  token.ts              # SecureStore token management
  file.ts               # File URL generation
  number.ts             # Currency formatting, expense calculations
  group.ts              # Group helpers, HTML generation for summaries
  expense.ts            # Expense helpers, HTML generation for summaries

constants/
  Colors.ts             # Color palette
  env.ts                # Environment variables (apiBaseUrl)

locales/                # i18n translations
  en.json               # English
  fil.json              # Filipino
```

---

## Key Commands

```bash
# Development
npm run ios     # Run on iOS simulator
npm run android # Run on Android emulator
npm run web     # Run on web

# Validation
npm run lint        # Lint code
npm run typecheck   # TypeScript type check

# Build
npx expo prebuild   # Generate native projects
eas build           # EAS build pipeline

# Testing (not yet configured)
npm test            # Run Jest tests
npm run test:watch  # Run Jest in watch mode
```

---

## Code Conventions

### Services

- All services extend `BaseService` which provides:
  - `apiBaseUrl` from `constants/env.ts`
  - `applyAccessToken()` method that injects `Authorization: Bearer <token>` header
- Example service pattern:

```typescript
// services/groups.service.ts
class GroupsService extends BaseService {
  async paginated(query?: IPaginatedQuery) {
    return api.get(`${this.apiBaseUrl}/api/v1/groups`, query);
  }
  async create(input: TCreateGroupInput) {
    return api.post(`${this.apiBaseUrl}/api/v1/groups`, input);
  }
}
```

### React Query Hooks

- Wrap service methods with React Query hooks in `hooks/use-*.ts`
- Use `useInfiniteQuery` for paginated lists
- Mutations return `useMutation` with `onSuccess`/`onError` callbacks

### Jotai Atoms

- Only auth-related global state in `stores.ts`:
  - `userStore` — current user object
  - `accessTokenStore` — JWT token string

### Forms

- Use `react-hook-form` with Zod resolver
- Validation schemas live in `validations/*.validation.ts`
- Form components in `components/forms/`

### File Handling

- `utils/file.ts` converts files to `IFile` interface: `{ uri, name, type, size }`
- File URLs: `${apiBaseUrl}/api/v1/files?key=${key}`

### HTML/PDF Export

- `utils/group.ts` — `generateGroupSummaryHtml()`
- `utils/expense.ts` — `generateExpenseSummaryHtml()`
- Uses `expo-print` for PDF, `expo-sharing` for sharing

---

## Adding New Features

Follow this pattern to add a new CRUD entity:

### Step 1: Types

Add interfaces and types in `types/`:

```typescript
// types/i-MyEntity.ts
export interface IMyEntity {
  id: string;
  name: string;
}

// types/t-my-entity.ts
import { z } from "zod";
export type TMyEntityInput = z.infer<typeof myEntitySchema>;

// types/e-my-entity.ts
export enum EMyEntityStatus {
  Active = "Active",
  Inactive = "Inactive",
}
```

### Step 2: Validation

Create `validations/my-entity.validation.ts`:

```typescript
import { z } from "zod";
export const createMyEntitySchema = z.object({ name: z.string().min(1) });
export const updateMyEntitySchema = z.object({ name: z.string().min(1) });
```

### Step 3: Service

Add to `services/my-entity.service.ts`:

```typescript
class MyEntityService extends BaseService {
  async paginated(query?: IPaginatedQuery) {
    return api.get(`${this.apiBaseUrl}/api/v1/my-entities`, query);
  }
  async create(input: TMyEntityInput) {
    return api.post(`${this.apiBaseUrl}/api/v1/my-entities`, input);
  }
  async update(id: string, input: TMyEntityInput) {
    return api.put(`${this.apiBaseUrl}/api/v1/my-entities/${id}`, input);
  }
  async delete(id: string) {
    return api.delete(`${this.apiBaseUrl}/api/v1/my-entities/${id}`);
  }
}
export const myEntityService = new MyEntityService();
```

### Step 4: Hook

Create `hooks/use-my-entities.ts`:

```typescript
export function useMyEntities(query?: IPaginatedQuery) {
  return useInfiniteQuery({
    queryKey: ["my-entities", query],
    queryFn: ({ pageParam }) =>
      myEntityService.paginated({ ...query, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });
}
```

### Step 5: Components

Add UI in `components/my-entities/`:

- `MyEntityList.tsx` — paginated list with infinite scroll
- `MyEntityForm.tsx` — create/edit form with react-hook-form

### Step 6: Route

Add pages in `app/(app)/(my-entities)/`:

```
app/(app)/(my-entities)/
  index.tsx      # List view
  add.tsx        # Create
  view.tsx       # Detail view
  edit.tsx       # Edit
```

### Step 7: Connect

Wire form → hook → service → API:

```typescript
// In form component
const mutation = useMutation({ mutationFn: myEntityService.create, onSuccess: () => {...} });
```

---

## Testing

**Status**: No test framework currently configured.

**Recommendation**: Install and configure:

```bash
npm install --save-dev jest @testing-library/react-native @types/jest
npx jest --init
```

**Convention**: Place tests alongside source files:

- `services/__tests__/groups.service.test.ts`
- `hooks/__tests__/use-groups.test.ts`
- `components/groups/__tests__/GroupCard.test.tsx`

---

## Internationalization (i18n)

- Library: `react-native-localize` + `i18n-js`
- Supported locales: `en` (English), `fil` (Filipino)
- Translation files: `locales/en.json`, `locales/fil.json`

### Usage

```typescript
import I18n from "i18n-js";
I18n.t("welcome_message");
I18n.t("expense_category_food");
```

### Adding Translations

1. Add key to `locales/en.json` (source)
2. Add corresponding key to `locales/fil.json`
3. Use `I18n.t('key')` in components

### Device Locale

The app detects device locale via `react-native-localize` and sets `I18n.locale` accordingly.
