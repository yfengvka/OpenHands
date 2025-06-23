import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface IdeState {
  targetFilePathInVSCode: string | null;
  forceReloadKey: number;
}

const initialState: IdeState = {
  targetFilePathInVSCode: null,
  forceReloadKey: 0,
};

const ideSlice = createSlice({
  name: "ide",
  initialState,
  reducers: {
    setTargetFileInVSCode(state, action: PayloadAction<string | null>) {
      state.targetFilePathInVSCode = action.payload;
      state.forceReloadKey = Date.now(); // Update key to force re-render/reload
    },
    // Potentially add other IDE-related actions here
  },
});

export const { setTargetFileInVSCode } = ideSlice.actions;
export default ideSlice.reducer;

// Reminder for the developer:
// 1. Add this slice to the root reducer in your Redux store setup.
//    Example (in your store configuration file, e.g., store/index.ts):
//    import ideReducer from './ideSlice';
//    // ...
//    const rootReducer = combineReducers({
//      // ... other reducers
//      ide: ideReducer,
//    });

// 2. Update placeholder imports in:
//    - /workspace/OpenHands/frontend/src/routes/vscode-tab.tsx
//    - /workspace/OpenHands/frontend/src/components/features/markdown/paragraph.tsx
//    to: import { setTargetFileInVSCode } from '#/store/ideSlice'; // Or correct relative path based on your alias setup
