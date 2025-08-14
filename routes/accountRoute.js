// Needed Resources
const express = require("express")
const router = express.Router()
const utilities = require("../utilities")
const accountController = require("../controllers/accountController")
const regValidate = require("../utilities/account-validation")
const favoritesController = require("../controllers/favoritesController")


router.get("/login", utilities.handleErrors(accountController.buildLogin))
router.get("/register", utilities.handleErrors(accountController.buildRegister))
// Process the registration data
router.post(
    "/register",
    regValidate.registrationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount))

// Process the login attempt
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.accountLogin)
)
router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildAccountManagement))

router.get("/update/:account_id", utilities.checkLogin, accountController.editAccount)
router.post("/update", regValidate.updateRules(), regValidate.checkLoginData, accountController.updateAccount)
router.post("/update-password", regValidate.passwordRules(), regValidate.checkPassword, accountController.updatePassword)

router.get("/logout", (req, res) => {
  res.clearCookie("jwt")
  res.redirect("/")
})

// Favorites Routes
router.post("/favorite", utilities.checkLogin, favoritesController.toggleFavorite)
router.get("/favorites", utilities.checkLogin, favoritesController.viewFavorites)

module.exports = router