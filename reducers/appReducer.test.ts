import { describe, it, expect } from 'vitest';
import { appReducer, initialState } from './appReducer';

describe('appReducer', () => {
  it('should handle SET_SELECTED_COLUMN', () => {
    const action = { type: 'SET_SELECTED_COLUMN', payload: 'Town Name' } as const;
    const newState = appReducer(initialState, action);
    expect(newState.selectedColumn).toBe('Town Name');
  });

  it('should clear overrides on RESET_SESSION', () => {
    const stateWithData = { ...initialState, fileName: 'test.csv' };
    const action = { type: 'RESET_SESSION' } as const;
    const newState = appReducer(stateWithData, action);
    expect(newState.fileName).toBe('');
  });
});