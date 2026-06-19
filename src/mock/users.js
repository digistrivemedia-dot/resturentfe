export const mockUser = {
  _id: "user_001",
  name: "Rohan Malo",
  email: "rohan@example.com",
  phone: "9876543210",
  avatar: null,
  role: "customer",
  authProvider: "phone",
  isEmailVerified: true,
  isPhoneVerified: true,
  addresses: [
    {
      _id: "addr_001",
      label: "home",
      fullAddress: "B-204, Sunrise Apartments, Andheri West, Mumbai 400053",
      landmark: "Near Metro Station",
      lat: 19.1197,
      lng: 72.8464,
      isDefault: true,
    },
    {
      _id: "addr_002",
      label: "work",
      fullAddress: "5th Floor, Tech Park, BKC, Mumbai 400051",
      landmark: "Opposite Diamond Garden",
      lat: 19.0658,
      lng: 72.8686,
      isDefault: false,
    },
  ],
  favorites: ["rest_001", "rest_005"],
  wallet: { balance: 150 },
  status: "active",
  createdAt: "2026-01-15T10:00:00Z",
};

export const mockRestaurantOwner = {
  _id: "user_002",
  name: "Vikram Singh",
  email: "vikram@tandoorinights.com",
  phone: "9876543211",
  role: "restaurant_owner",
  restaurantId: "rest_001",
  status: "active",
};

export const mockAdmin = {
  _id: "user_003",
  name: "Admin User",
  email: "admin@cafesriisha.com",
  role: "super_admin",
  status: "active",
};
