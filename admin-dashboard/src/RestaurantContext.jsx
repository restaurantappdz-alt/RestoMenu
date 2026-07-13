import { createContext, useContext } from 'react'

const RestaurantContext = createContext(null)

export function RestaurantProvider({ children, restaurantId, restaurantName, tvLink }) {
  return (
    <RestaurantContext.Provider value={{ restaurantId, restaurantName, tvLink }}>
      {children}
    </RestaurantContext.Provider>
  )
}

export function useRestaurant() {
  return useContext(RestaurantContext)
}
