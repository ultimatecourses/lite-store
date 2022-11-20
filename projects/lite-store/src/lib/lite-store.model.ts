export type Selector<T, V> = (state: T) => V;

export type ArrayElement<A> = A extends readonly (infer T)[] ? T : never;

export type StoreOptions<T> = {
  freeze?: boolean;
  entityId?: EntityId<T>;
};

export interface StoreEntity<E> {
  ids: string[];
  entities: { [id: string]: E };
}

export type EntityId<P> = P extends StoreEntity<infer T> ? keyof T : never;
