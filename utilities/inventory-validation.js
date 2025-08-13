const { body, validationResult } = require("express-validator")
const utilities = require("./index")
const { title } = require("process")

const validate = {}

/** Classification Rules */
validate.classificationRules = () => [
    body("classification_name")
    .trim()
    .notEmpty().withMessage("Classification name is required.")
    .matches(/^[A-Za-z0-9]+$/).withMessage("No spaces or special characters are allowed."),
]

validate.checkClassificationData = async (req, resizeBy, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const nav = await utilities.getNav()
        return res.status(400).render("inventory/add-classification", {
            title: "Add Classification",
            nav,
            message: "Please fix the errors below.",
            errors: errors.array
        })
    }
    next()
}

/** Inventory Rules */
validate.inventoryRules = () => [
  body("inv_make").trim().notEmpty().withMessage("Make is required."),
  body("inv_model").trim().notEmpty().withMessage("Model is required."),
  body("inv_year").isInt({ min: 1900, max: 2100 }).withMessage("Year must be a valid 4-digit year."),
  body("inv_description").trim().notEmpty().withMessage("Description is required."),
  body("inv_image").trim().notEmpty().withMessage("Image path is required."),
  body("inv_thumbnail").trim().notEmpty().withMessage("Thumbnail path is required."),
  body("inv_price").isFloat({ min: 0 }).withMessage("Price must be a positive number."),
  body("inv_miles").isInt({ min: 0 }).withMessage("Miles must be a non-negative integer."),
  body("inv_color").trim().notEmpty().withMessage("Color is required."),
  body("classification_id").isInt({ min: 1 }).withMessage("Select a classification."),
]

validate.checkInventoryData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    const classificationList = await utilities.buildClassificationList(req.body.classification_id)
    return res.status(400).render("inventory/add-inventory", {
      title: "Add Vehicle",
      nav,
      message: "Please fix the errors below.",
      errors: errors.array(),
      classificationList,
      // sticky
      ...req.body
    })
  }
  next()
}

module.exports = validate