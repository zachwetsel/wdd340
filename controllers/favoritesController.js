const favoritesModel = require("../models/favorites-model")
const utilities = require("../utilities")

/* Toggle favorite (add or remove) */
async function toggleFavorite(req, res, next) {
  const { item_id } = req.body
  const account_id = res.locals.accountData.account_id

  try {
    const alreadyFavorited = await favoritesModel.isFavorited(account_id, item_id)

    if (alreadyFavorited) {
      await favoritesModel.removeFavorite(account_id, item_id)
      req.flash("notice", "Removed from favorites.")
    } else {
      await favoritesModel.addFavorite(account_id, item_id)
      req.flash("notice", "Added to favorites!")
    }

    res.redirect("back")
  } catch (error) {
    next(error)
  }
}

/* View all favorites */
async function viewFavorites(req, res, next) {
  try {
    const nav = await utilities.getNav()
    const favorites = await favoritesModel.getFavoritesByUser(res.locals.accountData.account_id)
    res.render("account/favorites", {
      title: "My Favorites",
      nav,
      favorites,
      notice: req.flash("notice"),
    })
  } catch (err) {
    next(err)
  }
}

module.exports = { toggleFavorite, viewFavorites }