import { render } from 'preact'
import '@unocss/reset/tailwind.css'
import 'virtual:uno.css'
import Root from './root.tsx'

render(<Root />, document.getElementById('root') as HTMLElement)