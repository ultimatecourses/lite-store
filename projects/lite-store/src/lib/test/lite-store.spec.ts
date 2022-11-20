import { Store } from '../../index';

interface TestStoreState {
  list: string[];
}

export class TestStore extends Store<TestStoreState> {
  // accept arguments for dynamic instantiation whilst testing...
  constructor(state: TestStoreState, options?: { freeze: boolean }) {
    super(state, options);
  }
}

describe('Store', () => {
  let store: TestStore;

  describe('Abstract Class Inheritance', () => {
    beforeEach(() => (store = new TestStore({ list: [] })));

    it('Inherits the Store constructor', () => {
      // instance creation and inherited methods/properties
      expect(store instanceof Store).toBeTrue();
      expect(store.createSelector).toBeDefined();
      expect(store.select).toBeDefined();
      expect(store.setState).toBeDefined();
      expect(store.toEntities).toBeDefined();
      expect(store.state).toBeDefined();
      expect(store.state$).toBeDefined();
    });
  });

  describe('Deep Freeze', () => {
    let frozenStoreImplicit: TestStore;
    let frozenStore: TestStore;
    let mutableStore: TestStore;

    beforeEach(() => {
      // frozen by default, optional `freeze: true`
      frozenStoreImplicit = new TestStore({ list: [] });
      frozenStore = new TestStore({ list: [] }, { freeze: true });
      // bypass freeze functionality
      mutableStore = new TestStore({ list: [] }, { freeze: false });
    });

    it('Accepts a `freeze` property but defaults to `true`', () => {
      // ensure frozen state
      expect(Object.isFrozen(frozenStoreImplicit.state)).toEqual(true);
      expect(Object.isFrozen(frozenStore.state)).toEqual(true);
      expect(Object.isFrozen(mutableStore.state)).toEqual(false);
    });

    it('Throws when mutating frozen state', () => {
      // array push or direct mutations will throw errors
      expect(() => (frozenStoreImplicit.state.list[0] = '#2')).toThrow();
      expect(() => frozenStoreImplicit.state.list.push('#2')).toThrow();
      expect(frozenStoreImplicit.state.list.length).toEqual(0);
      expect(() => (frozenStore.state.list[0] = '#2')).toThrow();
      expect(() => frozenStore.state.list.push('#2')).toThrow();
      expect(frozenStore.state.list.length).toEqual(0);
    });

    it('Does not throw when mutating mutable state', () => {
      // array push or direct mutations won't throw errors
      expect(() => mutableStore.state.list.push('#1')).not.toThrow();
      expect(() => mutableStore.state.list.push('#2')).not.toThrow();
      expect(mutableStore.state.list.length).toEqual(2);
    });
  });
});
