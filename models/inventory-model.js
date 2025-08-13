const pool = require("../database/")

/* **************************
 * Get all classification data
 * ************************ */
async function getClassifications(){
    return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error " + error)
  }
}

/* ***************************
 *  Get a single vehicle by inv_id
 * ************************** */
async function getVehicleById(inv_id) {
  try {
    const data = await pool.query(
      "SELECT * FROM inventory WHERE inv_id = $1",
      [inv_id]
    )
    return data.rows[0]
  } catch (error) {
    throw new Error("Vehicle not found.")
  }
}

/* ***************************
 * Insert new classification
*  *************************** */
async function insertClassification(classification_name) {
  try {
    const sql = `
      INSERT INTO classification (classification_name)
      VALUES ($1)
      RETURNING classification_id
    `
    const result = await pool.query(sql, [classification_name])
    return result.rowCount === 1
  } catch (err) {
    return false
  }
}

/* ***************************
 * Insert new vehicle into inventory
*  *************************** */
async function insertInventory(inv) {
  try {
    const sql = `
      INSERT INTO inventory
        (inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail,
         inv_price, inv_miles, inv_color, classification_id)
      VALUES
        ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING inv_id
    `
    const params = [
      inv.inv_make,
      inv.inv_model,
      inv.inv_year,
      inv.inv_description,
      inv.inv_image,
      inv.inv_thumbnail,
      inv.inv_price,
      inv.inv_miles,
      inv.inv_color,
      inv.classification_id
    ]
    const result = await pool.query(sql, params)
    return result.rowCount === 1
  } catch (err) {
    return false
  }
}

module.exports = {getClassifications, getInventoryByClassificationId, getVehicleById, insertClassification, insertInventory}