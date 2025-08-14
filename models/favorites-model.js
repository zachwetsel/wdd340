const pool = require("../database")

/* Add a favorite */
async function addFavorite(account_id, item_id) {
  try {
    const sql = `
      INSERT INTO favorites (account_id, item_id)
      VALUES ($1, $2)
      RETURNING *;`
    const result = await pool.query(sql, [account_id, item_id])
    return result.rows[0]
  } catch (error) {
    throw new Error("Could not add favorite: " + error.message)
  }
}

/* Remove a favorite */
async function removeFavorite(account_id, item_id) {
  const sql = `
    DELETE FROM favorites
    WHERE account_id = $1 AND item_id = $2;`
  await pool.query(sql, [account_id, item_id])
}

/* Get all favorites for a user */
async function getFavoritesByUser(account_id) {
  const sql = `
    SELECT i.*
    FROM favorites f
    JOIN inventory i ON f.item_id = i.inv_id
    WHERE f.account_id = $1;`
  const result = await pool.query(sql, [account_id])
  return result.rows
}

/* Check if an item is already favorited */
async function isFavorited(account_id, item_id) {
  const sql = `
    SELECT 1 FROM favorites
    WHERE account_id = $1 AND item_id = $2;`
  const result = await pool.query(sql, [account_id, item_id])
  return result.rowCount > 0
}

module.exports = {addFavorite, removeFavorite, getFavoritesByUser, isFavorited,}