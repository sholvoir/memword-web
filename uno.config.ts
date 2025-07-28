import { defineConfig, presetWind4, presetIcons } from 'unocss';

export default defineConfig({
    presets: [
        presetIcons({
            cdn: 'https://esm.sh/',
            extraProperties: {
                'display': 'inline-block',
                'vertical-align': 'bottom'
            }
        }),
        presetWind4({
            preflights: {
                reset: true
            },
            dark: 'media'
        })
    ]
})