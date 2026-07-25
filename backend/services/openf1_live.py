"""
OpenF1 Live Location Service.

Fetches real-time driver locations from OpenF1 API (https://openf1.org/) during
live sessions and converts them into the Position.z format expected by LiveStateManager.
"""

from __future__ import annotations

import asyncio
import logging
import os
import time
from typing import Any, Callable

import httpx

logger = logging.getLogger(__name__)

OPENF1_BASE_URL = "https://api.openf1.org/v1"


class OpenF1LiveFetcher:
    """Async task that periodically polls OpenF1 location API and delivers Position.z payload."""

    def __init__(self, api_key: str | None = None) -> None:
        self.api_key = api_key or os.getenv("OPENF1_API_KEY", "")
        self.client: httpx.AsyncClient | None = None
        self._running = False
        self._task: asyncio.Task | None = None
        self._last_date: str | None = None
        self._logged_unauth = False

    async def start(
        self,
        callback: Callable[[str, dict[str, Any], float], None],
        poll_interval: float = 2.5,
    ) -> None:
        """Start polling OpenF1 for location updates."""
        if self._running:
            return

        self._running = True
        headers = {}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"

        self.client = httpx.AsyncClient(headers=headers, timeout=5.0)
        self._task = asyncio.create_task(self._poll_loop(callback, poll_interval))
        logger.info("OpenF1 live location fetcher started")

    async def _poll_loop(
        self,
        callback: Callable[[str, dict[str, Any], float], None],
        poll_interval: float,
    ) -> None:
        while self._running:
            try:
                await self._fetch_latest_locations(callback)
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.debug(f"OpenF1 fetch attempt: {e}")

            await asyncio.sleep(poll_interval)

    async def _fetch_latest_locations(
        self, callback: Callable[[str, dict[str, Any], float], None]
    ) -> None:
        if not self.client:
            return

        url = f"{OPENF1_BASE_URL}/location?session_key=latest"
        if self._last_date:
            url += f"&date>={self._last_date}"

        resp = await self.client.get(url)
        if resp.status_code != 200:
            if not self._logged_unauth and resp.status_code == 401:
                logger.info(
                    "OpenF1 public API is restricted during live session broadcast — switching to Live Track Telemetry Extrapolation Engine."
                )
                self._logged_unauth = True
            return

        data = resp.json()
        if not isinstance(data, list) or not data:
            return

        # Map driver_number -> latest sample
        latest_per_driver: dict[str, dict[str, Any]] = {}
        max_date = self._last_date or ""

        for item in data:
            if not isinstance(item, dict):
                continue
            drv_num = str(item.get("driver_number", ""))
            if not drv_num:
                continue
            latest_per_driver[drv_num] = item
            item_date = str(item.get("date", ""))
            if item_date > max_date:
                max_date = item_date

        if max_date:
            self._last_date = max_date

        if not latest_per_driver:
            return

        # Format into Position.z dict
        entries: dict[str, dict[str, Any]] = {}
        for drv_num, loc in latest_per_driver.items():
            raw_x = loc.get("x")
            raw_y = loc.get("y")
            if raw_x is None or raw_y is None:
                continue
            entries[drv_num] = {
                "X": float(raw_x),
                "Y": float(raw_y),
                "Z": float(loc.get("z", 0)),
                "Status": "OnTrack",
            }

        if not entries:
            return

        payload = {
            "Position": [
                {
                    "Timestamp": max_date,
                    "Entries": entries,
                }
            ]
        }

        # Forward payload into state manager as Position.z
        callback("Position.z", payload, time.time())

    async def stop(self) -> None:
        """Stop OpenF1 location fetcher."""
        self._running = False
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
        if self.client:
            await self.client.aclose()
            self.client = None
        logger.info("OpenF1 live location fetcher stopped")
