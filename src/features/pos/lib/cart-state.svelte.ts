import type { Product } from '$features/products/types/product';
import type { CartItem } from '../types/cart';

export function createCartState() {
	let items = $state<CartItem[]>([]);

	function addProduct(product: Product) {
		const existing = items.find((i) => i.productId === product.id);
		if (existing) {
			existing.qty += 1;
		} else {
			items.push({
				id: crypto.randomUUID(),
				name: product.name,
				price: product.price,
				qty: 1,
				productId: product.id
			});
		}
	}

	function addManual(name: string, price: number, qty: number) {
		items.push({
			id: `manual-${crypto.randomUUID()}`,
			name,
			price,
			qty
		});
	}

	function updateQty(id: string, delta: 1 | -1) {
		const item = items.find((i) => i.id === id);
		if (!item) return;
		const newQty = item.qty + delta;
		if (newQty <= 0) {
			removeItem(id);
		} else {
			item.qty = newQty;
		}
	}

	function removeItem(id: string) {
		items = items.filter((i) => i.id !== id);
	}

	function clearCart() {
		items = [];
	}

	return {
		get items() {
			return items;
		},
		addProduct,
		addManual,
		updateQty,
		removeItem,
		clearCart
	};
}
