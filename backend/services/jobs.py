from __future__ import annotations

import threading
from contextlib import contextmanager

_MAX_HEAVY = 2
_sem = threading.BoundedSemaphore(_MAX_HEAVY)


class Busy(Exception):
    """Raised when no heavy slot is free within the timeout."""


@contextmanager
def heavy_slot(timeout: float = 0.0):
    acquired = _sem.acquire(timeout=timeout) if timeout > 0 else _sem.acquire(blocking=False)
    if not acquired:
        raise Busy()
    try:
        yield
    finally:
        _sem.release()
