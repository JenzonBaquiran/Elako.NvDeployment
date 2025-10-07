import React from 'react';

const MessageDebugInfo = ({ storeId, currentUser, conversation, isVisible = false }) => {
  if (!isVisible || process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      fontFamily: 'monospace',
      maxWidth: '300px',
      zIndex: 9999
    }}>
      <div><strong>🔍 Messaging Debug Info</strong></div>
      <div>Store ID: {storeId || 'Not set'}</div>
      <div>Customer ID: {currentUser?.id || 'Not logged in'}</div>
      <div>Conversation ID: {conversation?._id || 'No conversation'}</div>
      <div>Store Name: {conversation?.otherParticipant?.businessName || 'Unknown'}</div>
      <div>Status: {conversation ? '✅ Connected' : '⏳ Loading...'}</div>
    </div>
  );
};

export default MessageDebugInfo;