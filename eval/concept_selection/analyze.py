#!/usr/bin/env python3
"""コンセプト選定ルール (n+1) のベンチマーク分析"""

import json
import os
import math
from collections import Counter

DOMAINS = [
    "自然・物理・数学",
    "生命・身体・動物",
    "技術・道具・構造",
    "産業・農・食",
    "社会・制度・経済",
    "歴史・時間・場所",
    "哲学・思考・感情",
    "言語・記号・物語",
    "芸術・音楽・運動",
    "情報・メディア",
    "日常・習慣",
]

NS = [0, 3, 7, 11, 20, 50]


def entropy(counts: Counter) -> float:
    total = sum(counts.values())
    if total == 0:
        return 0.0
    return -sum((c / total) * math.log2(c / total) for c in counts.values() if c > 0)


def normalize_domain(domain: str) -> str:
    """部分一致で正規化"""
    for d in DOMAINS:
        if d in domain or domain in d:
            return d
    return domain  # 未知ドメインはそのまま


def analyze(results_dir: str = "results"):
    print("=" * 60)
    print("コンセプト選定ルール (n+1) ベンチマーク結果")
    print("=" * 60)

    summary = []

    for n in NS:
        # n{N}.json + n{N}_r*.json を全て集約
        import glob
        pattern = os.path.join(results_dir, f"n{n}.json")
        patterns_r = os.path.join(results_dir, f"n{n}_r*.json")
        files = sorted(glob.glob(pattern) + glob.glob(patterns_r))
        if not files:
            print(f"\nn={n}: 結果ファイルなし")
            continue

        trials = []
        for f_path in files:
            with open(f_path) as f:
                trials.extend(json.load(f))

        def get_excluded(t):
            # 旧: excluded / 新: rejected_candidates
            return t.get("excluded") or t.get("rejected_candidates", [])

        def get_chosen(t):
            # 旧: chosen / 新: adopted
            return t.get("chosen") or t.get("adopted", {})

        def get_overlap(t):
            # 旧: overlaps_existing / 新: duplicate
            v = t.get("overlaps_existing")
            if v is None:
                v = t.get("duplicate", False)
            return bool(v)

        # 除外候補ドメイン分布
        excluded_domains: Counter = Counter()
        for t in trials:
            for ex in get_excluded(t):
                excluded_domains[normalize_domain(ex.get("domain", ""))] += 1

        # 採用コンセプトドメイン分布
        chosen_domains: Counter = Counter()
        for t in trials:
            chosen = get_chosen(t)
            chosen_domains[normalize_domain(chosen.get("domain", ""))] += 1

        # works.json 被り率
        overlap_count = sum(1 for t in trials if get_overlap(t))
        overlap_rate = overlap_count / len(trials) if trials else 0

        chosen_entropy = entropy(chosen_domains)
        excluded_entropy = entropy(excluded_domains) if n > 0 else None
        max_entropy = math.log2(len(DOMAINS))

        print(f"\n{'─'*50}")
        print(f"n={n}  (試行数: {len(trials)}, 採用: n+1={n+1}個目)")
        print(f"{'─'*50}")
        print(f"works.json 被り率:  {overlap_rate:.0%}  ({overlap_count}/{len(trials)})")
        print(f"採用ドメイン エントロピー: {chosen_entropy:.2f} / {max_entropy:.2f}")

        print("\n採用コンセプト ドメイン分布:")
        for d in DOMAINS:
            c = chosen_domains.get(d, 0)
            bar = "█" * c
            print(f"  {d:12s} {c:2d}  {bar}")

        if n > 0:
            print(f"\n除外候補 エントロピー: {excluded_entropy:.2f} / {max_entropy:.2f}")
            print("除外候補 上位3ドメイン:")
            for d, c in excluded_domains.most_common(3):
                total_excluded = sum(excluded_domains.values())
                print(f"  {d:12s} {c:3d}  ({c/total_excluded:.0%})")

        summary.append({
            "n": n,
            "trials": len(trials),
            "overlap_rate": round(overlap_rate, 3),
            "chosen_entropy": round(chosen_entropy, 3),
            "excluded_entropy": round(excluded_entropy, 3) if excluded_entropy else None,
        })

    # サマリー比較表
    if summary:
        print(f"\n{'='*60}")
        print("サマリー比較")
        print(f"{'='*60}")
        print(f"{'n':>4}  {'採用エントロピー':>14}  {'除外エントロピー':>14}  {'被り率':>6}")
        print(f"{'─'*50}")
        for s in summary:
            exc = f"{s['excluded_entropy']:.2f}" if s['excluded_entropy'] is not None else "  —  "
            print(f"{s['n']:>4}  {s['chosen_entropy']:>14.2f}  {exc:>14}  {s['overlap_rate']:>5.0%}")


if __name__ == "__main__":
    import sys
    d = sys.argv[1] if len(sys.argv) > 1 else "results"
    analyze(os.path.join(os.path.dirname(__file__), d))
