import { Injectable, Inject } from '@angular/core';

import { BehaviorSubject, Observable, map, distinctUntilChanged } from 'rxjs';

import {
  ArrayElement,
  StoreEntity,
  Selector,
  StoreOptions,
} from './lite-store.model';

@Injectable({
  providedIn: 'root',
})
export abstract class Store<T> {
  private _freeze: boolean = true;
  private _entityId: string = 'id';
  private _state: BehaviorSubject<T>;

  private setFrozen(state: T): T {
    if (this._freeze) {
      Object.getOwnPropertyNames(state).forEach((prop: string) => {
        const value = state[prop as keyof T] as unknown as T;
        if (value && typeof value === 'object') {
          this.setFrozen(value);
        }
      });

      return Object.freeze(state);
    }
    return state;
  }

  get state(): T {
    return this._state.getValue();
  }

  get state$(): Observable<T> {
    return this._state.asObservable();
  }

  constructor(
    @Inject('') initialState: T,
    @Inject('')
    options?: StoreOptions<T>
  ) {
    if (options?.freeze === false) {
      this._freeze = false;
    }
    if (options?.entityId) {
      this._entityId = options.entityId;
    }
    this._state = new BehaviorSubject<T>(this.setFrozen(initialState));
  }

  toEntities<S extends any[], E extends ArrayElement<S>>(
    state: S
  ): { [id: string]: E } {
    return state.reduce((entities: {}, next: E) => {
      if (!(this._entityId in next)) {
        throw new Error(
          `No unique identifier "${this._entityId}" found in ${JSON.stringify(
            next
          )}`
        );
      }
      return {
        ...entities,
        [next[this._entityId]]: next,
      };
    }, {});
  }

  setState<K extends keyof T, E extends Partial<Pick<T, K>>>(
    fn: (state: T) => E
  ): T {
    let newState;
    const reducedState = fn(this.state) as E & StoreEntity<K>;

    if (reducedState.entities) {
      newState = {
        ...this.state,
        ...reducedState,
        ids: Object.keys(reducedState.entities),
      };
    } else {
      newState = { ...this.state, ...reducedState };
    }

    this._state.next(this.setFrozen(newState));

    return this.state;
  }

  createSelector<State, S1, Result>(
    s1: Selector<State, S1>,
    projector: (s1: S1) => Result
  ): Selector<State, Result>;

  createSelector<State, S1, S2, Result>(
    s1: Selector<State, S1>,
    s2: Selector<State, S2>,
    projector: (s1: S1, s2: S2) => Result
  ): Selector<State, Result>;

  createSelector<State, S1, S2, S3, Result>(
    s1: Selector<State, S1>,
    s2: Selector<State, S2>,
    s3: Selector<State, S3>,
    projector: (s1: S1, s2: S2, s3: S3) => Result
  ): Selector<State, Result>;

  createSelector<State, S1, S2, S3, S4, Result>(
    s1: Selector<State, S1>,
    s2: Selector<State, S2>,
    s3: Selector<State, S3>,
    s4: Selector<State, S4>,
    projector: (s1: S1, s2: S2, s3: S3, s4: S4) => Result
  ): Selector<State, Result>;

  createSelector<State, S1, S2, S3, S4, S5, Result>(
    s1: Selector<State, S1>,
    s2: Selector<State, S2>,
    s3: Selector<State, S3>,
    s4: Selector<State, S4>,
    s5: Selector<State, S5>,
    projector: (s1: S1, s2: S2, s3: S3, s4: S4, s5: S5) => Result
  ): Selector<State, Result>;

  createSelector<State, S1, S2, S3, S4, S5, S6, Result>(
    s1: Selector<State, S1>,
    s2: Selector<State, S2>,
    s3: Selector<State, S3>,
    s4: Selector<State, S4>,
    s5: Selector<State, S5>,
    s6: Selector<State, S6>,
    projector: (s1: S1, s2: S2, s3: S3, s4: S4, s5: S5, s6: S6) => Result
  ): Selector<State, Result>;

  createSelector<State, S1, S2, S3, S4, S5, S6, S7, Result>(
    s1: Selector<State, S1>,
    s2: Selector<State, S2>,
    s3: Selector<State, S3>,
    s4: Selector<State, S4>,
    s5: Selector<State, S5>,
    s6: Selector<State, S6>,
    s7: Selector<State, S7>,
    projector: (
      s1: S1,
      s2: S2,
      s3: S3,
      s4: S4,
      s5: S5,
      s6: S6,
      s7: S7
    ) => Result
  ): Selector<State, Result>;

  createSelector<State, S1, S2, S3, S4, S5, S6, S7, S8, Result>(
    s1: Selector<State, S1>,
    s2: Selector<State, S2>,
    s3: Selector<State, S3>,
    s4: Selector<State, S4>,
    s5: Selector<State, S5>,
    s6: Selector<State, S6>,
    s7: Selector<State, S7>,
    s8: Selector<State, S8>,
    projector: (
      s1: S1,
      s2: S2,
      s3: S3,
      s4: S4,
      s5: S5,
      s6: S6,
      s7: S7,
      s8: S8
    ) => Result
  ): Selector<State, Result>;

  createSelector(...args: any[]): Selector<any, any> {
    return (state) => {
      const selectors = args.slice(0, args.length - 1);
      const projector = args[args.length - 1];

      return projector.apply(
        null,
        selectors.map((selector) => selector(state))
      );
    };
  }

  select<K extends keyof T>(selector: K): Observable<T[K]>;
  select<K>(selector: (state: T) => K): Observable<K>;
  select<K>(selector: K | ((state: T) => K)) {
    switch (typeof selector) {
      case 'string':
        return this.state$.pipe(
          map((state) => state[selector as unknown as keyof T]),
          distinctUntilChanged()
        );
      case 'function':
        return this.state$.pipe(
          map(selector as (state: T) => K),
          distinctUntilChanged()
        );
      default:
        throw new TypeError(
          `Argument must be 'string' or 'function', got '${typeof selector}'`
        );
    }
  }

  destroy(): void {
    this._state.complete();
  }
}
