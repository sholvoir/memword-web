import { defineConfig, presetWind3, presetIcons, transformerDirectives} from 'unocss';

export default defineConfig({
    presets: [presetIcons({
        cdn: 'https://esm.sh/',
        extraProperties: {
            'display': 'inline-block',
            'vertical-align': 'bottom'
        }
    }),
    presetWind3({ dark: 'media' })],
    shortcuts: {
        button: 'rounded-md px-2 border'
    },
    transformers: [ transformerDirectives() ]
})