importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDAtvEniZzsTtvgCRMuhYh6mi59mAk6Aqc",
  authDomain: "project-unkriswina.firebaseapp.com",
  projectId: "project-unkriswina",
  messagingSenderId: "285848458757",
  appId: "1:285848458757:web:1c579bf385db90893cae6c"
});

const messaging = firebase.messaging();

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});
