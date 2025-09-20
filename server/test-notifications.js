// Test script to check notifications functionality
const fetch = require('node-fetch');

async function testNotifications() {
  try {
    // Test following a store (example IDs - replace with actual ones from your database)
    const followData = {
      customerId: "67726c46c93bcd19c1234567", // Replace with actual customer ID
      action: "follow"
    };

    console.log('Testing follow notification...');
    const followResponse = await fetch('http://localhost:1337/api/stores/67726c46c93bcd19c1234568/follow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(followData)
    });

    const followResult = await followResponse.json();
    console.log('Follow result:', followResult);

    // Test fetching notifications for the store
    console.log('Fetching notifications for store...');
    const notifResponse = await fetch('http://localhost:1337/api/notifications/67726c46c93bcd19c1234568');
    const notifResult = await notifResponse.json();
    console.log('Notifications result:', notifResult);

  } catch (error) {
    console.error('Test error:', error);
  }
}

testNotifications();