export interface Repository<T> {
    findAll(): Promise<T[] | undefined>
    findOne(filter: { id: string }): Promise<T | undefined>
    add(item: T): Promise<T | undefined>
    update(filter: { id: string }, item: T): Promise<T | undefined>
    delete(filter: { id: string }): Promise<T | undefined>
}