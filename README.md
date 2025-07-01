# 🏡 Student Nest Backend

Welcome to **Student Nest Backend**, the robust RESTful API powering the Student Nest platform for student housing, apartment bookings, and property management. Built with Node.js, Express, and MongoDB.

---

## 📚 Table of Contents

- [✨ Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [📁 Project Structure](#-project-structure)
- [🚀 Getting Started](#-getting-started)
- [📜 Available Scripts](#-available-scripts)
- [🗂️ Folder Overview](#️-folder-overview)
- [🔌 API Overview](#-api-overview)
- [🧩 Data Models](#-data-models)
- [🔒 Middleware](#-middleware)
- [🤝 Contributing](#-contributing)
- [📝 License](#-license)
- [🙌 Credits](#-credits)

---

## ✨ Features

- **User Authentication & Authorization** (JWT-based, roles: student, owner, admin)
- **Property Listings & Management**
- **Booking System** (students can book, owners can manage)
- **Payments & Invoicing** (including Lahza integration)
- **Reviews & Ratings**
- **Chat & Messaging** (between students and owners)
- **Notifications System**
- **Admin Dashboard** (analytics, user/property management)
- **Reporting System** (report users/properties)
- **RESTful API** with clear route structure

---

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (via Mongoose)
- **Authentication:** JWT
- **Environment:** dotenv
- **Other:** bcrypt, cors, body-parser, axios, nodemon (dev)

---

## 📁 Project Structure

```
/models         # Mongoose data models (User, Property, Booking, etc.)
/routes         # Express route handlers (API endpoints)
/middleware     # Auth and admin middleware
index.js        # Main server entry point
package.json    # Project metadata, scripts, dependencies
```

---

## 🚀 Getting Started

1. **Clone the repository:**
   ```bash
   git clone https://github.com/StudentNest-ps/Student-Nest-Backend.git
   cd Student-Nest-Backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   - Create a `.env` file in the root directory.
   - Add your MongoDB URI and JWT secret:
     ```
     MONGO_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret
     PORT=5000
     ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Server will run on [http://localhost:5000](http://localhost:5000)**

---

## 📜 Available Scripts

- `npm start` — Start the production server
- `npm run dev` — Start the development server with nodemon

---

## 🗂️ Folder Overview

### `/models`
- **User.model.js** — User schema (student, owner, admin roles, password hashing)
- **Property.model.js** — Property listings (type, price, address, amenities, owner)
- **booking.model.js** — Bookings (student, property, dates, status)
- **Payment.model.js** — Payments (booking, student, amount, status)
- **Report.model.js** — Reports (user/property, reason, message)
- **review.model.js** — Reviews (property, student, rating, comment)
- **Chat.model.js** — Chat sessions (participants, property)
- **Message.model.js** — Messages (chat, sender, receiver, property, content)
- **Notification.model.js** — Notifications (user, message, type, seen)

### `/routes`
- **admin.route.js** — Admin analytics, user/property management
- **availability.routes.js** — Property availability endpoints
- **booking.route.js** — Booking creation, management, and queries
- **chat.route.js** — Chat session management
- **general.route.js** — General endpoints (e.g., get current user)
- **lahzapayments.route.js** — Lahza payment integration
- **message.route.js** — Messaging between users
- **notification.route.js** — Notification creation and retrieval
- **owner.route.js** — Owner-specific property management
- **payment.route.js** — Payment processing, history, invoices
- **properties.route.js** — Property listing, details
- **report.route.js** — Reporting users/properties
- **review.route.js** — Property reviews
- **signin.route.js** / **signup.route.js** — Auth endpoints

### `/middleware`
- **auth.middleware.js** — JWT authentication, role-based authorization
- **admin.middleware.js** — Admin-only access control

---

## 🔌 API Overview

Here are some of the main API endpoints (see `/routes` for full details):

- `POST /api/signup` — Register a new user
- `POST /api/login` — User login (returns JWT)
- `GET /api/properties` — List all properties
- `POST /api/bookings` — Create a booking
- `GET /api/bookings/me` — Get bookings for current user
- `POST /api/payments` — Make a payment
- `GET /api/reviews/:propertyId` — Get reviews for a property
- `POST /api/reports` — Submit a report
- `GET /api/admin/analytics` — Admin analytics dashboard
- `GET /api/notifications` — Get user notifications
- `POST /api/messages` — Send a message
- ...and many more!

> **All protected routes require a valid JWT in the `Authorization` header.**

---

## 🧩 Data Models

- **User:** email, username, phone, password (hashed), role (student/owner/admin)
- **Property:** title, description, type, price, address, city, country, available dates, amenities, owner
- **Booking:** student, property, date range, total amount, status
- **Payment:** booking, student, amount, transaction type/id, status
- **Report:** reporter, reported user/property, reason, message
- **Review:** property, student, rating, comment
- **Chat:** participants, property
- **Message:** chat, sender, receiver, property, message
- **Notification:** user, message, type, seen

---

## 🔒 Middleware

- **auth.middleware.js**
  - `protect` — Verifies JWT, attaches user to request
  - `authorize(...roles)` — Restricts access to specified roles
- **admin.middleware.js**
  - `isAdmin` — Allows only admin users

---

## 🤝 Contributing

Contributions are welcome! 💡 Please open an issue or submit a pull request for any feature requests, bug fixes, or improvements.

---

## 📝 License

This project is licensed under the MIS License.

---

## 🙌 Credits

- Built with [Express.js](https://expressjs.com/), [MongoDB](https://www.mongodb.com/), and [Mongoose](https://mongoosejs.com/).
- Authentication powered by [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) and [bcrypt](https://github.com/kelektiv/node.bcrypt.js).
- Payment integration via [Lahza](https://docs.lahza.io/).

---

## 👥 Contributors

- <a href="https://github.com/OsamaSalah-7" target="_blank"></a> [**OsamaSalah-7**](https://github.com/OsamaSalah-7)
- <a href="https://github.com/mkittani" target="_blank"></a> [**mkittani**](https://github.com/mkittani)
- <a href="https://github.com/Hadi87s" target="_blank"></a> [**Hadi87s**](https://github.com/Hadi87s)


