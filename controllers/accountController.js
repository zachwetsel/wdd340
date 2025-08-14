const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const { register } = require("module")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  const message =
    res.locals.message ||
    (req.flash ? req.flash("notice") : null) ||
    null

  res.render("account/login", {
    title: "Login",
    nav,
    message,
  })
}
/* ********************************************
*  Deliver Registration View
*  ******************************************** */
async function buildRegister(req, res, next) {
    const nav = await utilities.getNav()
    const message = 
      res.locals.message ||
      null
    res.render("account/register", {
        title: "Register",
        nav, message,
        errors: null,
    }) 
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

// Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
    })
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return res.redirect("/account/")
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    }
    else {
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

/* ****************************************
 *  Deliver Account Management view
 * ************************************ */
async function buildAccountManagement(req, res, next) {
  const nav = await utilities.getNav()
  const message =
    (req.flash && req.flash("notice"))?.[0] ||
    res.locals.message ||
    null

  res.render("account/management", {
    title: "Account Management",
    nav,
    message,
    errors: null,
  })
}

/** GET: Edit Account */
async function editAccount(req, res) {
  const account_id = parseInt(req.params.account_id)
  const nav = await utilities.getNav()
  const accountData = await accountModel.getAccountById(account_id)

  res.render("account/update", {
    title: "Update Account",
    nav,
    ...accountData,
    errors: [],
    message: req.flash("notice")?.[0] || null,
  })
}

/** POST: Update Account Info */
async function updateAccount(req, res) {
  const { account_id, account_firstname, account_lastname, account_email } = req.body
  const updateResult = await accountModel.updateAccountInfo(account_id, account_firstname, account_lastname, account_email)

  if (updateResult) {
    req.flash("notice", "Account updated.")
    const accountData = await accountModel.getAccountById(account_id)
    const nav = await utilities.getNav()
    res.render("account/management", {
      title: "Account Management",
      nav,
      accountData,
      message: req.flash("notice")?.[0] || null,
    })
  } else {
    req.flash("notice", "Update failed.")
    res.redirect(`/account/update/${account_id}`)
  }
}

/** POST: Update Password */
async function updatePassword(req, res) {
  const { account_id, account_password } = req.body
  const hashedPassword = await bcrypt.hash(account_password, 10)
  const result = await accountModel.updatePassword(account_id, hashedPassword)

  if (result) {
    req.flash("notice", "Password updated.")
    const accountData = await accountModel.getAccountById(account_id)
    const nav = await utilities.getNav()
    res.render("account/management", { title: "Account Management", nav, accountData })
  } else {
    req.flash("notice", "Password update failed.")
    res.redirect(`/account/update/${account_id}`)
  }
}

module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, buildAccountManagement, editAccount, updateAccount, updatePassword }
