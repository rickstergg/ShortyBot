import 'temporal-polyfill/global';
import { vi } from 'vitest';

vi.spyOn(console, 'log').mockImplementation(() => {});
