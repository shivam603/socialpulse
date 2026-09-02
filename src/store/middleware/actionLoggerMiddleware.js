import { logAction } from '../slices/uiSlice';

// Custom Action Logging Middleware (EXP 1.2.1)
// Logs actions to Redux state for real-time visualization in the State Inspector
export const actionLoggerMiddleware = (storeAPI) => (next) => (action) => {
  const result = next(action);

  // Avoid infinite loops when logging the logAction itself or component render counts
  if (
    action.type &&
    !action.type.startsWith('ui/logAction') &&
    !action.type.startsWith('ui/recordComponentRender')
  ) {
    try {
      storeAPI.dispatch(
        logAction({
          type: action.type,
          payload: typeof action.payload === 'object' && action.payload !== null
            ? (Array.isArray(action.payload) ? `[Array (${action.payload.length})]` : `{${Object.keys(action.payload).join(', ')}}`)
            : action.payload,
        })
      );
    } catch {
      // Ignore logging errors
    }
  }

  return result;
};
