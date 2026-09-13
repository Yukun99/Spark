import type { MouseEvent } from 'react';

/**
 * `onMouseDown` for a `FormControlLabel`: clicking the text would first move focus to the label
 * (blurring the control) and only then activate it. Keep focus on the control instead, so a
 * label click feels the same as clicking the radio or checkbox itself.
 */
export const focusLabelControl = (event: MouseEvent<HTMLLabelElement>) => {
  const control = event.currentTarget.querySelector('input');
  if (control === null) return;
  event.preventDefault();
  control.focus();
};
