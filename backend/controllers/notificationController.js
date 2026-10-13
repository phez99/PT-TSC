import Notification from '../models/Notification.js';
import { successResponse } from '../utils/apiResponse.js';

export const getMyNotifications = async (req, res, next) => {
  try {
    const items = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);
    return successResponse(res, { statusCode: 200, data: { items } });
  } catch (err) {
    next(err);
  }
};

export const markRead = async (req, res, next) => {
  try {
    await Notification.updateOne({ _id: req.params.id, recipient: req.user._id }, { isRead: true });
    return successResponse(res, { statusCode: 200, data: null });
  } catch (err) {
    next(err);
  }
};

export const markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
    return successResponse(res, { statusCode: 200, data: null });
  } catch (err) {
    next(err);
  }
};
