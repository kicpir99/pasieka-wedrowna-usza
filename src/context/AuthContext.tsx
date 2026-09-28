import React, { createContext, useContext, useState, useEffect } from 'react';

export interface SubscriptionItem {
  id: string;
  productId: string;
  productName: string;
  weightLabel: string;
  intervalDays: 30 | 60 | 90;
  pricePln: number;
  nextShipmentDate: string;
  status: 'active' | 'paused';
  imageUrl: string;
}

export interface UserAddress {
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  postalCode: string;
  phone: string;
  parcelLocker: string;
}

export interface SavedCard {
  brand: 'Visa' | 'Mastercard';
  last4: string;
  expiry: string;
}

export interface PastOrderItem {
  productId: string;
  productName: string;
  weightGrams: number;
  pricePln: number;
  quantity: number;
}

export interface PastOrder {
  id: string;
  date: string;
  itemsSummary: string;
  items?: PastOrderItem[];
  totalPln: number;
  status: 'Doręczona' | 'W drodze' | 'Przygotowywana';
  trackingNumber?: string;
  invoiceNumber?: string;
}

export interface InvoiceData {
  isCompany: boolean;
  companyName: string;
  nip: string;
  street: string;
  postalCode: string;
  city: string;
}

export interface UserProfile {
  email: string;
  firstName: string;
  lastName: string;
  address: UserAddress;
  invoiceData?: InvoiceData;
  savedCard: SavedCard | null;
  subscriptions: SubscriptionItem[];
  orders: PastOrder[];
  favorites: string[];
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: UserProfile | null;
  login: (email: string, password?: string) => void;
  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    phone?: string;
    street?: string;
    city?: string;
    postalCode?: string;
    parcelLocker?: string;
  }) => void;
  logout: () => void;
  loginAsDemoUser: () => void;
  updateSubscriptionInterval: (subId: string, newDays: 30 | 60 | 90) => void;
  togglePauseSubscription: (subId: string) => void;
  cancelSubscription: (subId: string) => void;
  updateAddress: (newAddress: UserAddress) => void;
  updateInvoiceData: (newInvoiceData: InvoiceData) => void;
  updateCard: (newCard: SavedCard) => void;
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
}

const STORAGE_KEY = 'pasieka_user_account_v1';

