import threading
import time

_lock = threading.Lock()

_stats = {
    "total_quests": 0,
    "total_chains": 0,
    "start_time": time.time(),
}


def increment_quests():
    with _lock:
        _stats["total_quests"] += 1


def increment_chains():
    with _lock:
        _stats["total_chains"] += 1


def get_stats() -> dict:
    with _lock:
        uptime = int(time.time() - _stats["start_time"])
        return {
            "total_quests_generated": _stats["total_quests"],
            "total_chains_generated": _stats["total_chains"],
            "uptime_seconds": uptime,
        }
