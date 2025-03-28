import { useState, useEffect, useMemo } from "react";
import { db } from "../data/db";

export const useCart = () => {
    const initialCart = () => {
        const localStorageCart = localStorage.getItem("cart");
        return localStorageCart ? JSON.parse(localStorageCart) : [];
    };

    const [data, setData] = useState([]);
    const [cart, setCart] = useState(initialCart);

    const MAX_ITEMS = 5;
    const MIN_ITEMS = 1;

    useEffect(() => {
        setData(db);
    }, [data]);

    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cart));
    }, [cart]);

    function addToCart(item) {
        const itemExists = cart.findIndex((guitar) => guitar.id === item.id);
        if (itemExists >= 0) {
        if (cart[itemExists].quantity >= MAX_ITEMS) return;
        const updateCart = [...cart];
        updateCart[itemExists].quantity += 1;
        setCart(updateCart);
        } else {
        item.quantity = 1;
        setCart([...cart, item]);
        console.log("Producto agregado al carrito");
        }
    }

    function removeFromCart(id) {
        setCart(cart.filter((guitar) => guitar.id !== id));
    }

    function increaseQuantity(id) {
        const updatedCart = cart.map((item) => {
        if (item.id === id && item.quantity < MAX_ITEMS) {
            return {
            ...item,
            quantity: item.quantity + 1,
            };
        }
        return item;
        });
        setCart(updatedCart);
    }

    function decreaseQuantity(id) {
        const updatedCart = cart.map((item) => {
        if (item.id === id && item.quantity > MIN_ITEMS) {
            return {
            ...item,
            quantity: item.quantity - 1,
            };
        }
        return item;
        });
        setCart(updatedCart);
    }

    function clearCart() {
        setCart([]);
    };

//State derivado
    const isEmpty = useMemo(() => cart.length === 0, [cart]);
    const cartTotal = useMemo(
        () => cart.reduce((total, item) => total + item.price * item.quantity, 0),
        [cart]
    );

    return {
        data,
        cart,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
        isEmpty,
        cartTotal,
    };
};
