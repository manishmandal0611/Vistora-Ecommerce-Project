# VISTORA — Full-Stack MERN E-Commerce Storefront

> **Shop Smarter. Live Better.**

**VISTORA** is a modern, full-stack e-commerce web application built using the **MERN stack** (MongoDB, Express.js, React, Node.js) and **Tailwind CSS**. It supports product discovery, category filtering, persistent shopping cart, checkout & order tracking, and role-based admin store management.

---

## Key Features

- **Storefront & Catalog:** Search products, filter by category, sort by price/latest, and view detailed product pages.
- **Authentication & Authorization:** Secure JWT-based login and registration with role-based access (`Customer` vs `Admin`).
- **Cart & Checkout Flow:** Add/remove items, update quantities, place orders, and view order history under **My Orders**.
- **Admin Dashboard:** Add, edit, and manage store products, stock, and catalog data (including image uploads).
- **Responsive UI & Brand Pages:** Custom branding, persistent footer with contact details, and dedicated **About**, **Contact**, **Terms & Conditions**, and **Privacy Policy** pages.

---

## Tech Stack

- **Frontend:** React (Vite), React Router, Context API (`AuthContext`, `CartContext`), Tailwind CSS, Axios
- **Backend:** Node.js, Express.js, JWT (`jsonwebtoken`), `bcryptjs`, Multer
- **Database:** MongoDB, Mongoose

---

## Project Structure

```text
vistora-ecommerce/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── seeder.js
│   ├── uploads/
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── vistora-logo.png
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
└── README.md
```

### Local Setup & Installation

# 1. Clone the Repository

https://github.com/manishmandal0611/Vistora-Ecommerce-Project.git

# 2. Backend Setup

cd backend
npm install

### Create a .env file inside backend/ and add your environment variables:

# PORT=5000

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key

### npm run seed

### Start the backend server:

npm run dev

# 3. Frontend Setup

Open a new terminal and run:
cd frontend
npm install
npm run dev

Open http://localhost:5173 in your browser.

### ## Demo Account (Seeded)

| Role         | Email                  | Password       |
| :----------- | :--------------------- | :------------- |
| **Customer** | `customer@vistora.dev` | `Password123!` |

> _Note: Admin dashboard access is restricted for catalog integrity and can be demonstrated live upon request._

### Contact

Developer: Manish Mandal

Email: manishmandal0611@gmail.com

Location: Ghaziabad, Uttar Pradesh, India
