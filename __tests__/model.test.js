import { balloon } from '../src/index';

describe('model', () => {
  test('should run model', () => {
    const app = balloon();
    app.model({
      namespace: 'hello',
      state: {count: 0},
      reducers: {
        'COUNT_ADD': (state, {payload}) => {
          return Object.assign({}, state, {count: state.count + payload});
        }
      },
      actions: {
        addCount: ['COUNT_ADD']
      }
    });

    app.run();
    const {store, actions} = app;
    expect(store.getState().hello.count).toBe(0);
    store.dispatch(actions.addCount(4));
    expect(store.getState().hello.count).toBe(4);
  });

  test('should dynamic load model', () => {
    const app = balloon();
    app.model({
      namespace: 'a',
      state: {count: 0},
      reducers: {
        'COUNT_A_ADD': (state, {payload}) => {
          return Object.assign({}, state, {count: state.count + payload});
        }
      },
      actions: {
        addCountForA: ['COUNT_A_ADD']
      }
    });
    app.run();
    app.model({
      namespace: 'b',
      state: {count: 0},
      reducers: {
        'COUNT_B_ADD': (state, {payload}) => {
          return Object.assign({}, state, {count: state.count + payload});
        }
      },
      actions: {
        addCountForB: ['COUNT_B_ADD']
      }
    });
    const {store, actions} = app;

    expect(store.getState()).toEqual({a: {count: 0}, b: {count: 0}});
    store.dispatch(actions.addCountForB(4));
    expect(store.getState()).toEqual({a: {count: 0}, b: {count: 4}});
  });

  test('should unload model', () => {
    const app = balloon();
    expect(() => app.unmodel('a')).toThrow(/don't has this namespace/);

    app.model({
      namespace: 'a',
      state: {count: 0},
      reducers: {
        'COUNT_A_ADD': (state, {payload}) => {
          return Object.assign({}, state, {count: state.count + payload});
        }
      },
      actions: {
        addCountForA: ['COUNT_A_ADD']
      }
    });
    app.model({
      namespace: 'b',
      state: {count: 0},
      reducers: {
        'COUNT_B_ADD': (state, {payload}) => {
          return Object.assign({}, state, {count: state.count + payload});
        }
      },
      actions: {
        addCountForB: ['COUNT_B_ADD']
      }
    });
    app.run();
    const {store} = app;

    expect(app.actions).toHaveProperty('a.addCountForA');
    expect(store.getState()).toEqual({a: {count: 0}, b: {count: 0}});
    expect(app.models).toMatchObject([{namespace: 'a'}, {namespace: 'b'}]);
    app.unmodel('a');
    expect(app.actions).not.toHaveProperty('a.addCountForA');
    store.dispatch(app.actions.addCountForB(4));
    expect(app.store.getState()).toEqual({b: {count: 4}});
  });
});
