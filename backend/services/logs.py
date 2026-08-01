from __future__ import annotations


def log(text: str) -> None:
    try:
        print(text)
    except Exception:
        try:
            print(text.encode("ascii", "replace").decode("ascii"))
        except Exception:
            pass
