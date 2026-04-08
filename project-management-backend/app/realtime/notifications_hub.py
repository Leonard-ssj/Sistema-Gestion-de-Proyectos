import json
import queue
import threading
from typing import Dict, List


class NotificationsHub:
    def __init__(self):
        self._lock = threading.Lock()
        self._subscribers: Dict[str, List[queue.Queue]] = {}

    def subscribe(self, user_id: str) -> queue.Queue:
        q: queue.Queue = queue.Queue()
        with self._lock:
            self._subscribers.setdefault(user_id, []).append(q)
        return q

    def unsubscribe(self, user_id: str, q: queue.Queue) -> None:
        with self._lock:
            qs = self._subscribers.get(user_id) or []
            if q in qs:
                qs.remove(q)
            if not qs and user_id in self._subscribers:
                del self._subscribers[user_id]

    def publish(self, user_id: str, payload: dict) -> None:
        data = json.dumps(payload, ensure_ascii=False)
        with self._lock:
            qs = list(self._subscribers.get(user_id) or [])
        for q in qs:
            try:
                q.put_nowait(data)
            except Exception:
                pass


notifications_hub = NotificationsHub()
