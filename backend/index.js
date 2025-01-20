const cookieSession = require("cookie-session");
const express = require("express");
const cors = require("cors");
const passportSetup = require("./passport");
const passport = require("passport");
const authRoute = require("./routes/auth");
const app = express();
const connectDB = require('./config/db')
const router = require('./routes/auth')

app.use(
  cookieSession({ name: "session", keys: ["lama"], maxAge: 24 * 60 * 60 * 100 })
);
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);

app.use("/auth", authRoute);

app.listen("5000", () => {
  console.log("Server is running!");
});


app.use("/api",router)
const PORT = 8080 || process.env.PORT


connectDB().then (()=>{
    app.listen(PORT,()=>{
        console.log("Connect to DB");
        console.log("Server is running !!!!!!!");
    })
})
