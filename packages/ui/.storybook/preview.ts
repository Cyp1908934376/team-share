import type { Preview } from '@storybook/react'
import '../src/styles/global.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#FFFFFF' },
        { name: 'dark', value: '#1C1C1E' },
        { name: 'secondary', value: '#F2F2F7' },
      ],
    },
  },
}

export default preview
