-- NextAuth identifies an account by provider and providerAccountId.
-- Existing Keycloak account links must use the generic OIDC provider ID.
UPDATE "Account"
SET "provider" = 'oidc'
WHERE "provider" = 'keycloak';
