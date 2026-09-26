import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';

const CartContext = createContext();

const getInitialCart = () => {
  try {
    const stored = localStorage.getItem('sweet_haven_cart');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return [
    {
      cart_id: 1,
      id: 1,
      name: 'Belgian Dark Truffle Cake',
      category: 'Cakes',
      price: 899,
      discount: 10,
      quantity: 1,
      stock_quantity: 25,
      weight_size: '1 Kg',
      image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=700&q=80'
    },
    {
      cart_id: 2,
      id: 4,
      name: 'Luxury Hazelnut Praline Truffles Box',
      category: 'Chocolates',
      price: 549,
      discount: 15,
      quantity: 2,
      stock_quantity: 50,
      weight_size: '300g Box',
      image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=700&q=80'
    }
  ];
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(getInitialCart);

  const [wishlistItems, setWishlistItems] = useState([
    {
      id: 2,
      name: 'Royal Red Velvet Cake',
      category: 'Cakes',
      price: 799,
      discount: 5,
      stock_quantity: 18,
      weight_size: '1 Kg',
      image: 'https://images.unsplash.com/photo-1586788680434-30d324b2d46f?w=700&q=80'
    },
    {
      id: 5,
      name: 'Salted Caramel Walnut Fudge Brownie',
      category: 'Brownies',
      price: 399,
      discount: 0,
      stock_quantity: 40,
      weight_size: '6 Pieces',
      image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=700&q=80'
    }
  ]);

  const [customerUser, setCustomerUser] = useState(null);

  // Sync cartItems state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sweet_haven_cart', JSON.stringify(cartItems));
    } catch (e) {}
  }, [cartItems]);

  useEffect(() => {
    const userStr = localStorage.getItem('sweet_haven_user');
    const token = localStorage.getItem('sweet_haven_token');
    if (userStr && token) {
      try {
        setCustomerUser(JSON.parse(userStr));
        fetchCartAndWishlist();
      } catch (e) {}
    }
  }, []);

  const fetchCartAndWishlist = async () => {
    try {
      const [cRes, wRes] = await Promise.all([
        apiService.getCart(),
        apiService.getWishlist()
      ]);
      if (cRes && cRes.success && Array.isArray(cRes.cartItems) && cRes.cartItems.length > 0) {
        setCartItems(cRes.cartItems);
      }
      if (wRes && wRes.success && Array.isArray(wRes.wishlistItems)) {
        setWishlistItems(wRes.wishlistItems);
      }
    } catch (err) {}
  };

  const handleAddToCart = async (product, quantity = 1) => {
    const qtyToAdd = product.selectedQuantity || quantity;
    const stock = product.stock_quantity !== undefined ? product.stock_quantity : (product.stockQuantity ?? 10);
    if (stock <= 0) return { success: false, message: 'Item is currently Out of Stock.' };

    let updatedList = [];
    setCartItems(prev => {
      const existingIdx = prev.findIndex(i => i.id === product.id);
      if (existingIdx !== -1) {
        const copy = [...prev];
        const newQty = copy[existingIdx].quantity + qtyToAdd;
        copy[existingIdx].quantity = newQty;
        updatedList = copy;
        return copy;
      } else {
        const newItem = {
          cart_id: Date.now(),
          id: product.id,
          name: product.name,
          category: product.category,
          price: product.price,
          discount: product.discount || 0,
          quantity: qtyToAdd,
          stock_quantity: stock,
          weight_size: product.weight_size || product.weightSize || '500g',
          image: product.image
        };
        updatedList = [...prev, newItem];
        return updatedList;
      }
    });

    try {
      localStorage.setItem('sweet_haven_cart', JSON.stringify(updatedList));
    } catch (e) {}

    if (customerUser) {
      try {
        await apiService.addToCart(product.id, qtyToAdd);
      } catch (e) {}
    }

    return { success: true, message: 'Added to Cart!' };
  };

  const handleUpdateQuantity = async (productId, quantity) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }

    setCartItems(prev => prev.map(item => item.id === productId ? { ...item, quantity } : item));

    if (customerUser) {
      try {
        await apiService.updateCartQuantity(productId, quantity);
      } catch (e) {}
    }
  };

  const handleRemoveFromCart = async (productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
    if (customerUser) {
      try {
        await apiService.removeFromCart(productId);
      } catch (e) {}
    }
  };

  const handleClearCart = async () => {
    setCartItems([]);
    if (customerUser) {
      try {
        await apiService.clearCart();
      } catch (e) {}
    }
  };

  const handleToggleWishlist = async (product) => {
    const exists = wishlistItems.some(i => i.id === product.id);
    if (exists) {
      setWishlistItems(prev => prev.filter(i => i.id !== product.id));
    } else {
      setWishlistItems(prev => [...prev, product]);
    }

    if (customerUser) {
      try {
        await apiService.toggleWishlist(product.id);
      } catch (e) {}
    }

    return !exists;
  };

  const handleMoveToCart = (product) => {
    handleAddToCart(product, 1);
    handleToggleWishlist(product);
  };

  // Cart Computations
  const subtotal = cartItems.reduce((sum, item) => {
    const priceAfterDiscount = Math.round(item.price * (1 - (item.discount || 0) / 100));
    return sum + (priceAfterDiscount * item.quantity);
  }, 0);

  const rawSubtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalDiscount = rawSubtotal - subtotal;
  const deliveryFee = subtotal === 0 || subtotal > 999 ? 0 : 50;
  const grandTotal = subtotal + deliveryFee;

  return (
    <CartContext.Provider value={{
      cartItems,
      wishlistItems,
      customerUser,
      setCustomerUser,
      subtotal,
      rawSubtotal,
      totalDiscount,
      deliveryFee,
      grandTotal,
      addToCart: handleAddToCart,
      updateQuantity: handleUpdateQuantity,
      removeFromCart: handleRemoveFromCart,
      clearCart: handleClearCart,
      toggleWishlist: handleToggleWishlist,
      moveToCart: handleMoveToCart,
      refreshData: fetchCartAndWishlist
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
