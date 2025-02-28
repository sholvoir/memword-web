import { render } from 'preact'
import '@sholvoir/components/tailwind.css'
import './index.css'
import 'virtual:uno.css'
import Root from './root.tsx'

render(<Root />, document.getElementById('root') as HTMLElement)