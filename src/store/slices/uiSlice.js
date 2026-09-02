import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activeView: 'composer', // 'composer' | 'board' | 'calendar' | 'analytics' | 'inspector' | 'admin'
  notification: null, // { message: string, type: 'success' | 'error' | 'info', id: number }
  profilerEnabled: true,
  calendarDate: new Date().toISOString(),
  renderStats: {
    totalRenders: 0,
    componentRenderCounts: {},
  },
  actionLog: [], // recent actions for live Redux inspector
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setActiveView: (state, action) => {
      state.activeView = action.payload;
    },
    showNotification: (state, action) => {
      const { message, type = 'success' } = typeof action.payload === 'string'
        ? { message: action.payload, type: 'success' }
        : action.payload;
      state.notification = {
        message,
        type,
        id: Date.now(),
      };
    },
    clearNotification: (state) => {
      state.notification = null;
    },
    toggleProfiler: (state) => {
      state.profilerEnabled = !state.profilerEnabled;
    },
    setCalendarDate: (state, action) => {
      state.calendarDate = action.payload;
    },
    incrementCalendarMonth: (state, action) => {
      const delta = action.payload || 1;
      const current = new Date(state.calendarDate);
      current.setMonth(current.getMonth() + delta);
      state.calendarDate = current.toISOString();
    },
    recordComponentRender: (state, action) => {
      const componentName = action.payload;
      state.renderStats.totalRenders += 1;
      state.renderStats.componentRenderCounts[componentName] =
        (state.renderStats.componentRenderCounts[componentName] || 0) + 1;
    },
    resetRenderStats: (state) => {
      state.renderStats = {
        totalRenders: 0,
        componentRenderCounts: {},
      };
    },
    logAction: (state, action) => {
      state.actionLog.unshift({
        type: action.payload.type,
        payload: action.payload.payload,
        timestamp: new Date().toLocaleTimeString(),
        id: 'act_' + Math.random().toString(36).slice(2, 7),
      });
      if (state.actionLog.length > 25) {
        state.actionLog.pop();
      }
    },
    clearActionLog: (state) => {
      state.actionLog = [];
    },
  },
});

export const {
  setActiveView,
  showNotification,
  clearNotification,
  toggleProfiler,
  setCalendarDate,
  incrementCalendarMonth,
  recordComponentRender,
  resetRenderStats,
  logAction,
  clearActionLog,
} = uiSlice.actions;

export const selectActiveView = (state) => state.ui.activeView;
export const selectNotification = (state) => state.ui.notification;
export const selectProfilerEnabled = (state) => state.ui.profilerEnabled;
export const selectCalendarDate = (state) => state.ui.calendarDate;
export const selectRenderStats = (state) => state.ui.renderStats;
export const selectActionLog = (state) => state.ui.actionLog;

export default uiSlice.reducer;
