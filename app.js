require("dotenv").config({ path: "./.env" })
const express = require('express')
const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const app = express();
const jwt = require('jsonwebtoken')
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt;
const authRoute = require("./router/auth")
const passportCustom = require("passport-custom")
const CustomStrategy = passportCustom.Strategy;

const { CheckUser, FindOrCreate } = require("./model/user")

app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/Public'));
app.set("veiw-engine", "ejs");
app.use(passport.initialize());

// Passport JWT Strategy

// const opts = {}
// opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
// opts.secretOrKey = process.env.jwt_secret;
// passport.use(new JwtStrategy(opts, function (jwt_payload, done) {
//     console.log("JWT BASED  VALIDATION GETTING CALLED")
//     if (CheckUser(jwt_payload.data)) {
//         return done(null, jwt_payload.data)
//     } else {
//         // user account doesnt exists in the DATA
//         return done(null, false);
//     }
// }));


//Passport Custom JWT Strategy
passport.use("jwt", new CustomStrategy(
    function (req, done) {
        const authHeader = req.get('Authorization')
        if (!authHeader)
            return done(null, false)
        const token = authHeader.split(' ')[1];
        let decodedToken;
        try {
            decodedToken = jwt.verify(token, process.env.jwt_secret);
        } catch (err) {
            return done(null, false)
        }
        if (!decodedToken) return done(null, false)
        return done(null, decodedToken)
    }
))

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/googleRedirect"
},
    function (accessToken, refreshToken, profile, cb) {
        // console.log(accessToken, refreshToken, profile)
        return cb(null, profile)
    }
));

passport.serializeUser(function (user, cb) {
    cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
    cb(null, obj);
});

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }))

app.get('/googleRedirect', passport.authenticate('google'), (req, res) => {
    let user = {
        name: req.user.name.givenName,
        email: req.user._json.email,
    }
    FindOrCreate(user)
    let token = jwt.sign({
        data: user
    }, process.env.jwt_secret, { expiresIn: '1h' });
    res.render("home.ejs", {
        token: token
    });
})

app.use("/user", passport.authenticate('jwt', { session: false }), authRoute);

app.get('/', (req, res) => {
    res.render("login.ejs");
});

const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`Sever started on port ${port}`)
})