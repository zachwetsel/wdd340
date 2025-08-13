// Needed Resources
const express = require("express")
const router = express.Router()
const utilitites = require("../utilities")
const accountController = require("../controllers/accountController")
const regValidate = require("../utilities/account-validation")

router.get("/login", utilitites.handleErrors(accountController.buildLogin))
router.get("/register", utilitites.handleErrors(accountController.buildRegister))
// Process the registration data
router.post(
    "/register",
    regValidate.registrationRules(),
    regValidate.checkRegData,
    utilitites.handleErrors(accountController.registerAccount))

module.exports = router