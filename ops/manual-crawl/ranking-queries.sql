-- Monthly auction ranking (total hammer + sell-through)
WITH base AS (
  SELECT
    e.event_id,
    e.house,
    e.sale_title,
    date_trunc('month', e.sale_date_local)::date AS month_start,
    COUNT(*) AS offered_lots,
    COUNT(*) FILTER (WHERE l.sold_flag = true) AS sold_lots,
    COALESCE(SUM(l.hammer_price) FILTER (WHERE l.sold_flag = true), 0) AS total_hammer
  FROM events e
  JOIN lots l ON l.event_id = e.event_id
  WHERE e.is_key_evening_sale = true
    AND e.sale_date_local >= DATE '2026-01-01'
    AND e.sale_date_local <  DATE '2027-01-01'
    AND e.status IN ('done', 'completed')
  GROUP BY 1,2,3,4
)
SELECT
  month_start,
  event_id,
  house,
  sale_title,
  offered_lots,
  sold_lots,
  ROUND((sold_lots::numeric / NULLIF(offered_lots, 0)) * 100, 2) AS sell_through_rate_pct,
  total_hammer,
  RANK() OVER (PARTITION BY month_start ORDER BY total_hammer DESC) AS rank_total_hammer
FROM base
ORDER BY month_start, rank_total_hammer;


-- Monthly artist ranking (total hammer)
WITH artist_month AS (
  SELECT
    date_trunc('month', e.sale_date_local)::date AS month_start,
    COALESCE(NULLIF(TRIM(l.artist_name), ''), 'UNKNOWN') AS artist_name,
    COUNT(*) AS offered_lots,
    COUNT(*) FILTER (WHERE l.sold_flag = true) AS sold_lots,
    COALESCE(SUM(l.hammer_price) FILTER (WHERE l.sold_flag = true), 0) AS total_hammer,
    COALESCE(AVG(l.hammer_price) FILTER (WHERE l.sold_flag = true), 0) AS avg_hammer
  FROM events e
  JOIN lots l ON l.event_id = e.event_id
  WHERE e.is_key_evening_sale = true
    AND e.sale_date_local >= DATE '2026-01-01'
    AND e.sale_date_local <  DATE '2027-01-01'
    AND e.status IN ('done', 'completed')
  GROUP BY 1,2
)
SELECT
  month_start,
  artist_name,
  offered_lots,
  sold_lots,
  ROUND((sold_lots::numeric / NULLIF(offered_lots, 0)) * 100, 2) AS sell_through_rate_pct,
  total_hammer,
  ROUND(avg_hammer, 2) AS avg_hammer,
  RANK() OVER (PARTITION BY month_start ORDER BY total_hammer DESC) AS artist_rank
FROM artist_month
WHERE offered_lots >= 2
ORDER BY month_start, artist_rank;


-- Monthly sell-through ranking (event-level, minimum lot threshold)
WITH event_stats AS (
  SELECT
    date_trunc('month', e.sale_date_local)::date AS month_start,
    e.event_id,
    e.house,
    e.sale_title,
    COUNT(*) AS offered_lots,
    COUNT(*) FILTER (WHERE l.sold_flag = true) AS sold_lots
  FROM events e
  JOIN lots l ON l.event_id = e.event_id
  WHERE e.is_key_evening_sale = true
    AND e.sale_date_local >= DATE '2026-01-01'
    AND e.sale_date_local <  DATE '2027-01-01'
    AND e.status IN ('done', 'completed')
  GROUP BY 1,2,3,4
)
SELECT
  month_start,
  event_id,
  house,
  sale_title,
  offered_lots,
  sold_lots,
  ROUND((sold_lots::numeric / NULLIF(offered_lots, 0)) * 100, 2) AS sell_through_rate_pct,
  DENSE_RANK() OVER (
    PARTITION BY month_start
    ORDER BY (sold_lots::numeric / NULLIF(offered_lots, 0)) DESC, offered_lots DESC
  ) AS sell_through_rank
FROM event_stats
WHERE offered_lots >= 20
ORDER BY month_start, sell_through_rank;
