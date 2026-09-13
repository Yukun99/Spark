import {
  useCallback,
  useEffect,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type KeyboardEvent,
} from 'react';

export type UsePageBarParams = {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
};

export type UsePageBarResult = {
  /** What the page field shows; may be empty while the user retypes it. */
  draft: string;
  first: boolean;
  last: boolean;
  goFirst: () => void;
  goPrevious: () => void;
  goNext: () => void;
  goLast: () => void;
  onDraftChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onDraftKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  onDraftBlur: () => void;
  onDraftFocus: (event: FocusEvent<HTMLInputElement>) => void;
};

/** Stepper buttons plus a page field that only ever holds a page in range, committed on Enter or blur. */
export const usePageBar = ({ page, pageCount, onChange }: UsePageBarParams): UsePageBarResult => {
  const [draft, setDraft] = useState(String(page));
  useEffect(() => setDraft(String(page)), [page]);

  const go = useCallback(
    (next: number) => {
      if (next !== page) onChange(next);
    },
    [onChange, page],
  );
  const goFirst = useCallback(() => go(1), [go]);
  const goPrevious = useCallback(() => go(page - 1), [go, page]);
  const goNext = useCallback(() => go(page + 1), [go, page]);
  const goLast = useCallback(() => go(pageCount), [go, pageCount]);

  const onDraftChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      if (value === '' || (/^\d+$/.test(value) && Number(value) >= 1 && Number(value) <= pageCount)) {
        setDraft(value);
      }
    },
    [pageCount],
  );
  const commit = useCallback(() => {
    if (draft === '') setDraft(String(page));
    else go(Number(draft));
  }, [draft, go, page]);
  const onDraftKeyDown = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') event.currentTarget.blur();
  }, []);
  const onDraftFocus = useCallback((event: FocusEvent<HTMLInputElement>) => event.target.select(), []);

  return {
    draft,
    first: page <= 1,
    last: page >= pageCount,
    goFirst,
    goPrevious,
    goNext,
    goLast,
    onDraftChange,
    onDraftKeyDown,
    onDraftBlur: commit,
    onDraftFocus,
  };
};
