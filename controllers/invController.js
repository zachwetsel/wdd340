const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")
const favoritesModel = require("../models/favorites-model")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  const nav = await utilities.getNav()
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
    const item = await invModel.getVehicleById(inv_id) 
    if (!item) return next(new Error("Vehicle not found"))

    const dataForDetail = {
      ...item,
      inv_price: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(item.inv_price),
      inv_miles: new Intl.NumberFormat("en-US").format(item.inv_miles),
    }

    const detailHtml = await utilities.buildVehicleDetail(dataForDetail)
    const nav = await utilities.getNav()
    const title = `${item.inv_year} ${item.inv_make} ${item.inv_model}`
    const isFavorited = res.locals?.accountData
      ? await favoritesModel.isFavorited(res.locals.accountData.account_id, item.inv_id)
      : false

    res.render("./inventory/detail", { title, nav, detailHtml, item, isFavorited })
  } catch (err) {
    next(err)
  }
}

/** Management Dashboard */
invCont.buildManagement = async function (req, res, next) {
  const nav = await utilities.getNav()
  const classificationList = await utilities.buildClassificationList()
  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    message: res.locals.message || null,
    classificationList,
  })
}

/** Show add-classification form */
invCont.buildAddClassification = async function (req, res, next) {
  const nav = await utilities.getNav()
  res.render("inventory/add-classification", {
    title: "Add Classification",
    nav,
    message: null,
    errors: [],
  })
}

/** Insert Classification */
invCont.createClassification = async function (req, res, next) {
  const { classification_name } = req.body
  const result = await invModel.insertClassification(classification_name)
  const nav = await utilities.getNav()
  if (result) {
    const freshNav = await utilities.getNav()
    const classificationList = await utilities.buildClassificationList()
    res.render("inventory/management", {
      title: "Inventory Management",
      nav: freshNav,
      classificationList,
      message: `Success! "${classification_name}" was added.`,
    })
  } else {
    res.status(400).render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      message: "Sorry, the classification couldn't be added.",
      errors: [],
    })
  }
}

/** Show add-inventory form */
invCont.buildAddInventory = async function (req, res, next) {
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
    inv_thumbnail: "/images/vehicles/no-image-tn.png",
    inv_price: "",
    inv_miles: "",
    inv_color: "",
    classification_id: "",
  })
}

/** Insert Inventory */
invCont.createInventory = async function (req, res, next) {
  const {
    inv_make, inv_model, inv_year, inv_description,
    inv_image, inv_thumbnail, inv_price, inv_miles,
    inv_color, classification_id
  } = req.body

  const insertOk = await invModel.insertInventory({
    inv_make, inv_model, inv_year, inv_description,
    inv_image, inv_thumbnail, inv_price, inv_miles,
    inv_color, classification_id
  })

  if (insertOk) {
    const nav = await utilities.getNav()
    const classificationList = await utilities.buildClassificationList()
    res.render("inventory/management", {
      title: "Inventory Management",
      nav,
      classificationList,
      message: `Success! "${inv_year} ${inv_make} ${inv_model}" was added.`,
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
      inv_make, inv_model, inv_year, inv_description,
      inv_image, inv_thumbnail, inv_price, inv_miles,
      inv_color, classification_id,
    })
  }
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  const nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body

  const updateResult = await invModel.updateInventory(
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {
    const itemName = `${updateResult.inv_year} ${updateResult.inv_make} ${updateResult.inv_model}`
    req.flash("notice", `The ${itemName} was successfully updated.`)
    return res.redirect("/inv/")
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the update failed.")
    return res.status(501).render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect,
      errors: null,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
    })
  }
}

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async function (req, res, next) {
  const classification_id = parseInt(req.params.classification_id, 10)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData && invData[0] && invData[0].inv_id) {
    return res.json(invData)
  }
  next(new Error("No data returned"))
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id, 10)

  const nav = await utilities.getNav()

  // Get full vehicle record by ID
  const itemData = await invModel.getVehicleById(inv_id)
  if (!itemData) {
    return next(new Error("Vehicle not found"))
  }

  // Build select with the current classification selected
  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)

  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect, 

    errors: null,

    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id
  })
}

/* ***************************
 *  Build delete confirmation view
 * ************************** */
invCont.deleteConfirmView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id, 10)
  const nav = await utilities.getNav()

  const itemData = await invModel.getVehicleById(inv_id)
  if (!itemData) return next(new Error("Vehicle not found"))

  const itemName = `${itemData.inv_make} ${itemData.inv_model}`

  // Only the basics needed for confirmation view
  res.render("./inventory/delete-confirm", {
    title: "Delete " + itemName,
    nav,
    errors: null,
    message: res.locals.message || null,

    // fields shown read-only in the form
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_price: itemData.inv_price, // raw number; format in view if you want
  })
}

/* ***************************
 *  Delete Inventory Item (POST)
 * ************************** */
invCont.deleteInventory = async function (req, res, next) {
  const nav = await utilities.getNav()
  const inv_id = parseInt(req.body.inv_id, 10)

  const result = await invModel.deleteInventoryItem(inv_id)

  if (result && result.rowCount === 1) {
    req.flash("notice", "The vehicle was successfully deleted.")
    return res.redirect("/inv/")
  } else {
    // Failed – send them back to the confirmation view for the same item
    req.flash("notice", "Sorry, the delete failed.")
    return res.redirect(`/inv/delete/${inv_id}`)
  }
}

module.exports = invCont