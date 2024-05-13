import { defineConfig } from 'rollup';
import { buildConfig } from '../../scripts/build-config.mjs';

// 包名称：dnhyxc-cli
const configs = buildConfig({ packageName: 'dnhyxc-cli' });

export default defineConfig(configs);
