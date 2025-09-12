**Therapist API**

REST API for therapists, clients, form workflows, and Stripe subscriptions. Built with NestJS + Prisma.

**Table of Contents**

- Requirements
- Run Locally
- Authentication
- Swagger Docs
- Endpoints
- Environment Variables

**Requirements**

- Node.js 18+
- PostgreSQL
- Yarn

**Run Locally**

- Install dependencies: `yarn install`
- Run Prisma migrations: `yarn prisma migrate dev`
- Start in dev: `yarn start:dev`
- Base URL: `http://localhost:${PORT}` (defaults to `1337` if set in `.env`, otherwise `3001`).

**Authentication**

- Type: Bearer JWT.
- Login: `POST /auth/login` returns `access_token`.
- Send `Authorization: Bearer <token>` on protected endpoints.
- Roles: `ADMIN`, `THERAPIST` (some endpoints require a specific role).

**Swagger Docs**

- UI: `GET /docs` (Basic Auth protected)
- Username: `admin` — Password: `password123` (dev only; change in `src/main.ts`).
- JSON schema: `GET /docs-json`

**Endpoints**

- Auth:
  - `POST /auth/login`
    - Description: Sign in and receive a JWT.
    - Body: `{ "email": "user@gmail.com", "password": "password123" }`
    - Response: `{ "access_token": "...", "user": { id, email, name, role } }`
  - `POST /auth/register`
    - Description: Create user (defaults to `THERAPIST` role).
    - Body: `{ "name": "John Doe", "email": "user@gmail.com", "password": "password123" }`
  - `POST /auth/forgot-password`
    - Description: Send reset link email if the user exists.
    - Body: `{ "email": "user@gmail.com" }`

- Users (Bearer required):
  - `GET /users/me`
    - Description: Get the current user profile.
  - `GET /users/all` (role: `ADMIN`)
    - Description: Paginated users.
    - Query: `page`, `limit`, `search`.
  - `GET /users/:id` (role: `ADMIN`)
    - Description: Get a user by id.
  - `PUT /users/:id` (roles: `ADMIN` or `THERAPIST`)
    - Description: Update a user.
    - Body: Partial user fields.
  - `DELETE /users/:id` (role: `ADMIN`)
    - Description: Delete a user.
  - `POST /users` (roles: `ADMIN` or `THERAPIST`)
    - Description: Create a user.
    - Body: `{ name, email, password }`.

- Memberships:
  - `GET /memberships`
    - Description: List available plans (public).

- Subscriptions (Bearer required):
  - `POST /subscriptions/create-checkout-session`
    - Description: Create a Stripe Checkout Session.
    - Body: `{ "priceId": "price_xxx" }`
  - `GET /subscriptions/me`
    - Description: Get current user subscription.
  - `POST /subscriptions/direct-create` (role: `ADMIN`)
    - Description: Create a subscription with `paymentMethodId` and `priceId`.
    - Body: `{ "paymentMethodId": "pm_xxx", "priceId": "price_xxx" }`

- Stripe Webhook:
  - `POST /webhook`
    - Description: Receives Stripe events (expects raw `application/json` body).
    - Usage: configured from Stripe; does not require `Bearer`.

- Clients (Bearer required, role: `THERAPIST`):
  - `POST /clients`
    - Description: Create a client attached to the authenticated therapist.
    - Body: `{ "name": "John Doe", "email?": "john@example.com", "birthDate?": "YYYY-MM-DD", "gender?": "MALE|FEMALE|OTHER", "notes?": "..." }`

- Form Invitations:
  - `POST /form-invitations` (Bearer, roles: `ADMIN` or `THERAPIST`)
    - Description: Create an invitation for a client to fill a form.
    - Body: `{ "clientId": "uuid", "formTemplateId": "uuid", "expiresAt?": "ISO-8601" }`
  - `GET /form-invitations` (Bearer, roles: `THERAPIST` or `ADMIN`)
    - Description: List invitations for the therapist.
  - `GET /form-invitations/:token` (public)
    - Description: Public invitation details and questions.
  - `POST /form-invitations/:token/responses` (public)
    - Description: Submit form responses.
    - Body: `{ "answers": { "question-id-1": "Answer 1", "question-id-2": "Answer 2" } }`
  - `PATCH /form-invitations/:token/complete` (public)
    - Description: Mark invitation as completed.
  - `GET /form-invitations/:token/responses` (Bearer, roles: `THERAPIST` or `ADMIN`)
    - Description: Get completed responses for an invitation.

- Form Responses (Bearer required, role: `THERAPIST`):
  - `POST /form-responses`
    - Description: Create a form response record.
    - Body: `{ "answers": { "question-id": "value" } }`

- Form Templates (Admin):
  - `POST /admin/form-templates` (Bearer, role: `ADMIN`)
    - Description: Create a new template.
    - Body: `{ "title": "GAD-7", "description?": "...", "isActive": true, "questions": [ { "text": "Question?", "type": "MULTIPLE_CHOICE|SCALE|TEXT|...", "options?": { ... }, "order": 1 } ] }`
  - `GET /admin/form-templates` (Bearer, role: `ADMIN`)
    - Description: Paginated list. Query: `page`, `limit`, `search`.
  - `GET /admin/form-templates/:id` (Bearer, role: `ADMIN`)
    - Description: Get a template by id.
  - `DELETE /admin/form-templates/:id` (Bearer, role: `ADMIN`)
    - Description: Delete a template.

- Therapist (Bearer required, role: `THERAPIST`):
  - `PUT /therapist/profile`
    - Description: Update therapist profile.
  - `GET /therapist/clients`
    - Description: Therapist’s clients (paginated). Query: `page`, `limit`, `search`.
  - `POST /therapist/clients`
    - Description: Create client (same as `POST /clients`).
  - `GET /therapist/responses`
    - Description: Paginated list of answered forms.
  - `GET /therapist/responses/:id`
    - Description: Detailed answers of a form.

**Environment Variables**

- `DATABASE_URL`: PostgreSQL connection string.
- `JWT_SECRET`: JWT signing secret.
- `PORT`: API port (e.g. `1337`).
- `FRONTEND_URL`: Public frontend URL.
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_ID`: Stripe integration.
- SMTP: `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`.

Note: Do not commit real secrets. Use a local `.env`.

**Quick Examples**

- Login
  - `curl -X POST http://localhost:1337/auth/login -H 'Content-Type: application/json' -d '{"email":"user@gmail.com","password":"password123"}'`
- Create invitation (Therapist/Admin)
  - `curl -X POST http://localhost:1337/form-invitations -H 'Authorization: Bearer <JWT>' -H 'Content-Type: application/json' -d '{"clientId":"<uuid>","formTemplateId":"<uuid>"}'`
