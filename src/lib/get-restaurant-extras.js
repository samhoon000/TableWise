import extras from '../data/restaurant-extras.json'

export function getRestaurantExtras(restaurantId) {
  const tables =
    extras.tablesByRestaurant[restaurantId] ?? extras.defaultTables
  return {
    tables,
    menuCategories: extras.defaultMenuCategories,
  }
}
