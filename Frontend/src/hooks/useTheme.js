import { useContext } from 'react'
import { ThemeContext } from '../context/theme-context.js'

export const useTheme = () => useContext(ThemeContext)
