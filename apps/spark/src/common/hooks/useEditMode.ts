import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleEditMode as toggleEditModeAction } from '@/store/layoutSlice';
import { useCallback } from 'react';

export type UseEditModeResult = {
  editMode: boolean;
  toggleEditMode: () => void;
};

export const useEditMode = (): UseEditModeResult => {
  const editMode = useAppSelector((state) => state.layout.editMode);
  const dispatch = useAppDispatch();
  const toggleEditMode = useCallback(() => dispatch(toggleEditModeAction()), [dispatch]);

  return { editMode, toggleEditMode };
};
