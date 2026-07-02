# BoxIQ Master Supabase Context

## Purpose

This Supabase project is the ONLY database used by every BoxIQ application.

Applications:

- BoxIQ ERP (Internal)
- BoxIQ Customer Platform
- Future Mobile App
- Future Sales App
- Future Vendor Portal

---

## Rules

1. ERP owns the database.
2. Customer Platform NEVER creates duplicate business logic.
3. Every quotation, order, inventory movement, artwork approval and production job comes from this database.
4. No duplicate tables.
5. No duplicate pricing engines.
6. No duplicate quotation logic.
7. Authentication is shared.
8. RLS must protect every customer.
9. ERP users have role-based permissions.
10. Every AI must read this file before changing database code.

---

## Source of Truth

ERP Database

↓

Shared Services

↓

Customer Platform

---

Never create another database for BoxIQ.
Never duplicate services.
Always extend the existing schema.
