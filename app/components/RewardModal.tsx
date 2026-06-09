"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Reward = {
  _id: string;
  type: string;
  amount: number;
  productivity?: number;
  milestone?: string;
  achievedAt?: string | Date;
};

export default function RewardModal({ initialRewards = [], onAcknowledge }: { initialRewards?: Reward[]; onAcknowledge?: () => Promise<void>; }) {
  const [queue, setQueue] = useState<Reward[]>(initialRewards || []);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setQueue(initialRewards || []);
    setVisible((initialRewards || []).length > 0);
  }, [initialRewards]);

  async function acknowledgeCurrent() {
    if (!queue || queue.length === 0) return;
    const current = queue[0];
    try {
      await fetch('/api/rewards/acknowledge', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ rewardId: current._id }),
      });
    } catch (e) {
      // ignore network errors
    }
    const remaining = queue.slice(1);
    setQueue(remaining);
    if (remaining.length === 0) setVisible(false);
    if (onAcknowledge) await onAcknowledge();
  }

  if (!visible || !queue || queue.length === 0) return null;

  const current = queue[0];

  const titleMap: Record<string, string> = {
    daily_bonus: "🎉 Daily Bonus Earned",
    weekly_bonus: "🔥 Weekly Bonus Earned",
    streak_bonus: "🔥 Streak Achievement",
    high_completion_bonus: "🏆 High Completion Achievement",
    perfect_day_bonus: "⭐ Perfect Day Bonus!",
    category_100_bonus: "✨ Category Perfect!",
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="relative z-10 max-w-lg w-full bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6 mx-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold">{titleMap[current.type] ?? 'Reward'}</h3>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {current.type === 'daily_bonus' || current.type === 'weekly_bonus' || current.type === 'perfect_day_bonus' ? (
                <>
                  <div>Date: {new Date(current.achievedAt || Date.now()).toLocaleDateString()}</div>
                  <div>Productivity: {current.productivity ?? '-'}%</div>
                </>
              ) : null}
              {current.type === 'category_100_bonus' && (current as any).categoryName ? (
                <>
                  <div>Category: {(current as any).categoryName}</div>
                  <div>Date: {new Date(current.achievedAt || Date.now()).toLocaleDateString()}</div>
                  <div>Productivity: 100%</div>
                </>
              ) : null}
              {current.milestone ? <div className="mt-2">{current.milestone.replaceAll('_', ' ')}</div> : null}
              <div className="mt-2 text-lg font-medium">Reward: ৳{current.amount}</div>
            </div>
            <div className="pt-4">
              <button onClick={acknowledgeCurrent} className="px-4 py-2 bg-blue-600 text-white rounded-md">
                OK
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
