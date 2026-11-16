#!/usr/bin/env python3
# cleanup_history.py — одноразовая очистка истории протоколов (решение владельца, 2026-11-16):
#   валидны только два последних промежуточных протокола; более старая история не имеет смысла.
#
#   Оставляем:
#     - gap_history, protocols, index_history: только текущую неделю (MAX(week_start), сейчас 2026-11-09);
#       сегодняшний FINAL за 11-09 и будущие недели попадут в «оставляемые» автоматически.
#     - daily_snapshots: два последних среза по snapshot_date (на скриншоте: 15/11 и 14/11).
#   Удаляем: всё старше перечисленного в ЧЕТЫРЁХ таблицах истории.
#   НЕ трогаем: items (сырые данные), voices, cron_drift_events и прочие операционные логи.
#
# Протокол: dry-run (по умолчанию) — только показать план; --apply — ПОЛНЫЙ бэкап
# четырёх таблиц в JSON, затем DELETE, затем сверка остатков. Восстановление — из бэкапа.
import argparse
import json
import subprocess
import sys
import time
from pathlib import Path

DB = "human-ai-monitor-db"
TABLES = ["protocols", "gap_history", "index_history", "daily_snapshots"]


def d1(sql: str, cwd: str) -> dict:
    p = subprocess.run(
        ["npx", "wrangler", "d1", "execute", DB, "--remote", "--json", "--command", sql],
        cwd=cwd, capture_output=True, text=True, timeout=300,
    )
    out = p.stdout.strip()
    starts = [i for i in (out.find("["), out.find("{")) if i >= 0]
    if p.returncode != 0 or not starts:
        print("[FAIL] wrangler:", (p.stderr or p.stdout)[-600:])
        sys.exit(1)
    return json.loads(out[min(starts):])


def one(sql: str, cwd: str):
    return d1(sql, cwd)[0]["results"]


def scalar(sql: str, cwd: str):
    r = one(sql, cwd)
    return list(r[0].values())[0] if r else None


def main():
    ap = argparse.ArgumentParser(description="Очистка истории протоколов (backed-up, irreversible)")
    ap.add_argument("--repo", default=".", help="корень human-ai-monitor-collector (для npx wrangler)")
    ap.add_argument("--apply", action="store_true", help="бэкап + удаление (по умолчанию только план)")
    args = ap.parse_args()
    repo = str(Path(args.repo).resolve())

    # 0. Доступность таблиц
    names = [r["name"] for r in one("SELECT name FROM sqlite_master WHERE type='table'", repo)]
    missing = [t for t in TABLES if t not in names]
    if missing:
        print("[FAIL] нет таблиц:", missing)
        sys.exit(1)

    # 1. Отсечки (динамически, не хардкодом)
    cutoff_week = scalar("SELECT MAX(week_start) FROM gap_history", repo)
    snap_dates = [r["snapshot_date"] for r in
                  one("SELECT DISTINCT snapshot_date FROM daily_snapshots ORDER BY snapshot_date DESC LIMIT 2", repo)]
    print("=== Очистка истории протоколов — %s ===" % ("APPLY" if args.apply else "DRY-RUN"))
    print("cutoff_week (остаётся в gap_history/protocols/index_history): %s" % cutoff_week)
    print("daily_snapshots остаётся (2 последних): %s\n" % ", ".join(snap_dates))

    deletes = [
        ("gap_history", "DELETE FROM gap_history WHERE week_start < '%s'" % cutoff_week),
        ("protocols", "DELETE FROM protocols WHERE week_start < '%s'" % cutoff_week),
        ("index_history", "DELETE FROM index_history WHERE date < '%s'" % cutoff_week),
        ("daily_snapshots",
         "DELETE FROM daily_snapshots WHERE snapshot_date NOT IN (%s)"
         % ", ".join("'%s'" % d for d in snap_dates)),
    ]

    # 2. План: сколько будет удалено/останется
    plan_ok = True
    for table, sql in deletes:
        col = {"gap_history": "week_start", "protocols": "week_start",
               "index_history": "date", "daily_snapshots": "snapshot_date"}[table]
        total = scalar("SELECT COUNT(*) FROM %s" % table, repo) or 0
        if table == "daily_snapshots":
            keep_sql = ("SELECT COUNT(*) FROM daily_snapshots WHERE snapshot_date IN (%s)"
                        % ", ".join("'%s'" % d for d in snap_dates))
        else:
            keep_sql = "SELECT COUNT(*) FROM %s WHERE %s >= '%s'" % (table, col, cutoff_week)
        keep = scalar(keep_sql, repo) or 0
        deln = scalar(sql.replace("DELETE FROM", "SELECT COUNT(*) FROM", 1), repo) or 0
        print("[PLAN] %-16s всего=%-5s удалить=%-5s остаётся=%s" % (table, total, deln, keep))
        weeks = one("SELECT MIN(%s) AS a, MAX(%s) AS b FROM %s" % (col, col, table), repo)[0]
        print("       диапазон данных: %s .. %s" % (weeks["a"], weeks["b"]))

    if not args.apply:
        print("\nDry-run: ничего не удалено. SQL удаления:")
        for _, sql in deletes:
            print("  " + sql)
        print("\nДальше: python3 cleanup_history.py --repo . --apply")
        sys.exit(0)

    # 3. ПОЛНЫЙ бэкап четырёх таблиц (не только удаляемых строк — чтобы restore был тривиален)
    stamp = time.strftime("%Y%m%d_%H%M%S")
    bdir = Path("backup_history_" + stamp)
    bdir.mkdir(exist_ok=True)
    for table in TABLES:
        rows = one("SELECT * FROM %s" % table, repo)
        (bdir / (table + ".json")).write_text(json.dumps(rows, ensure_ascii=False, indent=1))
        print("[BACKUP] %-16s %d строк -> %s/%s.json" % (table, len(rows), bdir, table))
    (bdir / "README.txt").write_text(
        "Полные дампы таблиц до очистки истории %s.\n"
        "Восстановление: при необходимости преобразовать JSON в INSERT — скрипт-конвертер предоставляется.\n" % stamp)

    # 4. Удаление
    for table, sql in deletes:
        meta = d1(sql, repo)[0]["meta"]
        print("[DELETE] %-16s changes=%s" % (table, meta.get("changes")))

    # 5. Сверка остатков
    print("\n=== Остатки после очистки ===")
    for table, col in [("gap_history", "week_start"), ("protocols", "week_start"),
                       ("index_history", "date"), ("daily_snapshots", "snapshot_date")]:
        n = scalar("SELECT COUNT(*) FROM %s" % table, repo)
        rng = one("SELECT MIN(%s) AS a, MAX(%s) AS b FROM %s" % (col, col, table), repo)[0]
        print("[OK] %-16s строк=%-5s диапазон: %s .. %s" % (table, n, rng["a"], rng["b"]))
    print("\nПроверь API: /gap (текущая строка недели), /daily-snapshots (2 записи), /protocols (1 неделя).")


if __name__ == "__main__":
    main()
