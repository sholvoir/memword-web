import { render } from 'preact'
import './tailwind.css'
import 'virtual:uno.css'
import './index.css'
import Home from './home.tsx'

render(<Home />, document.getElementById('root')!)
