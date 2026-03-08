import { findUserWithTodos, updateUserById } from '@/models/user.model';

export const getUserProfile = async (userId: string) => {
  const user = await findUserWithTodos(userId);
  if (!user) throw new Error('User not found');

  const total = user.todos.length;
  const completedTodos = user.todos.filter((t) => t.completed);
  const completionRate = total === 0 ? 0 : Math.round((completedTodos.length / total) * 100);

  // Build heatmap data: { "YYYY-MM-DD": count }
  const heatmap: Record<string, number> = {};
  for (const todo of completedTodos) {
    if (!todo.completedAt) continue;
    const day = todo.completedAt.toISOString().slice(0, 10);
    heatmap[day] = (heatmap[day] ?? 0) + 1;
  }

  // Current streak: consecutive days with at least one completion ending today or yesterday
  const streak = calcStreak(heatmap);

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    stats: {
      total,
      completed: completedTodos.length,
      completionRate,
      streak,
    },
    heatmap,
  };
};

const calcStreak = (heatmap: Record<string, number>): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 0;
  const cursor = new Date(today);

  // Allow streak to start from yesterday if nothing completed today yet
  if (!heatmap[cursor.toISOString().slice(0, 10)]) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (heatmap[cursor.toISOString().slice(0, 10)]) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
};

export const updateUser = async (userId: string, data: { name?: string }) => {
  if (data.name !== undefined) {
    if (!data.name.trim()) throw new Error('Name cannot be empty');
    data.name = data.name.trim();
  }
  return updateUserById(userId, data);
};
