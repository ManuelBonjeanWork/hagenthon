import '@testing-library/jest-dom'
import { afterEach } from 'vitest'

// AppContext persiste il livello in localStorage: senza pulizia un test che chiama
// setLevel() inquina tutti quelli successivi, dentro e fuori dal proprio file.
afterEach(() => localStorage.clear())
