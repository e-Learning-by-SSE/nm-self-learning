-- Wipes the complete DB, used to test DB migration
-- Use only in DEV, never in production!
-- Author: Sascha El-Sharkawy
-- Source: https://stackoverflow.com/a/13823560
drop schema public cascade;
create schema public;