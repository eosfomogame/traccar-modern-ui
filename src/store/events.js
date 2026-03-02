import { createSlice } from '@reduxjs/toolkit';

const { reducer, actions } = createSlice({
  name: 'events',
  initialState: { items: [] },
  reducers: {
    add(state, action)   { state.items.unshift(...action.payload); },
    clear(state)         { state.items = []; },
  },
});

export { actions as eventsActions };
export { reducer as eventsReducer };
