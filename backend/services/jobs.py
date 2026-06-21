from __future__ import annotations

import threading
from contextlib import contextmanager

# Limit heavy operations (yt-dlp fetch, voice diarization) running at once so a
# burst of users can't exhaust RAM/CPU and crash the server. Others queue/await.
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
