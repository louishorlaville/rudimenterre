import type {Config} from '@react-router/dev/config';

export default {
  buildDirectory: 'dist',
  ssr: true,
  subResourceIntegrity: false,
  future: {
    v8_middleware: true,
    v8_splitRouteModules: true,
    unstable_optimizeDeps: true,
  },
} satisfies Config;
