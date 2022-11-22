<h1 align="center">
🔒 @ultimate/lite-store
</h1>
<h4 align="center">
  <img width="25" valign="middle" src="https://ultimatecourses.com/static/icons/angular.svg">
  1KB - Reactive Stores with entities and frozen state, without the headache
</h4>

---

<a href="https://ultimatecourses.com/courses/angular" target="_blank">
  <img src="https://ultimatecourses.com/static/banners/ultimate-angular-leader.svg">
</a>

---

* ✅ Services are individual Stores
* ✅ Entity Creation and Synchronized `ids`
* ✅ Fully Type Safe and Unit Tested
* ✅ State Selection via `select()`
* ✅ Complex selectors via `createSelector()`
* ✅ Partial or full state updates via `setState()`
* ✅ Immutable Objects by default using `Object.freeze()`
* ✅ Route guards seamless integration

> View the [Example App on StackBlitz](https://stackblitz.com/edit/angular-ivy-kbqjai?file=src%2Fapp%2Fservices%2Ftodo.service.ts)

# Introduction

The goal of the project is to make a `Service` more powerful. Simply extend the `Store` and inherit the functionality.

Whilst many developers use NGRX Store, many prefer a 'simpler' pattern using just Services, but this comes with the overhead of Observable management, state selection, entities, generic types, immutable operations and frozen state - which can get a bit messy quickly.

`@ultimate/lite-store` makes reactive services simple by hiding underlying Observable implementation, entity creation and management, selectors and state access - so you can manage state without the headaches, leaving state services super lean. It is fully typed to support your data structures.


You get automatic "frozen state" out-of-the-box via `Object.freeze` (turn it off if you want), simple state selectors via `select()` and `createSelector()`, and automatic `entity` support with synchronized `ids`.

It follows a similar thought pattern to Redux and NGRX Store, however is implemented fully inside a single service.

# Installation

Install via `npm i @ultimate/lite-store`

---

Here's a quick look at the API to compare a typical reactive store you'd write yourself, versus using `@ultimate/lite-store`.

❌ *Using your own `BehaviorSubject`*:

```ts
@Injectable()
export class TodoService {
  private _state: BehaviorSubject<TodoState>;

  constructor() {
    this._state = new BehaviorSubject<TodoState>(initialState);
  }

  get state(): T {
    return this._state.getValue();
  }

  get state$(): Observable<T> {
    return this._state.asObservable()
  }

  get todos$() {
    return this.state$.pipe(
      map(state => state.todos),
      distinctUntilChanged()
    );
  }

  addTodo(todo) {
    const todos = [...this._state.todos, todo];

    this._state.next({
      ...this._state,
      todos
    });
  }
}
```

✅ *Using `@ultimate/lite-store`*:

```ts
@Injectable()
export class TodoService extends Store<TodoState> {
  constructor() {
    super(initialState);
  }

  get todos$(): Observable<Todo> {
    return this.select((state) => state.todos);
  }

  addTodo(todo) {
    this.setState((state) => ({
      todos: [...state.todos, todos]
    });
  }
}
```

Behind the scenes `@ultimate/lite-store` uses a `BehaviorSubject` to manage your state, and automatically spreads in your existing state (alleviating a bit of extra work) so you just merge your changes.

It ships with a simple `select()` method that supports a `string` or map `function` which returns an `Observable`.

# Documentation

### ✨ Store Instance

Import the `Store` abstract class and extend your service with it, calling `super` to pass in `initialState` and any `options`:

```ts
import { Store } from '@ultimate/lite-store';

export class TodoService extends Store<TodoState> {
  constructor() {
    super(<state>, <options>);
  }
}
```

Options are `freeze` and `entityId`, both optional.

```ts
type StoreOptions<T> = {
  freeze?: boolean;
  entityId?: EntityId<T>;
};
```

* `freeze` - defaults `true` and deep freezes your state recursively using `Object.freeze`
* `entityId` - defaults `'id'`, use to specify a custom entity property for flattened state

### ✨ Frozen State

State is frozen automatically using a recursive deep freeze function internally.

You don't need to enable it, but you can disable it per store like this:

```ts
const initialState = { todos: [] };

@Injectable()
export class TodoService extends Store<TodoState> {
  constructor() {
    super(initialState, { freeze: false }); // disable Object.freeze recursion
  }
}
```

### ✨ Select State

Use the `select()` method to get state from your store.

It returns an `Observable` which internally uses `distinctUntilChanged()`:

```ts
const initialState = { todos: [] };

@Injectable()
export class TodoService extends Store<TodoState> {
  get todos$(): Observable<Todo> {
    return this.select(state => state.todos);
  }

  //...
}
```

You can also use a `string` but a map function (as above) is recommended:

```ts
const initialState = { todos: [] };

@Injectable()
export class TodoService extends Store<TodoState> {
  get todos$(): Observable<Todo> {
    return this.select('todos');
  }

  //...
}
```

### ✨ Set State

Easily set state and merge existing state by calling `setState()`:

```ts
const initialState = { todos: [] };

@Injectable()
export class TodoService extends Store<TodoState> {
  addTodo(todo) {
    // update as many properties as you like
    this.setState((state) => ({
      todos: [...state.todos, todos]
    });
  }
}
```

All other state that exists is automatically merged, consider `setState` a partial state updater for just changes.

That means you _don't need to do this_:

```ts
const initialState = { todos: [] };

@Injectable()
export class TodoService extends Store<TodoState> {
  addTodo(todo) {
    this.setState((state) => ({
      ...state, // ❌ not needed, handled for you
      todos: [...state.todos, todos]
    });
  }
}
```

The `addTodo` method acts as your Action, and the object returned via `setState` acts as your pure function Reducer.

> 💥 View the [state unit tests](https://github.com/ultimatecourses/lite-store/blob/main/projects/lite-store/src/lib/test/lite-store.state.spec.ts) for more in-depth usage.

Each `setState()` call internally recomposes state and sets it as frozen each time via `Object.freeze()`.

The `setState` call also returns the new composed state, useful for debugging and logging:

```ts
const initialState = { todos: [] };

@Injectable()
export class TodoService extends Store<TodoState> {
  addTodo(todo) {
    // setState returns the new state, useful for debugging
    const newState = this.setState((state) => ({
      todos: [...state.todos, todos]
    });

    console.log(newState); // { todos: [...] }
  }
}
```

You can also access the static `state` snapshot any time:

```ts
const initialState = { todos: [] };

@Injectable()
export class TodoService extends Store<TodoState> {
  constructor() {
    super(initialState);
  }

  getCurrentState() {
    // static access of store state
    console.log(this.state); // { todos: [] }
  }
}
```

### ✨ Create Selectors

Selectors work the same as in NGRX Store and other libraries, so there's not much new to learn.

They return a slice of state and can be composed together, returning a projector function.

Here's an example of a selector that returns all `completed` items:

```ts
interface TodoState {
  todos: Todo[];
}

const initialState: TodoState = {
  todos: []
};

const getTodos = (state: TodoState) => state.todos;
const getCompletedTodos = (state: TodoState['todos']) => state.filter(todo => todo.completed);

@Injectable()
export class TodoService extends Store<TodoState> {
  get completedTodos() {
    return this.createSelector(
      getTodos,
      getCompletedTodos
    );
  }

  get todos$(): Observable<Todo> {
    return this.select(this.completedTodos);
  }

  constructor() {
    super(initialState);
  }
}
```

> 💥 View the [selector unit tests](https://github.com/ultimatecourses/lite-store/blob/main/projects/lite-store/src/lib/test/lite-store.selectors.spec.ts) for more in-depth usage.

### ✨ Entity and Ids

First-class, automatic support for `entities` creation and synchronization of `ids` is out-of-the-box alongside `StoreEntity`:

```ts
interface StoreEntity<E> {
  ids: string[];
  entities: { [id: string]: E };
}
```

Import and extend the `StoreEntity<T>` generic type:

```ts
import { Store, StoreEntity } from '@ultimate/lite-store';

interface Todo { title: string; id: string; completed: boolean; }

// automatically inherits `entities` and `ids` from StoreEntity<T>
interface TodoState extends StoreEntity<Todo> {
  // add any other state properties...
}

const initialState: TodoState = {
  ids: [], // string[]
  entities: {} // { [id: string]: Todo }
};
```

Extending `StoreEntity<T>` automatically adds `ids` and `entities` to your state interface, just both keys to your data structure.

Then, get your data and simply call `this.toEntities` on your data structure and pass it into `setState`.

> 💎 When passing an `entities` property, the `setState` method automatically generates new `ids` for you. When you update or delete an entity, the `ids` are recalculated as well.

```ts
@Injectable()
export class TodoService extends Store<TodoState> {
  constructor() {
    super(initialState);
  }

  loadTodos() {
    const todos = [
      { id: 'x7Jk90', title: 'Eat Pizza', completed: false },
      { id: 'fg118k', title: 'Get To Work', completed: false },
    ];

    /*
      {
        'x7Jk90': {
          id: 'x7Jk90', title: 'Eat Pizza', completed: false
        },
        'fg118k': {
          id: 'fg118k', title: 'Get To Work', completed: false
        }
      }
    */
    const entities = this.toEntities(todos);

    this.setState((state) => ({ entities }));

    /*
    {
      ids: ['x7Jk90', 'fg118k'],
      entities: {
        'x7Jk90': {
          id: 'x7Jk90', title: 'Eat Pizza', completed: false
        },
        'fg118k': {
          id: 'fg118k', title: 'Get To Work', completed: false
        }
      }
    }
    */
    console.log(this.state);
  }
}
```

You would then create a selector to fetch the `ids` for rendering each entity:

```ts
const getTodos = (state: TodoState) => state.ids.map(id => state.entities[id]));

@Injectable()
export class TodoService extends Store<TodoState> {
  get todos$(): Observable<Todo> {
    return this.select(getTodos);
  }

  constructor() {
    super(initialState);
  }

  loadTodos() {
    const todos = [
      { id: 'x7Jk90', title: 'Eat Pizza', completed: false },
      { id: 'fg118k', title: 'Get To Work', completed: false },
    ];

    const entities = this.toEntities(todos);

    this.setState((state) => ({
      entities
    }));
  }
}
```

To create/update an entity can be done like this, and removed via a spread operator trick:

```ts
@Injectable()
export class TodoService extends Store<TodoState> {
  constructor() {
    super(initialState);
  }

  createTodo(todo: Todo) {
    this.setState(({ entities }) => ({
      entities: {
        ...entities, // merge existing `entities`
        [todo.id]: todo // add new one
      }
    }));
  }

  removeTodo(id: string) {
    this.setState((state) => {
      // remove via id, spread rest of the entities
      const { [id]: removed, ...entities } = state.entities;

      return { entities };
    });
  }
}
```

If your data structure does not use `id`, for example `uid`, then you can specify a custom property override in the `constructor` for use when indexing `entities`:

```ts
@Injectable()
export class TodoService extends Store<TodoState> {
  constructor() {
    super(initialState, { entityId: 'uid' });
  }
}
```

This is also fully type safe and behind-the-scenes infers the correct types for you.

> 💥 View the [entity unit tests](https://github.com/ultimatecourses/lite-store/blob/main/projects/lite-store/src/lib/test/lite-store.entities.spec.ts) for more in-depth usage.

### ✨ Route Guards and Preloading

It's common practice to keep some loading/loaded indicator in your state tree.

Here's how to easily do this with your service and selectors - then we'll look at route guards:

```ts
interface TodoState {
  todos: Todo[];
  loaded: boolean;
}

const initialState: TodoState = {
  todos: [],
  loaded: false
};

const getTodos = (state: TodoState) => state.todos;
const getLoadedTodos = (state: TodoState) => state.loaded;

@Injectable()
export class TodoService extends Store<TodoState> {
  constructor() {
    super(initialState);
  }

  get todos$(): Observable<Todo[]> {
    return this.select(getTodos);
  }

  get loaded$(): Observable<boolean> {
    return this.select(getLoadedTodos);
  }

  async loadTodos() {
    try {
      const todos = await firstValueFrom(
        this.http.get<Todo[]>(
          `https://jsonplaceholder.typicode.com/users/1/todos`
        )
      );

      this.setState(() => ({
        todos,
        loaded: true,
      }));
    } catch (e) {
      console.log(e);
    }
  }
}
```

Here's an example using a route guard to ensure your data has loaded before navigating to the component.

Simply inject the service and `pipe()` off the `loaded$` Observable and check the `loaded` property:

```ts
import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { Observable, tap, of, filter, take, catchError } from 'rxjs';

import { TodoService } from '../services/todo.service';

@Injectable()
export class TodoGuard implements CanActivate {
  constructor(private todoService: TodoService) {}

  canActivate(): Observable<boolean> {
    return this.todoService.loaded$.pipe(
      tap((loaded) => loaded || this.todoService.loadTodos()),
      filter((loaded) => loaded),
      take(1),
      catchError(() => of(false))
    );
  }
}
```

### ✨ Destroy

You can kill all subscribers to your store by invoking the `destroy()` method at any time:

```ts
@Injectable()
export class TodoService extends Store<TodoState> {
  constructor() {
    super(initialState);

    this.destroy(); // kills all subscribers
  }
}
```

Internally this calls `Observable.complete()`, thus ending any further notifications to subscribers.

---

I'd recommend checking out the [full unit tests](https://github.com/ultimatecourses/lite-store/blob/main/projects/lite-store/src/lib/test/) to see further use cases.
