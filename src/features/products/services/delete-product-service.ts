export async function deleteProductService(supabase: App.Locals['supabase'], productId: string) {
	return await supabase.from('products').delete().eq('id', productId);
}
