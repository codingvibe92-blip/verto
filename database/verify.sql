USE crunchx;
SELECT COUNT(*) AS table_count FROM information_schema.tables WHERE table_schema='crunchx';
SELECT COUNT(*) AS users_cnt FROM users;
SELECT COUNT(*) AS roles_cnt FROM roles;
SELECT COUNT(*) AS perms_cnt FROM permissions;
SELECT COUNT(*) AS role_perms_cnt FROM role_permissions;
SELECT u.id, u.name, u.email, r.slug AS role FROM users u JOIN user_roles ur ON ur.user_id=u.id JOIN roles r ON r.id=ur.role_id;