import React from 'react';
import { X, Bell, Check, Trash2, Send, AlertCircle, Sparkles } from 'lucide-react';
import { PushNotification } from '../types';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: PushNotification[];
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onSendTestNotification: () => void;
  onRequestBrowserPermission: () => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onClearAll,
  onSendTestNotification,
  onRequestBrowserPermission,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#102d4f]">Push Notifications Hub</h2>
              <p className="text-xs text-slate-500">Real-time alerts, lecture warnings & sync notices</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action bar */}
        <div className="py-2.5 flex items-center justify-between gap-2 border-b border-slate-100 text-xs">
          <button
            onClick={onRequestBrowserPermission}
            className="text-[#1e6fa8] hover:text-[#102d4f] font-semibold flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Enable Native Web Push
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onMarkAllAsRead}
              className="text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1"
            >
              <Check className="w-3 h-3 text-emerald-600" /> Mark read
            </button>
            <button
              onClick={onClearAll}
              className="text-slate-400 hover:text-red-600 font-medium"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Notification list */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2.5 pr-1">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs font-medium">No pending notifications</p>
            </div>
          ) : (
            notifications.map((n) => {
              const bg = !n.read ? 'bg-[#eef6fb] border-sky-200' : 'bg-white border-slate-200';
              return (
                <div
                  key={n.id}
                  className={`p-3 rounded-xl border text-left transition-all ${bg}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-[#102d4f]">{n.title}</span>
                    <span className="text-[10px] text-slate-400 shrink-0">{n.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-white text-slate-500 border border-slate-200">
                      {n.type}
                    </span>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer with test dispatch trigger */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <button
            id="trigger-test-push-btn"
            onClick={onSendTestNotification}
            className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Send className="w-3.5 h-3.5 text-[#1e6fa8]" /> Send Simulated Push
          </button>
          <button
            onClick={onClose}
            className="py-2 px-4 rounded-xl bg-[#102d4f] hover:bg-[#1a406c] text-white text-xs font-bold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
