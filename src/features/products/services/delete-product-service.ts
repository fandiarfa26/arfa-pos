export async function deleteProductService(
	supabase: App.Locals['supabase'],
	productId: string,
	userId?: string
) {
	let query = supabase.from('products').delete().eq('id', productId);
	if (userId) query = query.eq('user_id', userId);
	return await query;
}
