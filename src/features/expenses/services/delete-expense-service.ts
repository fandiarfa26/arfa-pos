export async function deleteExpenseService(
	supabase: App.Locals['supabase'],
	expenseId: string,
	userId?: string
) {
	let query = supabase.from('expenses').delete().eq('id', expenseId);
	if (userId) query = query.eq('user_id', userId);
	return await query;
}
