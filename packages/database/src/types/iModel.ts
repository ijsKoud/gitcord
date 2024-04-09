export interface iModel<TSelect, TInsert> {
	get(id: string): Promise<TSelect | null>;
	getAll(): Promise<TSelect[]>;

	update(id: string, data: Partial<TInsert>): Promise<TSelect>;
	create(data: TInsert[]): Promise<TSelect[]>;
	delete(id: string): Promise<void>;
}
