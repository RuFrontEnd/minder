import tailwindConfig from './tailwind'

const cfg: any = tailwindConfig;
const tailwindColors = (cfg.theme?.colors || cfg.theme?.extend?.colors) as { [key: string]: any };

export { tailwindColors }