import resolveConfig from 'tailwindcss/resolveConfig'
import tailwindConfig from 'root/tailwind.config'

const fullConfig = resolveConfig(tailwindConfig)

export default fullConfig