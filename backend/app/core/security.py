from datetime import datetime, timezone
from typing import Optional

def get_current_utc_time() -> datetime:
    """Returns the current timezone-aware UTC timestamp."""
    return datetime.now(timezone.utc)
