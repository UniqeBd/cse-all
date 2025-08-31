# CSE Study Material & Messaging Website

A responsive web application for Computer Science Engineering students to access study materials and communicate with administrators through a real-time messaging system.

## Features

### 🔐 Authentication & Database
- Firebase Authentication for secure user/admin login
- Firebase Realtime Database for chat messaging
- User role management (Admin/Student)

### 📚 Study Materials Management
- **Admin Panel**: CRUD operations for study materials
- **GitHub Storage**: Materials stored in GitHub repository assets folder
- **Subject Organization**: Materials categorized by subjects
- **Expandable Interface**: Subject details expand on the same page
- **Multiple Formats**: Support for PDFs, images, and notes

### 💬 Real-time Messaging System
- **Instagram-style Chat**: Disappearing messages functionality
- **User Rules**:
  - No old messages visible when opening chat
  - Only new messages appear after chat is opened
  - All messages deleted when chat is closed
  - Fresh session every time chat is reopened
- **Admin Rules**:
  - Can see all messages (including user-deleted ones)
  - Can unsend messages in inactive chats
  - Messages remain hidden until user becomes active again
- **Message Status**: Single gray tick (sent) / Double green tick (seen)
- **Fixed Position**: Chatbox always on right side, cannot be closed by clicking outside

### 🎨 UI/UX Features
- **Responsive Design**: Works seamlessly on PC, tablet, and mobile
- **Fixed Chat Position**: Chat remains on right side while materials expand on left
- **Modern Interface**: Clean, professional design with smooth animations
- **Cross-device Compatibility**: Admin on mobile can chat with user on PC

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Firebase (Authentication + Realtime Database)
- **Storage**: GitHub Repository Assets
- **Deployment**: Vercel
- **Responsive Framework**: Custom CSS Grid & Flexbox

## Getting Started

### Prerequisites
- Modern web browser
- Internet connection
- Firebase account (configuration provided)

### Installation

1. **Clone/Download the repository**
   ```bash
   git clone <your-repo-url>
   cd study-chat
   ```

2. **Firebase Configuration**
   The Firebase configuration is already set up in `js/firebase-config.js`:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSyB27Qb1udzGe2nwLu8-55ExFMeJR-TeW48",
     authDomain: "study-dd515.firebaseapp.com",
     databaseURL: "https://study-dd515-default-rtdb.firebaseio.com",
     projectId: "study-dd515",
     storageBucket: "study-dd515.firebasestorage.app",
     messagingSenderId: "288649711011",
     appId: "1:288649711011:web:7213ad3fc5b6abdbed1e16"
   };
   ```

3. **Local Development**
   - Open `index.html` in a web browser
   - Or use a local server:
     ```bash
     # Using Python
     python -m http.server 8000
     
     # Using Node.js
     npx serve .
     ```

4. **Deployment to Vercel**
   - Push code to GitHub repository
   - Connect repository to Vercel
   - Deploy automatically

## Project Structure

```
study-chat/
├── index.html              # Main HTML file
├── css/
│   └── styles.css          # All CSS styles
├── js/
│   ├── firebase-config.js  # Firebase configuration
│   ├── auth.js            # Authentication management
│   ├── chat.js            # Chat system logic
│   ├── admin.js           # Admin panel functionality
│   └── main.js            # Main application logic
├── assets/                 # Static assets (images, etc.)
└── README.md              # Project documentation
```

## Usage

### For Students

1. **Sign Up/Login**
   - Create account with email and password
   - Login to access study materials and chat

2. **Browse Study Materials**
   - View subjects on the homepage
   - Click "Learn More" to see materials for each subject
   - Access PDFs, images, and notes via GitHub links

3. **Chat with Admin**
   - Click chat button (appears after login)
   - Send messages to administrators
   - Chat history clears when you close the chat

### For Administrators

1. **Admin Setup**
   - Login with admin account
   - Access admin panel from navigation

2. **Manage Study Materials**
   - Add new subjects
   - Upload materials with GitHub URLs
   - Edit or delete existing materials

3. **Chat Management**
   - View all active chats
   - See complete message history
   - Manage inactive user conversations

## Firebase Database Structure

```json
{
  "users": {
    "userId": {
      "email": "user@example.com",
      "isAdmin": false,
      "createdAt": "timestamp"
    }
  },
  "subjects": {
    "subjectId": {
      "name": "Subject Name",
      "description": "Subject Description",
      "createdAt": "timestamp",
      "createdBy": "adminUserId"
    }
  },
  "materials": {
    "materialId": {
      "title": "Material Title",
      "url": "https://github.com/repo/material.pdf",
      "type": "pdf|image|note",
      "subjectId": "subjectId",
      "createdAt": "timestamp"
    }
  },
  "chats": {
    "chat_userId": {
      "messages": {
        "messageId": {
          "text": "Message content",
          "senderId": "userId",
          "type": "user|admin",
          "timestamp": "timestamp",
          "status": "sent|seen"
        }
      },
      "userActive": {
        "status": "online|offline",
        "timestamp": "timestamp"
      },
      "lastMessage": {
        "text": "Last message",
        "timestamp": "timestamp",
        "senderId": "userId"
      }
    }
  }
}
```

## Key Features Implementation

### Disappearing Chat System
- Messages only visible during active chat sessions
- User chat history clears on close
- Admin retains full message history
- Fresh session guarantee for users

### Responsive Design
- Mobile-first approach
- Flexible grid system
- Touch-friendly interface
- Cross-device compatibility

### Real-time Updates
- Firebase Realtime Database listeners
- Instant message delivery
- Live chat status updates
- Real-time material additions

## Security Features

- Firebase Authentication rules
- Email/password validation
- Admin role verification
- Secure database rules
- Input sanitization

## Browser Support

- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team

## Deployment Status

🚀 **Live Demo**: [Your Vercel URL will go here]

The application is deployed and accessible globally through Vercel's CDN network.

## Future Enhancements

- File upload functionality
- Video material support
- Offline chat storage
- Push notifications
- Advanced search features
- Material categorization
- User progress tracking
