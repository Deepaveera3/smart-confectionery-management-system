import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck, Package, CreditCard, AlertTriangle, UserPlus, Info, Sparkles } from 'lucide-react';
import { apiService } from '../services/api';

export default function NotificationCenter({ isAdmin = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Polling every 10s
    return () => clearInterval(interval);
  }, [isAdmin]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = isAdmin
        ? await apiService.getNotifications()
        : await apiService.getCustomerNotifications();
      if (res.success) {
        setNotifications(res.notifications || []);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkAsRead = async (id) => {
    try {
      if (isAdmin) {
        await apiService.markNotificationRead(id);
      }
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: 1 } : n));
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      if (isAdmin) {
        await apiService.markAllNotificationsRead();
      }
      setNotifications(notifications.map(n => ({ ...n, is_read: 1 })));
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'NEW_ORDER':
      case 'ORDER':
      case 'ORDER_STATUS':
        return <Package size={18} color="#be185d" />;
      case 'PAYMENT':
      case 'PAYMENT_SUCCESS':
        return <CreditCard size={18} color="#16a34a" />;
      case 'LOW_STOCK':
        return <AlertTriangle size={18} color="#d97706" />;
      case 'REGISTRATION':
        return <UserPlus size={18} color="#2563eb" />;
      case 'LOYALTY':
      case 'OFFER':
        return <Sparkles size={18} color="#9333ea" />;
      default:
        return <Info size={18} color="#64748b" />;
    }
  };

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'relative',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
        title="Notification Center"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-2px',
            right: '-2px',
            backgroundColor: '#ef4444',
            color: '#ffffff',
            fontSize: '11px',
            fontWeight: '800',
            borderRadius: '10px',
            minWidth: '18px',
            height: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 4px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '50px',
          right: '0',
          width: '360px',
          maxHeight: '480px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0',
          zIndex: 100,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Header */}
          <div style={{
            padding: '16px 20px',
            background: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>
                Notifications
              </h4>
              {unreadCount > 0 && (
                <span style={{
                  fontSize: '11px',
                  backgroundColor: '#fce7f3',
                  color: '#be185d',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontWeight: '700'
                }}>
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                style={{
                  border: 'none',
                  background: 'none',
                  color: '#be185d',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <CheckCheck size={14} />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: '#94a3b8' }}>
                <Bell size={32} style={{ margin: '0 auto 10px auto', opacity: 0.4 }} />
                <p style={{ margin: 0, fontSize: '14px' }}>No notifications yet.</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleMarkAsRead(notif.id)}
                  style={{
                    padding: '14px 18px',
                    borderBottom: '1px solid #f1f5f9',
                    backgroundColor: notif.is_read ? '#ffffff' : '#fdf2f8',
                    display: 'flex',
                    gap: '12px',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease'
                  }}
                >
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    flexShrink: 0
                  }}>
                    {getIcon(notif.type)}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h5 style={{ margin: '0 0 2px 0', fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>
                        {notif.title}
                      </h5>
                      {!notif.is_read && (
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#be185d', flexShrink: 0 }} />
                      )}
                    </div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#475569', lineHeight: '1.4' }}>
                      {notif.message}
                    </p>
                    <span style={{ fontSize: '10px', color: '#94a3b8' }}>
                      {new Date(notif.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
