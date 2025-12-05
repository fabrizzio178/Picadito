export default interface IRepositoryBase<T, TCreate = T> {
    create(item: TCreate): Promise<T>;

    findAll(): Promise<T[]>;
    
    findById(id: number): Promise<T | null>;

    update(id: number, item: Partial<T>): Promise<boolean>;

    delete(id: number): Promise<boolean>;
}
