import { createContext } from 'react';

/**
Whether the enclosing section has been opened at least once. Content that is
expensive to mount and only useful when visible can wait for it.
*/
export const SectionOpenedContext = createContext(true);