const DEMO_USER: UserProfile = {
  email: 'anna.kowalska@example.com',
  firstName: 'Anna',
  lastName: 'Kowalska',
  address: {
    firstName: 'Anna',
    lastName: 'Kowalska',
    street: 'ul. Parkowa 14/8',
    city: 'Wrocław',
    postalCode: '50-120',
    phone: '+48 601 234 567',
    parcelLocker: 'WRO05M • ul. Sienkiewicza 32, Wrocław',
  },
  invoiceData: {
    isCompany: true,
    companyName: 'Studio Projektowe Kowalska Sp. z o.o.',
    nip: '8971234567',
    street: 'ul. Parkowa 14/8',
    postalCode: '50-120',
    city: 'Wrocław',
  },
  savedCard: {
    brand: 'Visa',
    last4: '4821',
    expiry: '08/28',
  },
  favorites: ['miod-wrzosowy', 'miod-ze-spadzi-iglastej'],
  subscriptions: [
    {
      id: 'sub-lipa-1200',
      productId: 'miod-lipowy',
      productName: 'Miód Lipowy (RAW)',
      weightLabel: '1200 g (Duży słoik)',
      intervalDays: 60,
      pricePln: 67.5, // 75 zł - 10%
      nextShipmentDate: '15 października 2026',
      status: 'active',
      imageUrl: 'https://pasiekausza.pl/wp-content/uploads/2022/02/miod-lipowy-650x650.jpg',
    },
    {
      id: 'sub-pylek-200',
      productId: 'pylek-pszczeli',
      productName: 'Pyłek Pszczeli Kwiatowy',
      weightLabel: '200 g',
      intervalDays: 30,
      pricePln: 25.2, // 28 zł - 10%
      nextShipmentDate: '10 października 2026',
      status: 'active',
      imageUrl: 'https://pasiekausza.pl/wp-content/uploads/2022/02/pylek-pszczeli.jpg',
    }
  ],
  orders: [
    {
      id: 'USZ-26/1842',
      date: '12 sierpnia 2026',
      itemsSummary: 'Miód ze Spadzi Iglastej (1200g) + Miód Lipowy (400g)',
      items: [
        {
          productId: 'miod-ze-spadzi-iglastej',
          productName: 'Miód ze Spadzi Iglastej (RAW)',
          weightGrams: 1200,
          pricePln: 98,
          quantity: 1,
        },
        {
          productId: 'miod-lipowy',
          productName: 'Miód Lipowy (RAW)',
          weightGrams: 400,
          pricePln: 35,
          quantity: 1,
        }
      ],
      totalPln: 133,
      status: 'Doręczona',
      trackingNumber: '62849182371928472910',
      invoiceNumber: 'FV/USZ/2026/08/1842',
    },
    {
      id: 'USZ-26/1420',
      date: '15 czerwca 2026',
      itemsSummary: 'Miód Akacjowy (1200g) • Autouzupełnianie',
      items: [
        {
          productId: 'miod-akacjowy',
          productName: 'Miód Akacjowy (RAW)',
          weightGrams: 1200,
          pricePln: 70.2,
          quantity: 1,
        }
      ],
      totalPln: 70.2,
      status: 'Doręczona',
      trackingNumber: '62849182371928471184',
      invoiceNumber: 'FV/USZ/2026/06/1420',
    }
  ]
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
    return null;
  });

  const saveUser = (u: UserProfile | null) => {
    setUser(u);
    try {
      if (u) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {}
  };

  const login = (email: string, _password?: string) => {
    // If there's an existing registered user in localStorage with this email, restore it, otherwise initialize
    const newUser: UserProfile = {
      ...DEMO_USER,
      email,
      firstName: email.split('@')[0],
      favorites: DEMO_USER.favorites || [],
    };
    saveUser(newUser);
  };

  const register = (data: {
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    phone?: string;
    street?: string;
    city?: string;
    postalCode?: string;
    parcelLocker?: string;
  }) => {
    const newUser: UserProfile = {
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      address: {
        firstName: data.firstName,
        lastName: data.lastName,
        street: data.street || '',
        city: data.city || '',
        postalCode: data.postalCode || '',
        phone: data.phone || '',
        parcelLocker: data.parcelLocker || '',
      },
      savedCard: null,
      subscriptions: [],
      orders: [],
      favorites: [],
    };
    saveUser(newUser);
  };

  const loginAsDemoUser = () => {
    saveUser(DEMO_USER);
  };

  const logout = () => {
    saveUser(null);
  };

  const updateSubscriptionInterval = (subId: string, newDays: 30 | 60 | 90) => {
    if (!user) return;
    const updatedSubs = user.subscriptions.map(s => {
      if (s.id === subId) {
        return { ...s, intervalDays: newDays };
      }
      return s;
    });
    saveUser({ ...user, subscriptions: updatedSubs });
  };

  const togglePauseSubscription = (subId: string) => {
    if (!user) return;
    const updatedSubs = user.subscriptions.map(s => {
      if (s.id === subId) {
        return {
          ...s,
          status: s.status === 'active' ? ('paused' as const) : ('active' as const),
        };
      }
      return s;
    });
    saveUser({ ...user, subscriptions: updatedSubs });
  };

  const cancelSubscription = (subId: string) => {
    if (!user) return;
    const updatedSubs = user.subscriptions.filter(s => s.id !== subId);
    saveUser({ ...user, subscriptions: updatedSubs });
  };

  const updateAddress = (newAddress: UserAddress) => {
    if (!user) return;
    saveUser({
      ...user,
      address: newAddress,
      firstName: newAddress.firstName || user.firstName,
      lastName: newAddress.lastName || user.lastName,
    });
  };

  const updateInvoiceData = (newInvoiceData: InvoiceData) => {
    if (!user) return;
    saveUser({
      ...user,
      invoiceData: newInvoiceData,
    });
  };

  const updateCard = (newCard: SavedCard) => {
    if (!user) return;
    saveUser({
      ...user,
      savedCard: newCard,
    });
  };

  const toggleFavorite = (productId: string) => {
    if (!user) return;
    const currentFavs = user.favorites || [];
    const isFav = currentFavs.includes(productId);
    const updatedFavs = isFav
      ? currentFavs.filter(id => id !== productId)
      : [...currentFavs, productId];
    saveUser({
      ...user,
      favorites: updatedFavs,
    });
  };

  const isFavorite = (productId: string): boolean => {
    return Boolean(user?.favorites?.includes(productId));
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: Boolean(user),
        user,
        login,
        register,
        logout,
        loginAsDemoUser,
        updateSubscriptionInterval,
        togglePauseSubscription,
        cancelSubscription,
        updateAddress,
        updateInvoiceData,
        updateCard,
        toggleFavorite,
        isFavorite,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
