"use client";

import React, { useEffect, useState } from "react";

export default function RewardAnalytics() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    async function fetchData() {
      const res = await fetch('/api/rewards/analytics');
      if (!res.ok) return;
      const json = await res.json();
      if (mounted) setData(json);
    }
    fetchData();
    return () => { mounted = false; };
  }, []);

  if (!data) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="p-4 bg-white dark:bg-gray-800 rounded">
        <div className="text-sm text-gray-500">Current Streak</div>
        <div className="text-2xl font-bold">{data.currentStreak}</div>
      </div>
      <div className="p-4 bg-white dark:bg-gray-800 rounded">
        <div className="text-sm text-gray-500">Best Streak</div>
        <div className="text-2xl font-bold">{data.bestStreak}</div>
      </div>
      <div className="p-4 bg-white dark:bg-gray-800 rounded">
        <div className="text-sm text-gray-500">Today's Bonus</div>
        <div className="text-2xl font-bold">{data.todaysBonus ? `৳${data.todaysBonus.amount}` : '—'}</div>
      </div>
      <div className="p-4 bg-white dark:bg-gray-800 rounded">
        <div className="text-sm text-gray-500">This Week Bonus</div>
        <div className="text-2xl font-bold">{data.thisWeekBonus ? `৳${data.thisWeekBonus.amount}` : '—'}</div>
      </div>
      <div className="p-4 bg-white dark:bg-gray-800 rounded">
        <div className="text-sm text-gray-500">80%+ Days</div>
        <div className="text-2xl font-bold">{data.count80Days}</div>
      </div>
      <div className="p-4 bg-white dark:bg-gray-800 rounded">
        <div className="text-sm text-gray-500">Lifetime Earned</div>
        <div className="text-2xl font-bold">৳{data.lifetimeEarned}</div>
      </div>
      <div className="p-4 bg-white dark:bg-gray-800 rounded">
        <div className="text-sm text-gray-500">Pending Rewards</div>
        <div className="text-2xl font-bold">{data.pending}</div>
      </div>
    </div>
  );
}
