import { createSlice } from '@reduxjs/toolkit';

const { reducer, actions } = createSlice({
  name: 'errors',
  initialState: { items: [] },
  reducers: {
    push(state, action) { state.items.push(action.payload); },
    pop(state)          { state.items.shift(); },
  },
});

export { actions as errorsActions };
export { reducer as errorsReducer };
