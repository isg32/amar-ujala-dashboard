# AmarUjala Newspaper Dashboard

A comprehensive web application for managing newspaper subscriptions, tracking deliveries, and processing payments for AmarUjala newspaper.

![AmarUjala Dashboard](https://india.mom-gmr.org/uploads/tx_lfrogmom/media/16512-1592_import.png)

## Features

- **User Authentication**
  - Phone number-based authentication with OTP verification
  - Role-based access control (admin/user)

- **Dashboard**
  - Subscription status overview
  - Recent newspaper delivery tracking
  - Payment history
  - Days remaining in current subscription

- **Subscription Management**
  - Multiple subscription plans (Monthly, Quarterly, Yearly)
  - Plan selection and payment processing
  - Subscription renewal

- **Payment Processing**
  - RazorPay payment gateway integration
  - Payment history tracking
  - SMS notification on successful payment

- **Admin Panel**
  - User management
  - Subscription management
  - Delivery tracking and management
  - Search functionality

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Firebase (Authentication, Firestore)
- **State Management**: React Context API
- **Routing**: React Router v6
- **Payment Gateway**: RazorPay
- **Build Tool**: Vite
- **Icons**: Lucide React

## Prerequisites

Before you begin, ensure you have the following:

- Node.js (v16 or higher)
- npm or yarn
- Firebase account
- RazorPay account

## Getting Started

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/isg32/amar-ujala-dashboard.git
   cd amar-ujala-dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with your Firebase and RazorPay credentials:
   ```
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

## Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)

2. Enable Authentication:
   - Go to Authentication > Sign-in method
   - Enable Phone authentication
   - Add your test phone numbers if using in development

3. Create Firestore Database:
   - Go to Firestore Database > Create database
   - Start in production mode
   - Choose a location closest to your users

4. Set up Firestore Security Rules:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Allow authenticated users to read their own data
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
       
       match /subscriptions/{subscriptionId} {
         allow read: if request.auth != null && resource.data.userId == request.auth.uid;
         allow write: if request.auth != null && request.resource.data.userId == request.auth.uid;
       }
       
       match /payments/{paymentId} {
         allow read: if request.auth != null && resource.data.userId == request.auth.uid;
         allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
       }
       
       match /deliveries/{deliveryId} {
         allow read: if request.auth != null && resource.data.userId == request.auth.uid;
       }
       
       // Admin access
       match /{document=**} {
         allow read, write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
       }
     }
   }
   ```

5. Get your Firebase configuration from Project Settings > General > Your apps > Firebase SDK snippet > Config

## RazorPay Setup

1. Create a RazorPay account at [RazorPay](https://razorpay.com/)

2. Get your API keys from Dashboard > Settings > API Keys

3. For testing, use the Test mode keys

## Deployment

### Firebase Hosting

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase in your project:
   ```bash
   firebase init
   ```
   - Select Hosting
   - Select your Firebase project
   - Specify `dist` as your public directory
   - Configure as a single-page app: Yes
   - Set up automatic builds and deploys with GitHub: Optional

4. Build your project:
   ```bash
   npm run build
   ```

5. Deploy to Firebase:
   ```bash
   firebase deploy
   ```

### Netlify

1. Create a `netlify.toml` file in the root directory:
   ```toml
   [build]
     command = "npm run build"
     publish = "dist"
     
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

2. Deploy using Netlify CLI:
   ```bash
   npm install -g netlify-cli
   netlify login
   netlify deploy --prod
   ```

   Or connect your GitHub repository to Netlify for automatic deployments.

### Vercel

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy to Vercel:
   ```bash
   vercel
   ```

   Or connect your GitHub repository to Vercel for automatic deployments.

## Project Structure

```
amarujala-newspaper-dashboard/
├── public/               # Static assets
├── src/
│   ├── components/       # Reusable UI components
│   ├── context/          # React Context providers
│   ├── firebase/         # Firebase configuration
│   ├── pages/            # Application pages
│   ├── services/         # Service integrations (RazorPay, etc.)
│   ├── App.tsx           # Main application component
│   ├── index.css         # Global styles
│   └── main.tsx          # Application entry point
├── .env.example          # Example environment variables
├── index.html            # HTML template
├── package.json          # Project dependencies
├── tailwind.config.js    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
└── vite.config.ts        # Vite configuration
```

## Database Schema

### Users Collection
```
users/{userId}
  - phoneNumber: string
  - role: 'user' | 'admin'
  - createdAt: timestamp
```

### Subscriptions Collection
```
subscriptions/{subscriptionId}
  - userId: string
  - userPhone: string
  - plan: string
  - startDate: timestamp
  - endDate: timestamp
  - status: 'active' | 'expired'
  - lastPaymentDate: timestamp (optional)
  - lastPaymentAmount: number (optional)
```

### Payments Collection
```
payments/{paymentId}
  - userId: string
  - userPhone: string
  - amount: number
  - currency: string
  - paymentId: string
  - date: timestamp
  - method: string
  - status: string
  - description: string
  - subscriptionId: string (optional)
```

### Deliveries Collection
```
deliveries/{deliveryId}
  - userId: string
  - userPhone: string
  - date: timestamp
  - status: 'delivered' | 'missed'
```

## SMS Notifications

For SMS notifications, you can use:

1. **RazorPay's built-in SMS notifications** for payment confirmations
2. **Firebase Cloud Functions** with a third-party SMS provider like Twilio for delivery notifications

Example Cloud Function for SMS notifications:

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const twilio = require('twilio');

admin.initializeApp();

const twilioClient = twilio(
  functions.config().twilio.account_sid,
  functions.config().twilio.auth_token
);

exports.sendDeliveryNotification = functions.firestore
  .document('deliveries/{deliveryId}')
  .onCreate(async (snap, context) => {
    const delivery = snap.data();
    const userPhone = delivery.userPhone;
    const status = delivery.status;
    
    const message = status === 'delivered'
      ? 'Your newspaper has been delivered today. Thank you for subscribing to AmarUjala!'
      : 'We missed your delivery today. We apologize for the inconvenience.';
    
    try {
      await twilioClient.messages.create({
        body: message,
        to: userPhone,
        from: functions.config().twilio.phone_number
      });
      
      return console.log(`SMS sent to ${userPhone}`);
    } catch (error) {
      return console.error('Error sending SMS:', error);
    }
  });
```

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature/my-new-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@amarujala.com or open an issue in the GitHub repository.
