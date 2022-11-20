import { Store } from '../../index';
import { StoreOptions } from '../lite-store.model';

interface TestStoreState {
  title: string;
  list: string[];
}

export class TestStore extends Store<TestStoreState> {
  constructor(state: TestStoreState, options?: StoreOptions<TestStoreState>) {
    super(state, options);
  }
}

describe('State', () => {
  let store: TestStore;

  describe('Static and Observable State Accessors', () => {
    beforeEach(
      () => (store = new TestStore({ list: [], title: 'Test Store' }))
    );

    it('Exposes a current static `state` snapshot', () => {
      // static property exposes the full store and all properties
      expect(store.state).toEqual({ list: [], title: 'Test Store' });
      expect(store.state.list).toEqual([]);
      expect(store.state.title).toEqual('Test Store');
    });

    it('Exposes a current `state$` Observable', (done: DoneFn) => {
      // Observable exposes the same state as static
      store.state$.subscribe((state) =>
        expect(state).toEqual({ list: [], title: 'Test Store' })
      );
      done();
    });
  });

  describe('Set State Method', () => {
    beforeEach(
      () => (store = new TestStore({ list: [], title: 'Test Store' }))
    );

    it('Sets new state as a full or partial update', () => {
      // partial state update
      store.setState(({ list }) => ({
        // spread existing `list`, not needed here as empty but good practice anyway...
        list: [...list, 'I', 'Like', 'To', 'Party'],
      }));

      // maintains `title`
      expect(store.state).toEqual({
        title: 'Test Store',
        list: ['I', 'Like', 'To', 'Party'],
      });

      // partial state update
      store.setState(() => ({
        title: 'New Title',
      }));

      // maintains `list`
      expect(store.state).toEqual({
        title: 'New Title',
        list: ['I', 'Like', 'To', 'Party'],
      });

      // full state update
      store.setState(({ list }) => ({
        title: 'Another Title',
        list: [...list, 'All', 'The', 'Time'],
      }));

      // updates everything nicely...
      expect(store.state).toEqual({
        title: 'Another Title',
        list: ['I', 'Like', 'To', 'Party', 'All', 'The', 'Time'],
      });
    });
  });
});
