import { Store, StoreEntity } from '../../index';
import { StoreOptions } from '../lite-store.model';

// interface to describe each entity
interface Item {
  id: string;
  name: string;
  price: number;
}

// inherit `entities` and `ids` whilst supplying a Generic
interface TestStoreState extends StoreEntity<Item> {
  title: string; // ...any other state properties
}

// initial store state
const initialState: TestStoreState = {
  title: 'Test Store',
  ids: [],
  entities: {},
};

export class TestStore extends Store<TestStoreState> {
  constructor(state: TestStoreState, options?: StoreOptions<TestStoreState>) {
    super(state, options);
  }
}

describe('Entities', () => {
  let store: TestStore;

  const DATA: Item[] = [
    { id: 'zKj01n', name: 'Item #1', price: 100 },
    { id: 'cH67kP', name: 'Item #2', price: 200 },
    { id: 'abd41H', name: 'Item #3', price: 300 },
  ];

  describe('Entity Creation from an Array', () => {
    beforeEach(() => (store = new TestStore(initialState)));

    it('Flattens an array data structure to entities', () => {
      // array to entities conversion
      const entities = store.toEntities(DATA);

      // test the output is an object of the ids
      // by default lite-store uses the `id`
      expect(entities).toEqual({
        zKj01n: DATA[0],
        cH67kP: DATA[1],
        abd41H: DATA[2],
      });
    });

    it('Generates and syncs entity ids under-the-hood', () => {
      const entities = store.toEntities(DATA);

      // set `entities` and let's test those generated `ids`...
      store.setState(() => ({
        entities,
      }));

      // an array of `ids` is automatically created
      expect(store.state).toEqual({
        title: 'Test Store',
        ids: ['zKj01n', 'cH67kP', 'abd41H'],
        entities: {
          zKj01n: DATA[0],
          cH67kP: DATA[1],
          abd41H: DATA[2],
        },
      });

      // remove single entity, `ids` will be updated when `entities` are...
      store.setState((state) => {
        const id = 'cH67kP';
        // destructuring trick to remove a single property and spread the rest
        const { [id]: removed, ...entities } = state.entities;

        return { entities };
      });

      // `ids` updates under-the-hood
      expect(store.state).toEqual({
        title: 'Test Store',
        ids: ['zKj01n', 'abd41H'],
        entities: {
          zKj01n: DATA[0],
          abd41H: DATA[2],
        },
      });

      // add single
      const newItem: Item = { id: 'r32z16', name: 'Item #4', price: 400 };

      // set a new entity in the state tree using the `id`
      store.setState(({ entities }) => {
        return {
          entities: {
            ...entities,
            [newItem.id]: newItem,
          },
        };
      });

      // appended to our `ids` automatically...
      expect(store.state).toEqual({
        title: 'Test Store',
        ids: ['zKj01n', 'abd41H', 'r32z16'],
        entities: {
          zKj01n: DATA[0],
          abd41H: DATA[2],
          r32z16: newItem,
        },
      });
    });
  });

  describe('Entity with custom unique identifier', () => {
    let storeInvalidEntityId: TestStore;

    beforeEach(() => {
      // custom `entityId`
      store = new TestStore(initialState, { entityId: 'name' });
      // cast to invalid `entityId` to `any` to test thrown errors
      storeInvalidEntityId = new TestStore(initialState, {
        entityId: 'fml' as any,
      });
    });

    it('Should index each entity with a custom `entityId`', () => {
      const entities = store.toEntities(DATA);

      // use the `name` property from our `Item` model to index `entities`
      expect(entities).toEqual({
        'Item #1': DATA[0],
        'Item #2': DATA[1],
        'Item #3': DATA[2],
      });

      store.setState(() => ({
        entities,
      }));

      expect(store.state).toEqual({
        title: 'Test Store',
        ids: ['Item #1', 'Item #2', 'Item #3'],
        entities: {
          'Item #1': DATA[0],
          'Item #2': DATA[1],
          'Item #3': DATA[2],
        },
      });
    });

    it("Should throw when indexing with a property doesn't exist", () => {
      expect(() => storeInvalidEntityId.toEntities(DATA)).toThrowError(
        'No unique identifier "fml" found in {"id":"zKj01n","name":"Item #1","price":100}'
      );
    });
  });
});
