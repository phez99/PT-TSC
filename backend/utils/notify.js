import Notification from '../models/Notification.js';
import User from '../models/User.js';

export async function notifyRoles(roles, payload, excludeUserId) {
  const filter = { role: { $in: roles }, isActive: true };
  if (excludeUserId) filter._id = { $ne: excludeUserId };

  const users = await User.find(filter).select('_id');
  if (!users.length) return;

  await Notification.insertMany(users.map((u) => ({ recipient: u._id, ...payload })));
}

export async function notifyUser(userId, payload) {
  await Notification.create({ recipient: userId, ...payload });
}
