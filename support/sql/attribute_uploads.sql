-- Usage: psql -d <db> -v files="<name>,<name>,..." -f support/sql/attribute_uploads.sql
-- For each file name in uploads/, what refers to it: an actor's avatar or banner, or a media row
-- and what that is attached to. A file with no row is an orphan: nothing refers to it any more.
WITH f(name) AS (
  SELECT trim(n) FROM unnest(string_to_array(:'files', ',')) AS n
),
refs AS (
  SELECT 'avatar' AS used_as, a.id AS actor_id, NULL::bigint AS media_id, a.avatar ->> 'url' AS url
  FROM actors a WHERE a.avatar IS NOT NULL
  UNION ALL
  SELECT 'banner', a.id, NULL, a.banner ->> 'url'
  FROM actors a WHERE a.banner IS NOT NULL
  UNION ALL
  SELECT 'media', m.actor_id, m.id, m.file ->> 'url'
  FROM medias m
)
SELECT
  f.name,
  coalesce(r.used_as, 'ORPHAN') AS used_as,
  CASE WHEN a.id IS NULL THEN NULL WHEN a.domain IS NULL THEN 'local' ELSE 'remote' END AS origin,
  a.type AS actor_type,
  a.preferred_username || coalesce('@' || a.domain, '') AS actor,
  a.inserted_at AS actor_created,
  a.last_refreshed_at,
  a.suspended,
  u.email,
  u.inserted_at AS user_created,
  u.confirmed_at,
  u.current_sign_in_ip,
  concat_ws(' ',
    (SELECT 'event-picture:' || string_agg(e.id::text, ',') FROM events e WHERE e.picture_id = r.media_id),
    (SELECT 'in-event:' || string_agg(em.event_id::text, ',') FROM events_medias em WHERE em.media_id = r.media_id),
    (SELECT 'post-picture:' || string_agg(p.id::text, ',') FROM posts p WHERE p.picture_id = r.media_id),
    (SELECT 'in-post:' || string_agg(pm.post_id::text, ',') FROM posts_medias pm WHERE pm.media_id = r.media_id),
    (SELECT 'in-comment:' || string_agg(cm.comment_id::text, ',') FROM comments_medias cm WHERE cm.media_id = r.media_id),
    (SELECT 'admin-setting:' || string_agg(s.name, ',') FROM admin_settings_medias s WHERE s.media_id = r.media_id)
  ) AS attached_to
FROM f
LEFT JOIN refs r ON r.url LIKE '%/' || f.name
LEFT JOIN actors a ON a.id = r.actor_id
LEFT JOIN users u ON u.id = a.user_id
ORDER BY f.name, used_as;
