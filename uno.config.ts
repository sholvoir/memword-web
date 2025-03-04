import { defineConfig, presetWind3, presetIcons } from 'unocss';

export default defineConfig({
    presets: [presetIcons({
        cdn: 'https://esm.sh/',
        extraProperties: {
            'display': 'inline-block',
            'vertical-align': 'bottom'
        }
    }),
    presetWind3({ dark: 'media' })]
})