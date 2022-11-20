import { Store } from '../../index';

interface User {
  id: string;
  name: string;
}

interface Task {
  id: string;
  name: string;
}

interface TestStoreState {
  tasks: Task[];
  users: User[];
}

export class TestStore extends Store<TestStoreState> {
  // accept arguments for dynamic instantiation whilst testing...
  constructor(state: TestStoreState, options?: { freeze: boolean }) {
    super(state, options);
  }
}

const TASKS: Task[] = [
  { id: 'j9Opd3', name: 'Finish App' },
  { id: 'Hgd67a', name: 'Setup MacBook' },
  { id: 'j9Opd3', name: 'Write Tests' },
];

const USERS: User[] = [
  { id: 'j9Opd3', name: 'Todd Motto' },
  { id: 'Hgd67a', name: 'Rosetta Motto' },
];

const initialState: TestStoreState = {
  tasks: TASKS,
  users: USERS,
};

describe('Selectors', () => {
  let store: TestStore;

  describe('Basic Selectors', () => {
    beforeEach(() => (store = new TestStore(initialState)));

    const getTasks = (state: TestStoreState) => state.tasks;
    const getUsers = (state: TestStoreState) => state.users;
    // function that wraps a selector to accept an argument
    // this returns each user's tasks based on the `id` assigned
    const getTasksFromUser = (id: string) =>
      store.createSelector(getTasks, (state) =>
        state.filter((task) => task.id === id)
      );

    it('Selects state via `select()`', (done: DoneFn) => {
      // select passes store.state internally to selector
      store.select(getTasks).subscribe((state) => {
        expect(state).toEqual(TASKS);
      });
      store.select(getUsers).subscribe((state) => {
        expect(state).toEqual(USERS);
        done();
      });
    });

    it('Creates a selector with a single arg and projects state', () => {
      // manually involve the selector as if store.select was called
      store.createSelector(getTasks, (tasks) => {
        expect(tasks).toEqual(TASKS);
      })(store.state);

      store.createSelector(getUsers, (users) => {
        expect(users).toEqual(users);
      })(store.state);
    });

    it('Creates a selector with multiple args and projects state', () => {
      // each argument is projected into the callback
      store.createSelector(getTasks, getUsers, (tasks, users) => {
        expect(tasks).toEqual(TASKS);
        expect(users).toEqual(USERS);
      })(store.state);

      store.createSelector(
        getTasks,
        getUsers,
        () => ({ moreState: 123 }), // supply a third selector just to test...
        (tasks, users, more) => {
          expect(tasks).toEqual(TASKS);
          expect(users).toEqual(USERS);
          expect(more).toEqual({ moreState: 123 });
        }
      )(store.state);
    });

    it('Combines multiple selectors', () => {
      store.createSelector(getTasksFromUser('j9Opd3'), (tasks) =>
        expect(tasks).toEqual([TASKS[0], TASKS[2]])
      )(store.state);

      store.createSelector(getTasksFromUser('Hgd67a'), (tasks) =>
        expect(tasks).toEqual([TASKS[1]])
      )(store.state);
    });

    it('Selects and composes the correct store state', (done: DoneFn) => {
      const firstUserTasks = store.createSelector(
        getTasksFromUser('j9Opd3'),
        (tasks) => tasks // projector not needed, just testing that `createSelector` returns correctly
      );

      store.select(firstUserTasks).subscribe((state) => {
        expect(state).toEqual([TASKS[0], TASKS[2]]);
      });

      const secondUserTasks = store.createSelector(
        getTasksFromUser('Hgd67a'),
        (tasks) => tasks // projector not needed, just testing that `createSelector` returns correctly
      );

      store.select(secondUserTasks).subscribe((state) => {
        expect(state).toEqual([TASKS[1]]);
        done();
      });
    });
  });
});
