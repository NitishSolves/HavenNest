if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const ExpressError = require("./utils/ExpressError.js");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const pagesRouter = require("./routes/pages.js");

const dbUrl = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/havennest";

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

main()
  .then(() => console.log("HavenNest connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

async function main() {
  await mongoose.connect(dbUrl);
}

const sessionOptions = {
  secret: process.env.SECRET || "havennest-dev-secret-change-me",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

app.get("/", (req, res) => res.redirect("/listings"));

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);
app.use("/", pagesRouter);

app.use((req, res, next) => {
  next(new ExpressError(404, "Page not found."));
});

app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong on our end." } = err;
  res.status(statusCode).render("error.ejs", { message, statusCode });
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`HavenNest is listening on port ${port}`);
});
