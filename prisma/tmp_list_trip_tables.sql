SELECT schemaname, tablename
FROM pg_catalog.pg_tables
WHERE tablename ILIKE 'trip%';
