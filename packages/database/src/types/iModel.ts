export interface iModel<TSelect, TInsert> {
	get(id: string | number): Promise<TSelect | null>;
	getAll(): Promise<TSelect[]>;

	update(id: string | number, data: Partial<TInsert>): Promise<TSelect>;
	create(data: TInsert[]): Promise<TSelect[]>;
	delete(id: string | number): Promise<void>;
}
