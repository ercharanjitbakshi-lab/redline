# 06: Delete a document

**What to build:** A way for the user to delete a saved document. The row-level
security policy for delete already exists (`supabase/migrations/0001`), and
`analyses` rows cascade with their document. Needs a delete control on the
document page with a confirmation step (a delete is irreversible), and a server
action that deletes through the user's own Supabase session.

**Blocked by:** None

**Status:** needs-triage

- [ ] Deleting a document removes it and its analyses, then returns to
      `/documents`.
- [ ] The control asks for confirmation before deleting.
