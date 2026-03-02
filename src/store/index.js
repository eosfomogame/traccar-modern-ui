import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { sessionReducer as session } from './session';
import { devicesReducer as devices } from './devices';
import { eventsReducer as events } from './events';
import { geofencesReducer as geofences } from './geofences';
import { groupsReducer as groups } from './groups';
import { errorsReducer as errors } from './errors';

export { sessionActions } from './session';
export { devicesActions } from './devices';
export { eventsActions } from './events';
export { geofencesActions } from './geofences';
export { groupsActions } from './groups';
export { errorsActions } from './errors';

export default configureStore({
  reducer: combineReducers({ session, devices, events, geofences, groups, errors }),
});
