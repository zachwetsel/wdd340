const { title } = require("process")
const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")
const { error } = require("console")
const { clearScreenDown } = require("readline")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

invCont.buildByInventoryId = async function (req, res, next) {
  try {
    const inv_id = req.params.inv_id
    const data = await invModel.getVehicleById(inv_id)
    data.inv_price = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(data.inv_price)
    data.inv_miles = Intl.NumberFormat("en-US").format(data.inv_miles)
    const detailHtml = await utilities.buildVehicleDetail(data)
    const nav = await utilities.getNav()
    const title = `${data.inv_year} ${data.inv_make} ${data.inv_model}`

    res.render("./inventory/detail", {
      title,
      nav,
      detailHtml,
    })
  } catch (err) {
    next(err)
  }
}

/** Management Dashboard */
async function buildManagement(req, res, next) {
  const nav = await utilities.getNav()
  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    message: res.locals.message || null
  })
}

/** Show add-classification form */
async function buildAddClassification(req, res, next) {
  const nav = await utilities.getNav()
  res.render("inventory/add-classification", {
    title: "Add Classification",
    nav,
    message: null,
    errors: []
  })
}

/** Insert Classification */
async function createClassification(req, res, next) {
  const { classification_name } = req.body 
  const result = await invModel.insertClassification(classification_name)
  const nav = await utilities.getNav()

  if (result) {
    // rebuilds nav so the new class appears
    const freshNav = await utilities.getNav()
    res.render("inventory/management", {
      title: "Inventory Management",
      nav: freshNav,
      message: `Success! "${classification_name}" was added.`
    })
  } else {
    res.status(400).render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      message: "Sorry, the classification couldn't be added.",
      errors: []
    })
  }
}

/** Show add-inventory form */
async function buildAddInventory(req, res, next) {
  const nav = await utilities.getNav()
  const classificationList = await utilities.buildClassificationList()
  res.render("inventory/add-inventory", {
    title: "Add Vehicle",
    nav,
    classificationList,
    message: null,
    errors: [],
    inv_make: "",
    inv_model: "",
    inv_year: "",
    inv_description: "",
    inv_image: "/images/vehicles/no-image.png",
    inv_thumbnail: "/images/vehicles/no-image.png",
    inv_price: "",
    inv_miles: "",
    inv_color: "",
    classification_id: ""
  })
}

async function createInventory(req, res, next) {
  const {
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
  } = req.body
  const insertOk = await invModel.insertInventory({
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
  })

  if (insertOk) {
    const nav = await utilities.getNav()
    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      message: `Success! "${inv_year} ${inv_make} ${inv_model}" was added.`
    })
  } else {
    const nav = await utilities.getNav()
    const classificationList = await utilities.buildClassificationList(classification_id)
    res.status(400).render("inventory/add-inventory", {
      title: "Add Vehicle",
      nav,
      message: "Sorry, the vehicle couldn't be added.",
      errors: [],
      classificationList,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id
    })
  }
}

module.exports = { invCont, buildManagement, buildAddClassification, createClassification, buildAddInventory, createInventory}