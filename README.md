# HavenNest 🏘️

A modern, full-stack web application for discovering and booking curated home stays worldwide. Find premium cottages, mountain chalets, city lofts, and unique properties — built with clean design and seamless user experience.

**Live Demo:** [Coming Soon]  
**GitHub:** [Your Repo Link]

---

## Features

✨ **Core Functionality**
- 🏠 **Browse Listings** — Explore 100+ curated stays with category filtering and full-text search
- 📍 **Interactive Maps** — View property locations with integrated Leaflet maps and OpenStreetMap data
- ❤️ **Wishlist** — Save favorite stays to a personalized wishlist (logged-in users only)
- ⭐ **Reviews & Ratings** — Leave detailed reviews with 1–5 star ratings; read community feedback
- 📸 **Image Upload** — Cloudinary-powered image hosting for crisp, responsive property photos
- 👤 **User Authentication** — Secure signup/login with Passport.js; role-based access (guest/host)
- 🌙 **Dark Mode** — Seamless light/dark theme toggle with localStorage persistence
- 📱 **Fully Responsive** — Optimized for mobile, tablet, and desktop viewing

---

## Tech Stack

**Backend**
- [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/) — Server framework
- [MongoDB](https://www.mongodb.com/) & [Mongoose](https://mongoosejs.com/) — NoSQL database + ODM
- [Passport.js](http://www.passportjs.org/) — Authentication strategy (Local + Session)

**Frontend**
- [EJS](https://ejs.co/) — Server-side templating
- [Bootstrap 5](https://getbootstrap.com/) — Responsive CSS framework
- [Leaflet](https://leafletjs.com/) — Interactive mapping library
- [Font Awesome 7](https://fontawesome.com/) — Icon library

**Services**
- [Cloudinary](https://cloudinary.com/) — Image storage & CDN
- [OpenStreetMap Nominatim](https://nominatim.org/) — Geocoding API
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) — Cloud database (recommended)

**Validation & Security**
- [Joi](https://joi.dev/) — Schema validation for form data
- [Dotenv](https://www.npmjs.com/package/dotenv) — Environment variable management
- [Express-Session](https://www.npmjs.com/package/express-session) — Session middleware
- [Connect-Flash](https://www.npmjs.com/package/connect-flash) — Flash message handling

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account)
- Cloudinary account for image hosting
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/havennest.git
   cd havennest
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Then update `.env` with your credentials:
   ```env
   ATLASDB_URL=mongodb+srv://<user>:<password>@<cluster>/havennest
   CLOUD_NAME=your_cloudinary_name
   CLOUD_API_KEY=your_cloudinary_api_key
   CLOUD_API_SECRET=your_cloudinary_api_secret
   SECRET=your_session_secret_key
   SEED_OWNER_ID=<existing_user_id>
   NODE_ENV=development
   PORT=8080
   ```

4. **Seed sample data (optional)**
   ```bash
   npm run seed
   ```
   *(Requires an existing user; sign up first, then copy their `_id` to `SEED_OWNER_ID`)*

5. **Start the development server**
   ```bash
   npm run dev
   ```
   Server runs at `http://localhost:8080`

---

## Project Structure

```
havennest/
├── routes/              # Express route handlers
│   ├── listing.js       # Listing CRUD operations
│   ├── review.js        # Review create/delete
│   ├── user.js          # Auth routes (signup/login/logout)
│   └── pages.js         # Static pages (privacy/terms)
├── controllers/         # Business logic
│   ├── listings.js      # Listing controller
│   ├── reviews.js       # Review controller
│   └── users.js         # User controller
├── models/              # Mongoose schemas
│   ├── listing.js       # Listing model + categories
│   ├── review.js        # Review model
│   └── user.js          # User model + Passport integration
├── views/               # EJS templates
│   ├── layouts/         # Layout wrapper
│   ├── listings/        # Listing pages (index/show/new/edit)
│   ├── users/           # Auth pages (signup/login/wishlist)
│   ├── pages/           # Static pages (privacy/terms)
│   └── includes/        # Reusable partials (navbar/footer/cards)
├── public/              # Static assets
│   ├── css/style.css    # Custom design tokens + responsive styles
│   ├── js/script.js     # Client-side interactions
│   └── css/rating.css   # Star rating widget styles
├── utils/               # Helper functions
│   ├── wrapAsync.js     # Express async error wrapper
│   ├── ExpressError.js  # Custom error class
│   ├── geocode.js       # Nominatim geocoding client
│   └── cloudinaryUpload.js  # Cloudinary stream upload
├── middleware.js        # Auth & validation middleware
├── schema.js            # Joi validation schemas
├── cloudConfig.js       # Cloudinary SDK setup
├── app.js               # Express app entry point
├── init/                # Database seed script
│   ├── index.js         # Seed runner
│   └── data.js          # Sample listing data
└── package.json         # Dependencies
```

---

## Usage

### Browse Listings
- Visit the homepage to see all available stays
- Filter by category (Beachfront, Mountains, Castles, etc.)
- Search by city, keyword, or property name

### Save to Wishlist
- Click the ❤️ heart icon on any listing card (logged-in users only)
- Manage your wishlist from your profile page

### Leave a Review
- View any listing detail page
- Scroll to "Leave a Review" section
- Rate 1–5 stars and write your experience
- Only listing owners can delete their own reviews

### List Your Property (Host)
- Click "Create a HavenNest" in the navbar
- Fill in title, description, photos, price, and location
- Automatically geocoded and placed on the map
- Edit or delete your listings anytime from the listing detail page

### Dark Mode
- Toggle via the moon 🌙 icon in the navbar
- Your preference is saved locally

---

## Key Features Deep Dive

### 🗺️ Automatic Geocoding
Properties are automatically geocoded using OpenStreetMap's Nominatim API — no manual coordinate entry required. Just type a city or address, and it appears on the map.

### 📸 Fast Image Uploads
Images are uploaded directly to Cloudinary via stream, avoiding temporary disk storage. Supports PNG and JPEG; max 5MB per image.

### ⭐ Review System
Reviews are attached to listings with author, rating (1–5), comment, and timestamp. Only the review author can delete their own review.

### 🔒 Security
- Passwords hashed with Passport's built-in bcrypt handling
- Session-based authentication
- Role-based access control (owner vs. guest)
- Form validation on both client and server (Joi)
- CSRF protection via session middleware

### 🎨 Design System
Custom CSS tokens for a cohesive, premium feel:
- **Colors:** Teal (#1f6f5c), Amber (#e8a33d), neutral grays
- **Typography:** Fraunces serif (display), Plus Jakarta Sans (body)
- **Spacing:** Consistent rhythm with CSS variables
- **Dark Mode:** Full support with CSS variable overrides

---

## Scripts

```bash
npm start          # Start production server
npm run dev        # Start dev server with Nodemon
npm run seed       # Seed database with sample listings
```

---

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `ATLASDB_URL` | MongoDB connection string | `mongodb+srv://...` |
| `CLOUD_NAME` | Cloudinary account name | `myaccount` |
| `CLOUD_API_KEY` | Cloudinary API key | `abc123...` |
| `CLOUD_API_SECRET` | Cloudinary API secret | `xyz789...` |
| `SECRET` | Session signing key | `my-secret-key` |
| `SEED_OWNER_ID` | Existing user ObjectId for seeding | `507f1f77bcf86cd799439011` |
| `NODE_ENV` | Environment mode | `development` or `production` |
| `PORT` | Server port | `8080` |

---

## Deployment

### Recommended: Heroku + MongoDB Atlas

1. Create a MongoDB Atlas cluster and note the connection URI
2. Create a Cloudinary account and save API credentials
3. Deploy to Heroku:
   ```bash
   heroku create your-app-name
   heroku config:set ATLASDB_URL="your-mongodb-uri"
   heroku config:set CLOUD_NAME="your-cloudinary-name"
   heroku config:set CLOUD_API_KEY="your-api-key"
   heroku config:set CLOUD_API_SECRET="your-api-secret"
   heroku config:set SECRET="your-random-secret"
   git push heroku main
   ```

---

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit changes (`git commit -m "Add your feature"`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

Please ensure:
- Code follows existing style conventions
- No console.log() statements in production code
- All routes are protected with appropriate middleware
- Forms are validated on both client and server

---

## Known Limitations

- Booking/payment system is not yet implemented (placeholder actions only)
- Email notifications for new reviews are not enabled
- Admin dashboard for moderation is not built
- Rate limiting on API endpoints not enforced

These are planned for future releases.

---

## License

This project is open source and available under the [ISC License](LICENSE).

---

## Acknowledgments

- Design inspiration from Airbnb and similar travel platforms
- Built with [Bootstrap](https://getbootstrap.com/), [Leaflet](https://leafletjs.com/), and [Font Awesome](https://fontawesome.com/)
- Geocoding by [OpenStreetMap Nominatim](https://nominatim.org/)
- Imagery via [Unsplash](https://unsplash.com/) and [Cloudinary](https://cloudinary.com/)

---

## Contact & Support

Have questions or found a bug? Please open an [Issue](https://github.com/yourusername/havennest/issues) on GitHub.

---

**Built with ❤️ by [Your Name]**
