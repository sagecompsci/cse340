const utilities = require(`../utilities/index`)
const accountModel = require('../models/account-model')
const bcrypt = require('bcryptjs')

const jwt = require("jsonwebtoken")
const invModel = require("../models/inventory-model");
require("dotenv").config()

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res){
    let nav = await utilities.getNav()
    res.render("account/login", {
        title: "Login",
        nav,
        errors: null,
    })
}

async function buildRegister(req, res){
    let nav = await utilities.getNav()
    res.render("account/register", {
        title: "Register",
        nav,
        errors: null,
    })
}

/* ****************************************
*  Deliver account management view
* *************************************** */
async function buildAccount(req, res){
    let nav = await utilities.getNav()

    let account_id = 1
    let account_type = "Basic"
    let account_firstname = "John"
    const decoded = jwt.verify(req.cookies.jwt, process.env.ACCESS_TOKEN_SECRET)
    console.log(decoded)

    res.render("account/account", {
        title: "Account Management",
        nav,
        errors: null,
        account_id: decoded.account_id,
        account_type: decoded.account_type,
        account_firstname: decoded.account_firstname,

    })
}
/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res){
    let nav = await utilities.getNav()
    const { account_firstname, account_lastname, account_email, account_password } = req.body

    // hash the password before storing
    let hashedPassword
    try {
        //regular password and cost (salt is generated automatically)
        hashedPassword = await bcrypt.hashSync(account_password, 10)
    } catch(error) {
        req.flash("notice", "Sorry, there was an error processing the registration")
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
        req.flash("notice", `Congratulations, you\'re registered ${account_firstname}. Please log in.`)
        res.status(201).render("account/login", {
            title: "Login",
            nav,
            errors: null,
        })
    } else {
        req.flash("notice", "Sorry, the registration failed.")
        res.status(501).render("/account/register", {
            title: "Register",
            nav,
            errors: null,
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
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 10000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 10000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 10000 })
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


async function buildAccountUpdate(req, res){
    const account_id = req.params.account_id
    let nav = await utilities.getNav()
    const decoded = jwt.verify(req.cookies.jwt, process.env.ACCESS_TOKEN_SECRET)
    res.render("account/update-account",{
        title: "Update Account",
        errors: null,
        nav,
        account_firstname: decoded.account_firstname,
        account_lastname: decoded.account_lastname,
        account_email: decoded.account_email,
        account_id: account_id

    })
}


async function updateAccount (req, res) {
    let nav = await utilities.getNav()
    const {account_firstname, account_lastname, account_email, account_id} = req.body
    const updateResult = await accountModel.updateAccount(account_firstname, account_lastname, account_email, account_id)

    if (updateResult) {
        req.flash("notice", `Your information was successfully updated.`)
        res.redirect("/account/")
    } else{
        req.flash("notice", "Sorry, the update failed.")
        res.status(501).render("./account/update-account", {
            title: "Update Account",
            nav,
            errors: null,
            account_firstname,
            account_lastname,
            account_email,
            account_id
        })
    }
}

async function updatePassword (req, res) {
    let nav = await utilities.getNav()
    const {account_password, account_id} = req.body
    let hashedPassword
    try {
        //regular password and cost (salt is generated automatically)
        hashedPassword = await bcrypt.hashSync(account_password, 10)
    } catch(error) {
        req.flash("notice", "Sorry, there was an error processing the registration")
        res.status(500).render("./account/update-account", {
            title: "Update Account",
            nav,
            errors: null,
            account_id,
        })
    }
    const updateResult = await accountModel.updatePassword(hashedPassword, account_id)

    if (updateResult) {
        req.flash("notice", `Your information was successfully updated.`)
        res.redirect("/account/")
    } else{
        req.flash("notice", "Sorry, the update failed.")
        res.status(501).render("./account/update-account", {
            title: "Update Account",
            nav,
            errors: null,
            account_id,
        })
    }
}

async function logout(req, res) {
    res.clearCookie('jwt')
    res.redirect("/")
}

module.exports = {buildLogin, buildRegister, registerAccount, accountLogin, buildAccount, buildAccountUpdate,
updateAccount, updatePassword, logout}

