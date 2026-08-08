import sys

from lc import parse_listening

def check(test: int) -> list[str]:
    d = parse_listening(test)
    bad = []
    for it in d["p1"]:
        if len(it["statements"]) != 4:
            bad.append(f"p1 q{it['n']} options={len(it['statements'])}")
        if it["answer"] is None:
            bad.append(f"p1 q{it['n']} no answer")
        if len(it["vi"]) != 4:
            bad.append(f"p1 q{it['n']} vi={len(it['vi'])}")
    for it in d["p2"]:
        if len(it["options"]) != 3:
            bad.append(f"p2 q{it['n']} options={len(it['options'])}")
        if it["answer"] is None:
            bad.append(f"p2 q{it['n']} no answer")
        if not it["q"]:
            bad.append(f"p2 q{it['n']} no question")
        if len(it["viOptions"]) != 3:
            bad.append(f"p2 q{it['n']} vi={len(it['viOptions'])}")
    for part in ("p3", "p4"):
        for grp in d[part]:
            if not grp["script"]:
                bad.append(f"{part} {grp['ns'][0]} empty script")
            if part == "p3" and len(grp["script"]) < 2:
                bad.append(f"{part} {grp['ns'][0]} script lines={len(grp['script'])}")
            for q in grp["questions"]:
                if len(q["options"]) != 4:
                    bad.append(f"{part} q{q['n']} options={len(q['options'])}")
                if q["answer"] is None:
                    bad.append(f"{part} q{q['n']} no answer")
                if not q["q"]:
                    bad.append(f"{part} q{q['n']} no question")
                if len(q["viOptions"]) != 4:
                    bad.append(f"{part} q{q['n']} vi={len(q['viOptions'])}")
    return bad

if __name__ == "__main__":
    tests = [int(a) for a in sys.argv[1:]] or list(range(1, 11))
    for t in tests:
        issues = check(t)
        print(f"TEST {t}: {'OK' if not issues else str(len(issues)) + ' issues'}")
        for i in issues[:40]:
            print("   ", i)
