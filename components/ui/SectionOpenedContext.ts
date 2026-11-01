import { createContext } from 'react';

/**
Resolves when the enclosing section is first opened (immediately if there isn't
one). Work that is only useful once the content is visible can wait for it.
*/
export const SectionOpenedContext = createContext(Promise.resolve());
