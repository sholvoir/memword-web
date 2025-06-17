import { render } from 'preact'
import '../components/tailwind.css'
import './index.css'
import 'virtual:uno.css'
import Admin from './admin.tsx'

render(<Admin />, document.getElementById('root') as HTMLElement)